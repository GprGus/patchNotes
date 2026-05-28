import { C } from "../constants.js";
import { Avatar } from "./ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ALL_TABS = [
  { id: "public",   label: "Release Notes",  icon: "◉" },
  { id: "backlog",  label: "Backlog",         icon: "⬡" },
  { id: "release",  label: "Gerenciamento",   icon: "◈" },
  { id: "admin",    label: "Usuários",        icon: "⊕" },
];

const ROLE_LABELS = {
  master:    "Master",
  developer: "Dev",
  viewer:    "Viewer",
};

const ROLE_COLORS = {
  master:    { color: "#8B5CF6", dim: "rgba(139,92,246,0.12)" },
  developer: { color: C.primary, dim: C.primaryGlow },
  viewer:    { color: C.textSec,  dim: "rgba(123,150,186,0.1)" },
};

export default function Header({ tab, setTab, allowedTabs }) {
  const { user, logout } = useAuth();
  const tabs = ALL_TABS.filter((t) => allowedTabs.includes(t.id));
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.viewer;

  return (
    <header
      style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "0 20px",
        height: 56,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 28, flexShrink: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "monospace",
            flexShrink: 0,
          }}
        >
          LS
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "0.03em", lineHeight: 1 }}>
            Light System
          </div>
          <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginTop: 2 }}>
            PATCH NOTES
          </div>
        </div>
      </div>

      {/* Tabs dinâmicas por role */}
      <nav style={{ display: "flex", gap: 2, flex: 1 }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: active ? C.primaryGlow : "transparent",
                border: active ? `1px solid ${C.primary}44` : "1px solid transparent",
                color: active ? C.primary : C.textSec,
                borderRadius: 7,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "all 0.15s",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 11 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Usuário logado + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={user.name} size={30} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1 }}>
                {user.name.split(" ")[0]}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: roleStyle.color,
                  background: roleStyle.dim,
                  borderRadius: 3,
                  padding: "1px 5px",
                  letterSpacing: "0.06em",
                }}
              >
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Sair"
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            color: C.textSec,
            fontSize: 12,
            padding: "5px 12px",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.danger;
            e.currentTarget.style.color = C.danger;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.color = C.textSec;
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
