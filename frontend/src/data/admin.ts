// Valores e atividades copiados como referência visual do Figma.
// Este painel não consulta usuários, vendas ou pedidos reais.
export const adminMetrics = [
  { label: "Usuários cadastrados", value: "1.240", detail: "+12% esta semana", tone: "orange", icon: "users" },
  { label: "Produtos cadastrados", value: "32", detail: "+2 novos este mês", tone: "purple", icon: "products" },
  { label: "Pedidos pendentes", value: "14", detail: "Requer atenção rápida", tone: "orange", icon: "orders" },
  { label: "Eventos próximos", value: "3", detail: "Dentro dos próximos 15 dias", tone: "mint", icon: "events" },
  { label: "Notícias publicadas", value: "84", detail: "+5 publicadas no mês", tone: "white", icon: "news" },
] as const;

export const demoSales = [
  { month: "Jan", amount: 450 },
  { month: "Fev", amount: 800 },
  { month: "Mar", amount: 650 },
  { month: "Abr", amount: 1000 },
  { month: "Mai", amount: 750 },
  { month: "Jun", amount: 1400 },
];

export const adminActivities = [
  { description: "Resultado registrado: Futsal Masculino venceu o Carcará por 4x1", person: "Carlos Silva", time: "Há 10 min" },
  { description: "Novo integrante cadastrado: Maria Júlia (Vôlei Feminino)", person: "Arthur A.", time: "Há 45 min" },
  { description: "Produto ‘Tirante Oficial’ teve estoque alterado de 50 para 45", person: "Loja Bot", time: "Há 2h" },
  { description: "Notícia publicada: ‘Seletiva de Vôlei no Sábado’", person: "Marketing Div.", time: "Há 4h" },
  { description: "Evento ‘Churrasco de Integração’ atualizado com novo local", person: "Eventos Sec.", time: "Ontem" },
];
