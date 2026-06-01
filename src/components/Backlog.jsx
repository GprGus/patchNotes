import { useState, useEffect } from "react";
import { KANBAN_COLS, PRIORITY_COLORS, TAG_COLORS } from "../constants.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { Avatar, Tag } from "./ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ALL_TAGS = Object.keys(TAG_COLORS);

function Modal({ title, onClose, children }) {
  const { C } = useTheme();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 480, padding: "24px 22px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSec, cursor: "pointer", fontSize: 16, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function KanbanCard({ item, onMove, onDelete, canEdit }) {
  const { C } = useTheme();
  const nextStatus = KANBAN_COLS[KANBAN_COLS.indexOf(item.status) + 1];

  return (
    <div
      style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "12px 14px", transition: "border-color 0.15s, background 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.background = C.cardHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border;      e.currentTarget.style.background = C.card;      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.45 }}>{item.title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 4, background: PRIORITY_COLORS[item.priority], boxShadow: `0 0 6px ${PRIORITY_COLORS[item.priority]}88` }} title={`Prioridade ${item.priority}`} />
          {canEdit && (
            <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 2px", lineHeight: 1, marginTop: 3 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.danger)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>✕</button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {item.tags.map((t) => <Tag key={t} label={t} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar name={item.assignee === "—" ? "ZZ" : item.assignee} size={22} />
          <span style={{ fontSize: 11, color: C.textSec }}>{item.assignee}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {item.version && <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "monospace" }}>{item.version}</span>}
          {nextStatus && canEdit && (
            <button onClick={() => onMove(item.id, nextStatus)}
              style={{ background: C.primaryGlow, border: `1px solid ${C.primary}33`, color: C.primary, borderRadius: 5, fontSize: 10, fontWeight: 700, padding: "3px 8px", cursor: "pointer", transition: "background 0.15s" }}>
              → {nextStatus.split(" ")[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Backlog() {
  const { C } = useTheme();
  const { authFetch, user } = useAuth();
  const isMobile = useIsMobile();
  const canEdit  = user?.role === "master" || user?.role === "developer";

  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formErr,  setFormErr]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ title: "", status: "Nova Ideia", tags: [], assignee: "", priority: "média", version: "" });

  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 11px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" };

  const colDot = { "Nova Ideia": C.textMuted, "Em Análise": C.warning, "Aprovado": C.success, "Em Desenvolvimento": C.primary };

  useEffect(() => {
    authFetch("/api/backlog").then((r) => r.json()).then((d) => setItems(d.items || [])).finally(() => setLoading(false));
  }, []);

  async function moveItem(id, newStatus) {
    const r = await authFetch(`/api/backlog/${id}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
    if (r.ok) { const { item } = await r.json(); setItems((prev) => prev.map((i) => (i.id === id ? item : i))); }
  }

  async function deleteItem(id) {
    if (!confirm("Excluir esta tarefa?")) return;
    const r = await authFetch(`/api/backlog/${id}`, { method: "DELETE" });
    if (r.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleTag(tag) {
    setForm((prev) => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag] }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) { setFormErr("Título é obrigatório"); return; }
    setSaving(true); setFormErr("");
    const r = await authFetch("/api/backlog", { method: "POST", body: JSON.stringify({ title: form.title.trim(), status: form.status, tags: form.tags, assignee: form.assignee.trim() || "—", priority: form.priority, version: form.version.trim() || null }) });
    const data = await r.json();
    setSaving(false);
    if (r.ok) { setItems((prev) => [data.item, ...prev]); setShowForm(false); setForm({ title: "", status: "Nova Ideia", tags: [], assignee: "", priority: "média", version: "" }); }
    else setFormErr(data.error || "Erro ao criar tarefa");
  }

  const pad = isMobile ? "16px 14px" : "20px 24px";

  return (
    <div style={{ padding: pad, height: isMobile ? "auto" : "100%", overflowX: isMobile ? "visible" : "auto" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, color: C.text }}>Backlog de Desenvolvimento</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec }}>{loading ? "Carregando…" : `${items.length} itens · Área interna`}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 20, flexWrap: "wrap" }}>
          {!isMobile && KANBAN_COLS.map((col) => {
            const count = items.filter((i) => i.status === col).length;
            return (
              <div key={col} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: col === "Em Desenvolvimento" ? C.primary : C.text }}>{count}</div>
                <div style={{ fontSize: 10, color: C.textMuted, whiteSpace: "nowrap" }}>{col}</div>
              </div>
            );
          })}
          {canEdit && (
            <button onClick={() => { setFormErr(""); setShowForm(true); }}
              style={{ background: C.primary, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>
              + Nova Tarefa
            </button>
          )}
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>Carregando backlog…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(240px, 1fr))", gap: 14, alignItems: "start", minWidth: isMobile ? "auto" : 960 }}>
          {KANBAN_COLS.map((col) => {
            const colItems = items.filter((i) => i.status === col);
            return (
              <div key={col}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "7px 12px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: colDot[col], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textSec, flex: 1 }}>{col}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, background: C.card, borderRadius: 10, padding: "1px 7px" }}>{colItems.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {colItems.map((item) => (
                    <KanbanCard key={item.id} item={item} onMove={moveItem} onDelete={deleteItem} canEdit={canEdit} />
                  ))}
                  {colItems.length === 0 && (
                    <div style={{ border: `1px dashed ${C.border}`, borderRadius: 8, padding: "24px 16px", textAlign: "center", color: C.textMuted, fontSize: 12 }}>Nenhum item</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal title="Nova Tarefa" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>TÍTULO *</label>
              <input style={inputStyle} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Descreva a tarefa" required autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>COLUNA</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  {KANBAN_COLS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>PRIORIDADE</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                  <option value="alta">Alta</option>
                  <option value="média">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>RESPONSÁVEL</label>
                <input style={inputStyle} value={form.assignee} onChange={(e) => setForm((p) => ({ ...p, assignee: e.target.value }))} placeholder="Ex: Lucas M." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>VERSÃO</label>
                <input style={inputStyle} value={form.version} onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))} placeholder="Ex: v2.3.0" />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 8, letterSpacing: "0.04em" }}>TAGS</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ALL_TAGS.map((tag) => {
                  const selected = form.tags.includes(tag);
                  const s = TAG_COLORS[tag];
                  return (
                    <button type="button" key={tag} onClick={() => toggleTag(tag)}
                      style={{ background: selected ? s.bg : "transparent", color: selected ? s.color : C.textMuted, border: `1px solid ${selected ? s.border : C.border}`, borderRadius: 4, fontSize: 11, fontWeight: 600, padding: "3px 9px", cursor: "pointer", transition: "all 0.1s" }}>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
            {formErr && <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 7, padding: "9px 13px", marginBottom: 14, fontSize: 13, color: C.danger }}>{formErr}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 13, padding: "8px 18px", cursor: "pointer" }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ background: C.primary, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 20px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Criando…" : "Criar tarefa"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
