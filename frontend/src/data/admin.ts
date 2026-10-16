// Valores e atividades copiados como referência visual do Figma.
// Este painel não consulta usuários, vendas ou pedidos reais.
export const adminMetrics = [
  { label: "Usuários cadastrados", value: "1.240", detail: "+12% esta semana", tone: "orange", icon: "users", href: "/admin/integrantes", action: "Ver integrantes" },
  { label: "Produtos cadastrados", value: "32", detail: "+2 novos este mês", tone: "purple", icon: "products", href: "/admin/produtos", action: "Ver produtos" },
  { label: "Pedidos pendentes", value: "14", detail: "Requer atenção rápida", tone: "orange", icon: "orders", href: "/admin/pedidos", action: "Ver pedidos" },
  { label: "Eventos próximos", value: "3", detail: "Dentro dos próximos 15 dias", tone: "mint", icon: "events", href: "/admin/eventos", action: "Ver eventos" },
  { label: "Notícias publicadas", value: "84", detail: "+5 publicadas no mês", tone: "white", icon: "news", href: "/admin/noticias", action: "Ver notícias" },
] as const;

export const demoSales = [
  { month: "Nov", amount: 520 },
  { month: "Dez", amount: 980 },
  { month: "Jan", amount: 450 },
  { month: "Fev", amount: 800 },
  { month: "Mar", amount: 650 },
  { month: "Abr", amount: 1000 },
  { month: "Mai", amount: 750 },
  { month: "Jun", amount: 1400 },
  { month: "Jul", amount: 1170 },
  { month: "Ago", amount: 1550 },
  { month: "Set", amount: 1300 },
  { month: "Out", amount: 1800 },
];

export const adminActivities = [
  { description: "Resultado registrado: Futsal Masculino venceu o Carcará por 4x1", person: "Carlos Silva", time: "Há 10 min", category: "Resultados" },
  { description: "Novo integrante cadastrado: Maria Júlia (Vôlei Feminino)", person: "Arthur A.", time: "Há 45 min", category: "Integrantes" },
  { description: "Produto ‘Tirante Oficial’ teve estoque alterado de 50 para 45", person: "Loja Bot", time: "Há 2h", category: "Produtos" },
  { description: "Notícia publicada: ‘Seletiva de Vôlei no Sábado’", person: "Marketing Div.", time: "Há 4h", category: "Notícias" },
  { description: "Evento ‘Churrasco de Integração’ atualizado com novo local", person: "Eventos Sec.", time: "Ontem", category: "Eventos" },
];
