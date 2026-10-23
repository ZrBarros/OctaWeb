import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { EventDetail } from "@/data/event-details";
import { apiServer } from "@/lib/server-api";
import { ApiError, type ApiEvent, type ApiItem } from "@/lib/api-types";
import { EventAttendancePage } from "./event-attendance-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try { const { data } = await apiServer<ApiItem<ApiEvent>>(`/events/${encodeURIComponent(slug)}`); return { title: `${data.titulo} | Agenda Octacore` }; }
  catch { return { title: "Evento não encontrado | Octacore" }; }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let data: ApiEvent;
  try { data = (await apiServer<ApiItem<ApiEvent>>(`/events/${encodeURIComponent(slug)}`)).data; }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const date = new Date(data.dataHora);
  const event: EventDetail = { slug: data.slug, title: data.titulo, modality: data.modalidade?.nome ?? "Octacore", category: data.tipo, dateTime: data.dataHora, displayDate: new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Maceio" }).format(date), place: data.local, confirmedCount: 0, description: data.descricao ?? "", heroImage: data.imagemUrl ?? undefined, confirmedAthletes: [] };
  return <EventAttendancePage event={event} />;
}
