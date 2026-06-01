import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { Badge } from "./ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function isNew(dateStr, lastVisit) {
  return dateStr > (lastVisit || "1970-01-01");
}

function HighlightText({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return <>{text.slice(0, idx)}<mark>{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>;
}

function ChangeList({ label, color, items, query }) {
  const { C } = useTheme();
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 7, letterSpacing: "0.04em" }}>{label}</div>
      {items.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 12px", borderRadius: 7, marginBottom: 4, background: C.card, border: `1px solid ${C.border}` }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 7 }} />
          <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.55 }}><HighlightText text={item.text} query={query} /></span>
        </div>
      ))}
    </div>
  );
}

export default function PublicNotes() {
  const { C } = useTheme();
  const { user, authFetch, updateUser } = useAuth();
  const isMobile = useIsMobile();

  const [releases,   setReleases]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [lastVisit,  setLastVisit]  = useState(user?.last_visit || null);
  const [markedRead, setMarkedRead] = useState(false);

  useEffect(() => {
    authFetch("/api/releases").then((r) => r.json()).then((d) => setReleases(d.releases || [])).finally(() => setLoading(false));
  }, []);

  const published = releases.filter((r) => r.status === "Publicado");
  const latest    = published[0];
  const newCount  = published.filter((r) => isNew(r.date, lastVisit) && !markedRead).length;

  const filtered = published.filter((r) => {
    if (filter !== "all" && r.version !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.version.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || [...r.novidades, ...r.melhorias, ...r.correcoes].some((i) => i.text.toLowerCase().includes(q));
    }
    return true;
  });

  async function markRead() {
    const r = await authFetch("/api/auth/mark-read", { method: "PUT" });
    if (r.ok) { const data = await r.json(); setLastVisit(data.last_visit); setMarkedRead(true); updateUser({ last_visit: data.last_visit }); }
  }

  const formatDate      = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const formatDateShort = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const heroPad   = isMobile ? "18px 16px" : "28px 40px";
  const searchPad = isMobile ? "10px 16px" : "14px 40px";
  const listPad   = isMobile ? "16px" : "24px 40px";

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 200, color: C.textMuted, fontSize: 14 }}>
      Carregando release notes…
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: isMobile ? "auto" : "100%" }}>
      {/* Hero */}
      {latest && (
        <div style={{ background: `linear-gradient(145deg, ${C.surface} 0%, ${C.card} 60%, ${C.surface} 100%)`, borderBottom: `1px solid ${C.border}`, padding: heroPad, position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.primaryGlow} 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16, position: "relative" }}>
            <div style={{ maxWidth: isMobile ? "100%" : 560 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <Badge text="NOVO" color={C.success} dim={C.successDim} />
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "monospace" }}>{latest.version} · {formatDate(latest.date)}</span>
              </div>
              <h1 style={{ margin: "0 0 8px", fontSize: isMobile ? 20 : 26, fontWeight: 800, color: C.text }}>{latest.name}</h1>
              <p style={{ margin: "0 0 16px", fontSize: 14, color: C.textSec, lineHeight: 1.65 }}>{latest.highlight}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Novidades", count: latest.novidades.length, color: C.primary },
                  { label: "Melhorias", count: latest.melhorias.length, color: C.accent  },
                  { label: "Correções", count: latest.correcoes.length, color: C.danger  },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", textAlign: "center", minWidth: 72 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.count}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {!markedRead && newCount > 0 ? (
              <div style={{ flexShrink: 0 }}>
                <div style={{ background: C.warningDim, border: `1px solid ${C.warning}44`, borderRadius: 9, padding: "12px 16px", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: C.warning, fontWeight: 700 }}>{newCount} versão(ões) nova(s)</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>desde {lastVisit ? new Date(lastVisit + "T12:00:00").toLocaleDateString("pt-BR") : "seu cadastro"}</div>
                </div>
                <button onClick={markRead} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSec, fontSize: 12, padding: "7px 14px", cursor: "pointer", width: "100%" }}>
                  ✓ Marcar tudo como lido
                </button>
              </div>
            ) : markedRead ? (
              <div style={{ background: C.successDim, border: `1px solid ${C.success}44`, borderRadius: 9, padding: "12px 16px", flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: C.success }}>✓ Tudo marcado como lido</div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Busca */}
      <div style={{ padding: searchPad, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: isMobile ? "100%" : "auto", maxWidth: isMobile ? "100%" : 420 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 15, pointerEvents: "none" }}>⌕</span>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar em todas as versões…"
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px 8px 34px", color: C.text, fontSize: 13, outline: "none" }}
          />
        </div>
        <select
          value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, padding: "8px 12px", outline: "none", cursor: "pointer", maxWidth: isMobile ? "100%" : "auto", flex: isMobile ? 1 : "none" }}
        >
          <option value="all">Todas as versões</option>
          {published.map((r) => <option key={r.version} value={r.version}>{r.version} — {r.name}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>{filtered.length} versão(ões)</span>
      </div>

      {/* Lista */}
      <div style={{ overflowY: isMobile ? "visible" : "auto", padding: listPad, flex: 1 }}>
        <div style={{ maxWidth: 840 }}>
          {filtered.map((r) => {
            const releaseIsNew = isNew(r.date, lastVisit) && !markedRead;
            return (
              <div key={r.version} style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: C.text, fontFamily: "monospace" }}>{r.version}</span>
                  <span style={{ fontSize: 13, color: C.textSec }}>{r.name}</span>
                  {releaseIsNew && <Badge text="NOVO" color={C.success} dim={C.successDim} />}
                  <div style={{ flex: 1, height: 1, background: C.border, minWidth: 20 }} />
                  <span style={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap", fontFamily: "monospace" }}>{formatDateShort(r.date)}</span>
                </div>
                <ChangeList label="🚀 Novidades" color={C.primary} items={r.novidades} query={search} />
                <ChangeList label="✨ Melhorias" color={C.accent}   items={r.melhorias} query={search} />
                <ChangeList label="🛠 Correções"  color={C.danger}   items={r.correcoes} query={search} />
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>◌</div>
              <div style={{ fontSize: 15 }}>Nenhum resultado para "<span style={{ color: C.textSec }}>{search}</span>"</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
