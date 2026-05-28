export const INITIAL_BACKLOG = [
  {
    id: 1,
    title: "Dashboard financeiro redesenhado",
    status: "Em Desenvolvimento",
    tags: ["Alto Impacto", "UI/UX"],
    assignee: "Lucas M.",
    priority: "alta",
    version: "v2.3.0",
  },
  {
    id: 2,
    title: "Exportação de relatórios em PDF",
    status: "Aprovado",
    tags: ["UI/UX"],
    assignee: "Fernanda C.",
    priority: "média",
    version: "v2.3.0",
  },
  {
    id: 3,
    title: "Bug no cálculo de ICMS em pedidos parcelados",
    status: "Em Análise",
    tags: ["Correção Crítica", "Back-end"],
    assignee: "Rafael S.",
    priority: "alta",
    version: null,
  },
  {
    id: 4,
    title: "Integração com NFe 4.0",
    status: "Nova Ideia",
    tags: ["Integração", "Back-end"],
    assignee: "—",
    priority: "alta",
    version: null,
  },
  {
    id: 5,
    title: "Filtro avançado na tela de pedidos",
    status: "Aprovado",
    tags: ["UI/UX"],
    assignee: "Fernanda C.",
    priority: "média",
    version: "v2.3.0",
  },
  {
    id: 6,
    title: "API REST de consulta de estoque em tempo real",
    status: "Em Desenvolvimento",
    tags: ["Back-end", "Integração"],
    assignee: "Rafael S.",
    priority: "alta",
    version: "v2.3.0",
  },
  {
    id: 7,
    title: "Módulo de autenticação por dois fatores",
    status: "Em Análise",
    tags: ["Segurança"],
    assignee: "Lucas M.",
    priority: "alta",
    version: null,
  },
  {
    id: 8,
    title: "Cache de consultas frequentes no Auto Flex",
    status: "Nova Ideia",
    tags: ["Performance", "Back-end"],
    assignee: "—",
    priority: "média",
    version: null,
  },
  {
    id: 9,
    title: "App mobile para consulta de pedidos",
    status: "Nova Ideia",
    tags: ["Mobile", "UI/UX"],
    assignee: "—",
    priority: "baixa",
    version: null,
  },
  {
    id: 10,
    title: "Modo escuro no Multi System Visual",
    status: "Em Análise",
    tags: ["UI/UX"],
    assignee: "Fernanda C.",
    priority: "média",
    version: null,
  },
];

export const RELEASES = [
  {
    version: "v2.3.0",
    date: "2026-06-20",
    name: "Ciclo Verão",
    status: "Em Redação",
    writingStatus: "Revisão Técnica",
    highlight:
      "Redesign completo do dashboard financeiro com novos KPIs em tempo real e exportação nativa para PDF.",
    novidades: [
      {
        id: "n1",
        text: "Dashboard financeiro com KPIs em tempo real — receita, inadimplência e margem",
      },
      {
        id: "n2",
        text: "API REST pública de consulta de estoque com autenticação por token",
      },
    ],
    melhorias: [
      {
        id: "m1",
        text: "Exportação de relatórios agora suporta PDF, XLSX e CSV simultaneamente",
      },
      {
        id: "m2",
        text: "Filtros avançados na tela de pedidos com salvamento de preferências",
      },
      {
        id: "m3",
        text: "Tempo de carregamento do módulo fiscal reduzido em 40%",
      },
    ],
    correcoes: [],
  },
  {
    version: "v2.2.1",
    date: "2026-05-10",
    name: "Hotfix NFe",
    status: "Publicado",
    writingStatus: "Publicado",
    highlight:
      "Correção crítica no emissor de NFe 3.10 que causava rejeição no SEFAZ em notas com múltiplos destinatários.",
    novidades: [],
    melhorias: [
      {
        id: "m4",
        text: "Mensagem de erro do SEFAZ agora exibe código e descrição completos",
      },
    ],
    correcoes: [
      {
        id: "c1",
        text: "Correção crítica: NFe rejeitada pelo SEFAZ em notas com mais de um destinatário",
      },
      {
        id: "c2",
        text: "Cálculo de ICMS-ST incorreto em operações interestaduais para MG e PE",
      },
      {
        id: "c3",
        text: "Sessão expirava mesmo com atividade contínua no painel",
      },
    ],
  },
  {
    version: "v2.2.0",
    date: "2026-04-08",
    name: "Simples+ 3.0",
    status: "Publicado",
    writingStatus: "Publicado",
    highlight:
      "Grande atualização do módulo Simples+ com nova engine fiscal compatível com as regras de 2026.",
    novidades: [
      {
        id: "n3",
        text: "Módulo Simples+ 3.0: engine fiscal completamente reescrita para 2026",
      },
      {
        id: "n4",
        text: "Painel de auditoria tributária com histórico dos últimos 12 meses",
      },
    ],
    melhorias: [
      {
        id: "m5",
        text: "Interface de cadastro de clientes unificada entre Auto Flex e Multi System",
      },
      {
        id: "m6",
        text: "Busca inteligente com sugestões por nome, CNPJ ou código interno",
      },
    ],
    correcoes: [
      {
        id: "c4",
        text: "Importação de XML de fornecedores falhava para arquivos acima de 5 MB",
      },
      {
        id: "c5",
        text: "Campo de data de entrega não respeitava fuso horário configurado",
      },
    ],
  },
  {
    version: "v2.1.0",
    date: "2026-02-14",
    name: "Conectividade",
    status: "Publicado",
    writingStatus: "Publicado",
    highlight:
      "Lançamento das integrações com Mercado Pago, Bling e WooCommerce.",
    novidades: [
      {
        id: "n5",
        text: "Integração nativa com Mercado Pago para pagamentos e split",
      },
      {
        id: "n6",
        text: "Conector com Bling ERP para sincronização bidirecional de estoque",
      },
      {
        id: "n7",
        text: "Plugin WooCommerce para e-commerce integrado ao Auto Flex",
      },
    ],
    melhorias: [
      {
        id: "m7",
        text: "Webhooks agora com retry automático e log de falhas",
      },
    ],
    correcoes: [
      {
        id: "c6",
        text: "Relatório de vendas por período gerava totais duplicados em alguns casos",
      },
    ],
  },
];
