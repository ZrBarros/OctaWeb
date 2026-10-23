import { describe, expect, it } from "vitest";
import { registerSchema } from "../src/modules/auth/auth.schemas.js";
import { createOrderSchema, productInputSchema } from "../src/modules/store/store.schemas.js";

describe("validação de entrada", () => {
  it("normaliza e-mail no cadastro", () => {
    const result = registerSchema.parse({ name: "Maria Souza", email: "MARIA@EXAMPLE.COM", course: "Computação", password: "SenhaForte1" });
    expect(result.email).toBe("maria@example.com");
  });

  it("rejeita senha fraca", () => {
    expect(() => registerSchema.parse({ name: "Maria Souza", email: "maria@example.com", course: "Computação", password: "abcdefgh" })).toThrow();
  });

  it("rejeita produto sem variação", () => {
    expect(() => productInputSchema.parse({ name: "Camisa", priceCents: 5990, category: "CAMISAS", variations: [] })).toThrow();
  });

  it("normaliza telefone do pedido", () => {
    const order = createOrderSchema.parse({ contactName: "Maria Souza", contactPhone: "(82) 99999-9999", pickupMethod: "CAMPUS", items: [{ variationId: 1, quantity: 2 }] });
    expect(order.contactPhone).toBe("82999999999");
  });
});
