import { useTheme } from "../context/ThemeContext.jsx";
import { TAG_COLORS } from "../constants.js";

export function Avatar({ name, size = 28 }) {
  const { theme } = useTheme();
  const safe     = name === "—" ? "ZZ" : name;
  const initials = safe.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const hue      = (safe.charCodeAt(0) * 37 + (safe.charCodeAt(1) || 0) * 13) % 360;
  const isDark   = theme === "dark";
  const bg     = isDark ? `hsl(${hue},45%,20%)` : `hsl(${hue},40%,88%)`;
  const border = isDark ? `hsl(${hue},50%,35%)` : `hsl(${hue},40%,70%)`;
  const color  = isDark ? `hsl(${hue},75%,70%)` : `hsl(${hue},55%,30%)`;

  return (
    <div
      style={{ width: size, height: size, borderRadius: "50%", background: bg, border: `1.5px solid ${border}`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.37, fontWeight: 700, flexShrink: 0, userSelect: "none" }}
      title={name}
    >
      {name === "—" ? "?" : initials}
    </div>
  );
}

export function Tag({ label }) {
  const { C } = useTheme();
  const s = TAG_COLORS[label] || { bg: C.accentDim, color: C.accent, border: `${C.accent}50` };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 4, fontSize: 10, fontWeight: 700, padding: "2px 7px", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

export function Badge({ text, color, dim }) {
  const { C } = useTheme();
  const c = color || C.primary;
  const d = dim   || C.primaryGlow;
  return (
    <span style={{ background: d, color: c, border: `1px solid ${c}44`, borderRadius: 4, fontSize: 10, fontWeight: 800, padding: "2px 8px", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}
