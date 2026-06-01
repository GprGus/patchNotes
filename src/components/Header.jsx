import { useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { Avatar } from "./ui.jsx";

const ALL_TABS = [
  { id: "public",  label: "Release Notes", shortLabel: "Releases", icon: "◉" },
  { id: "backlog", label: "Backlog",        shortLabel: "Backlog",  icon: "⬡" },
  { id: "release", label: "Gerenciamento",  shortLabel: "Gerenc.",  icon: "◈" },
  { id: "admin",   label: "Usuários",       shortLabel: "Users",    icon: "⊕" },
];

const ROLE_LABELS = { master: "Master", developer: "Dev", viewer: "Viewer" };

export default function Header({ tab, setTab, allowedTabs }) {
  const { C, theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = ALL_TABS.filter((t) => allowedTabs.includes(t.id));
  const roleColor = user?.role === "master" ? C.purple : user?.role === "developer" ? C.primary : C.textSec;
  const roleDim   = user?.role === "master" ? C.purpleDim : user?.role === "developer" ? C.primaryGlow : "rgba(123,150,186,0.1)";

  const themeBtn = (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 15, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );

  if (isMobile) {
    return (
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", height: 52 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: "monospace", flexShrink: 0 }}>
            LS
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>Light System</span>
          {themeBtn}
          {user && <Avatar name={user.name} size={30} />}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 18, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {menuOpen ? "✕" : "≡"}
          </button>
        </div>

        <div style={{ display: "flex", overflowX: "auto", padding: "0 10px 8px", gap: 4, scrollbarWidth: "none" }}>
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{ background: active ? C.primaryGlow : "transparent", border: active ? `1px solid ${C.primary}44` : "1px solid transparent", color: active ? C.primary : C.textSec, borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: active ? 600 : 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}
              >
                <span style={{ fontSize: 10 }}>{t.icon}</span>
                {t.shortLabel}
              </button>
            );
          })}
        </div>

        {menuOpen && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 16px", background: C.surface }}>
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Avatar name={user.name} size={34} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{user.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: roleColor, background: roleDim, borderRadius: 3, padding: "1px 5px" }}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              style={{ width: "100%", background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 7, color: C.danger, fontSize: 13, padding: "9px", cursor: "pointer", fontWeight: 600 }}
            >
              Sair
            </button>
          </div>
        )}
      </header>
    );
  }

  return (
    <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", height: 56, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 24, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>
          LS
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "0.03em", lineHeight: 1 }}>Light System</div>
          <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginTop: 2 }}>PATCH NOTES</div>
        </div>
      </div>

      <nav style={{ display: "flex", gap: 2, flex: 1 }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ background: active ? C.primaryGlow : "transparent", border: active ? `1px solid ${C.primary}44` : "1px solid transparent", color: active ? C.primary : C.textSec, borderRadius: 7, padding: "6px 14px", fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s", whiteSpace: "nowrap" }}
            >
              <span style={{ fontSize: 11 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {themeBtn}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={user.name} size={30} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1 }}>{user.name.split(" ")[0]}</div>
              <span style={{ fontSize: 9, fontWeight: 700, color: roleColor, background: roleDim, borderRadius: 3, padding: "1px 5px", letterSpacing: "0.06em" }}>
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 12, padding: "5px 12px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.danger; e.currentTarget.style.color = C.danger; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec; }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
