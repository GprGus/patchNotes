import { C, TAG_COLORS } from "../constants.js";

export function Avatar({ name, size = 28 }) {
  const safe = name === "—" ? "ZZ" : name;
  const initials = safe
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hue = (safe.charCodeAt(0) * 37 + (safe.charCodeAt(1) || 0) * 13) % 360;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue},50%,22%)`,
        border: `1.5px solid hsl(${hue},55%,38%)`,
        color: `hsl(${hue},80%,72%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.37,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: "inherit",
        userSelect: "none",
      }}
      title={name}
    >
      {name === "—" ? "?" : initials}
    </div>
  );
}

export function Tag({ label }) {
  const s = TAG_COLORS[label] || {
    bg: C.accentDim,
    color: C.accent,
    border: "rgba(14,165,233,0.3)",
  };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 7px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function Badge({ text, color = C.primary, dim = C.primaryGlow }) {
  return (
    <span
      style={{
        background: dim,
        color,
        border: `1px solid ${color}44`,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 800,
        padding: "2px 8px",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}
