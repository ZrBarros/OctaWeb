import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { notFound, unprocessable } from "../../lib/errors.js";

const imageTypes = {
  "image/jpeg": { extension: "jpg", signatures: [[0xff, 0xd8, 0xff]] },
  "image/png": { extension: "png", signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]] },
  "image/webp": { extension: "webp", signatures: [[0x52, 0x49, 0x46, 0x46]] },
} as const;

function hasSignature(buffer: Buffer, signatures: readonly (readonly number[])[]) {
  return signatures.some((signature) => signature.every((byte, index) => buffer[index] === byte));
}

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAdmin);
  app.post("/images", async (request, reply) => {
    const file = await request.file({ limits: { files: 1, fileSize: app.env.MAX_UPLOAD_BYTES } });
    if (!file) throw unprocessable("Envie uma imagem no campo file.");
    const imageType = imageTypes[file.mimetype as keyof typeof imageTypes];
    if (!imageType) throw unprocessable("Formato inválido. Use JPG, PNG ou WebP.");
    const buffer = await file.toBuffer();
    if (buffer.length > app.env.MAX_UPLOAD_BYTES) throw unprocessable(`A imagem deve ter no máximo ${app.env.MAX_UPLOAD_BYTES} bytes.`);
    if (!hasSignature(buffer, imageType.signatures)) throw unprocessable("O conteúdo do arquivo não corresponde ao formato informado.");
    if (file.mimetype === "image/webp" && buffer.subarray(8, 12).toString("ascii") !== "WEBP") throw unprocessable("Arquivo WebP inválido.");
    const filename = `${randomUUID()}.${imageType.extension}`;
    const directory = path.resolve(app.env.UPLOAD_DIR);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
    return reply.code(201).send({ data: { url: `${app.env.PUBLIC_API_URL}/uploads/${filename}`, mimeType: file.mimetype, size: buffer.length } });
  });
}

export async function publicUploadRoutes(app: FastifyInstance) {
  app.get<{ Params: { filename: string } }>("/:filename", async (request, reply) => {
    const match = /^([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.(jpg|png|webp)$/i.exec(request.params.filename);
    if (!match) throw notFound("Imagem");
    const extension = match[2]!.toLocaleLowerCase();
    const mime = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    const filepath = path.join(path.resolve(app.env.UPLOAD_DIR), request.params.filename);
    try { await access(filepath); } catch { throw notFound("Imagem"); }
    reply.header("X-Content-Type-Options", "nosniff").header("Cache-Control", "public, max-age=2592000, immutable").type(mime);
    return reply.send(createReadStream(filepath));
  });
}
