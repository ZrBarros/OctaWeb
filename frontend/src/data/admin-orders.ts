// Pedidos fictícios do quadro administrativo do Figma; não são criados pelo checkout.
export const orderStatuses = ["Pendente", "Confirmado", "Em separação", "Disponível para retirada", "Entregue", "Cancelado"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export type AdminOrderItem = {
  name: string;
  detail?: string;
  quantity: number;
  unitPriceCents: number;
};

export type AdminOrder = {
  number: string;
  customer: string;
  date: string;
  status: OrderStatus;
  items: AdminOrderItem[];
};

export function orderTotalCents(order: AdminOrder): number {
  return order.items.reduce((total, item) => total + item.quantity * item.unitPriceCents, 0);
}

export const adminOrders: AdminOrder[] = [
  { number: "1032", customer: "João Silva", date: "2026-09-24", status: "Pendente", items: [
    { name: "Camisa Especial Octacore", detail: "Tamanho M", quantity: 1, unitPriceCents: 5990 },
    { name: "Tirante Octacore", quantity: 2, unitPriceCents: 1500 },
  ] },
  { number: "1031", customer: "Maria Clara", date: "2026-09-23", status: "Confirmado", items: [
    { name: "Camisa Passeio 2026", detail: "Tamanho G", quantity: 1, unitPriceCents: 6990 },
  ] },
  { number: "1030", customer: "Rodrigo Lins", date: "2026-09-22", status: "Entregue", items: [
    { name: "Caneca Octacore", quantity: 1, unitPriceCents: 4500 },
  ] },
  { number: "1029", customer: "Júlia Costa", date: "2026-09-22", status: "Cancelado", items: [
    { name: "Tirante Octacore", quantity: 1, unitPriceCents: 1500 },
  ] },
];
