import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eventDetails } from "@/data/event-details";
import { EventAttendancePage } from "./event-attendance-page";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return eventDetails.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = eventDetails.find((item) => item.slug === slug);
  return { title: event ? `${event.title} | Agenda Octacore` : "Evento não encontrado | Octacore" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const event = eventDetails.find((item) => item.slug === slug);
  if (!event) notFound();
  return <EventAttendancePage event={event} />;
}
