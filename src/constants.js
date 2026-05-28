export const C = {
  bg: "#060D1B",
  surface: "#0B1628",
  card: "#0F1E35",
  cardHover: "#132440",
  border: "#1A2D48",
  borderLight: "#223558",
  primary: "#2563EB",
  primaryHover: "#1D4ED8",
  primaryGlow: "rgba(37,99,235,0.15)",
  accent: "#0EA5E9",
  accentDim: "rgba(14,165,233,0.12)",
  text: "#DDE8F8",
  textSec: "#7B96BA",
  textMuted: "#3C5270",
  success: "#10B981",
  successDim: "rgba(16,185,129,0.12)",
  warning: "#F59E0B",
  warningDim: "rgba(245,158,11,0.12)",
  danger: "#EF4444",
  dangerDim: "rgba(239,68,68,0.12)",
  purple: "#8B5CF6",
  purpleDim: "rgba(139,92,246,0.12)",
};

export const TAG_COLORS = {
  "Alto Impacto":     { bg: "rgba(139,92,246,0.1)",  color: "#8B5CF6", border: "rgba(139,92,246,0.3)" },
  "Correção Crítica": { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", border: "rgba(239,68,68,0.3)"  },
  "UI/UX":            { bg: "rgba(14,165,233,0.12)", color: "#0EA5E9", border: "rgba(14,165,233,0.3)" },
  "Back-end":         { bg: "rgba(16,185,129,0.1)",  color: "#10B981", border: "rgba(16,185,129,0.3)" },
  "Integração":       { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" },
  "Segurança":        { bg: "rgba(239,68,68,0.1)",   color: "#F87171", border: "rgba(239,68,68,0.2)"  },
  "Performance":      { bg: "rgba(16,185,129,0.1)",  color: "#34D399", border: "rgba(52,211,153,0.3)" },
  "Mobile":           { bg: "rgba(139,92,246,0.1)",  color: "#A78BFA", border: "rgba(167,139,250,0.3)"},
};

export const PRIORITY_COLORS = {
  alta: "#EF4444",
  média: "#F59E0B",
  baixa: "#10B981",
};

export const KANBAN_COLS = [
  "Nova Ideia",
  "Em Análise",
  "Aprovado",
  "Em Desenvolvimento",
];

export const WRITING_STEPS = [
  "Rascunho",
  "Revisão Técnica",
  "Revisão de Marketing",
  "Pronto para Publicar",
  "Publicado",
];

/** Data de última visita simulada — em produção viria de localStorage ou do backend */
export const LAST_VISIT_DATE = "2026-04-20";
