import { useState, useEffect } from "react";
import { WRITING_STEPS } from "../constants.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { useAuth } from "../context/AuthContext.jsx";

function statusColor(s, C) {
  if (s === "Publicado")  return C.success;
  if (s === "Em Redação") return C.warning;
  return C.accent;
}

const formatDate      = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const formatDateShort = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

function WritingProgress({ current }) {
  const { C } = useTheme();
  const idx = WRITING_STEPS.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
      {WRITING_STEPS.map((step, i) => {
        const done = i < idx, active = i === idx;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < WRITING_STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? C.success : active ? C.primary : C.card, border: `2px solid ${done ? C.success : active ? C.primary : C.border}`, fontSize: 12, fontWeight: 700, color: done || active ? "#fff" : C.textMuted, transition: "all 0.25s", boxShadow: active ? `0 0 12px ${C.primary}55` : "none", flexShrink: 0 }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 9, color: active ? C.primary : done ? C.success : C.textMuted, fontWeight: active ? 700 : 500, whiteSpace: "nowrap", textAlign: "center", maxWidth: 72, letterSpacing: "0.02em" }}>{step}</span>
            </div>
            {i < WRITING_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? C.success : C.border, margin: "0 4px", marginBottom: 18, transition: "background 0.3s", borderRadius: 1, minWidth: 8 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EditableSection({ label, color, items, onItemsChange, editing }) {
  const { C } = useTheme();
  const [newText, setNewText] = useState("");
  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 11px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" };

  function addItem() {
    if (!newText.trim()) return;
    onItemsChange([...items, { id: `${Date.now()}`, text: newText.trim() }]);
    setNewText("");
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{label}</div>
        <span style={{ fontSize: 11, color: C.textMuted }}>({items.length})</span>
      </div>
      {items.length === 0 && !editing ? (
        <div style={{ fontSize: 13, color: C.textMuted }}>—</div>
      ) : (
        items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 7 }} />
            <span style={{ fontSize: 13, color: C.textSec, lineHeight: 1.55, flex: 1 }}>{item.text}</span>
            {editing && (
              <button onClick={() => onItemsChange(items.filter((i) => i.id !== item.id))}
                style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.danger)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>✕</button>
            )}
          </div>
        ))
      )}
      {editing && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Adicionar item…" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
          <button onClick={addItem} style={{ background: C.primaryGlow, border: `1px solid ${C.primary}33`, borderRadius: 7, color: C.primary, fontSize: 12, fontWeight: 700, padding: "0 14px", cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</button>
        </div>
      )}
    </div>
  );
}

function NovaVersaoModal({ onClose, onCreated, authFetch }) {
  const { C } = useTheme();
  const [form, setForm]   = useState({ version: "", date: "", name: "", highlight: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 11px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" };

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setError("");
    const r = await authFetch("/api/releases", { method: "POST", body: JSON.stringify(form) });
    const data = await r.json(); setSaving(false);
    if (r.ok) { onCreated(data.release); onClose(); } else setError(data.error || "Erro ao criar versão");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 460, padding: "24px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Nova Versão</span>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSec, cursor: "pointer", fontSize: 16, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>VERSÃO *</label>
              <input style={inputStyle} value={form.version} onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))} placeholder="v2.4.0" required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>DATA *</label>
              <input style={inputStyle} type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>NOME DA VERSÃO *</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Ciclo Outono" required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" }}>HIGHLIGHT</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={form.highlight} onChange={(e) => setForm((p) => ({ ...p, highlight: e.target.value }))} placeholder="Descreva o principal destaque desta versão…" />
          </div>
          {error && <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 7, padding: "9px 13px", marginBottom: 14, fontSize: 13, color: C.danger }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 13, padding: "8px 18px", cursor: "pointer" }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ background: C.primary, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 20px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Criando…" : "Criar versão"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReleaseManagement() {
  const { C } = useTheme();
  const { authFetch, user } = useAuth();
  const isMobile = useIsMobile();
  const canEdit  = user?.role === "master" || user?.role === "developer";

  const [releases,   setReleases]   = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(false);
  const [draft,      setDraft]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [showDetail, setShowDetail] = useState(false); // mobile: show detail panel

  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "8px 11px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" };

  useEffect(() => {
    authFetch("/api/releases").then((r) => r.json()).then((d) => {
      const list = d.releases || [];
      setReleases(list);
      if (list.length) setSelected(list[0]);
    }).finally(() => setLoading(false));
  }, []);

  function startEdit()  { setDraft({ ...selected }); setEditing(true); }
  function cancelEdit() { setDraft(null); setEditing(false); }

  async function saveEdit() {
    setSaving(true);
    const r = await authFetch(`/api/releases/${draft.version}`, { method: "PUT", body: JSON.stringify({ date: draft.date, name: draft.name, highlight: draft.highlight, novidades: draft.novidades, melhorias: draft.melhorias, correcoes: draft.correcoes, writing_status: draft.writing_status }) });
    const data = await r.json(); setSaving(false);
    if (r.ok) { setReleases((prev) => prev.map((r) => r.version === data.release.version ? data.release : r)); setSelected(data.release); setEditing(false); setDraft(null); }
  }

  async function advanceStep() {
    const currentIdx = WRITING_STEPS.indexOf(selected.writing_status);
    if (currentIdx >= WRITING_STEPS.length - 1) return;
    const next = WRITING_STEPS[currentIdx + 1];
    const r = await authFetch(`/api/releases/${selected.version}`, { method: "PUT", body: JSON.stringify({ writing_status: next }) });
    const data = await r.json();
    if (r.ok) { setReleases((prev) => prev.map((r) => r.version === data.release.version ? data.release : r)); setSelected(data.release); if (editing) setDraft(data.release); }
  }

  const cur        = editing ? draft : selected;
  const totalItems = (r) => r ? r.novidades.length + r.melhorias.length + r.correcoes.length : 0;

  const VersionList = (
    <div style={{ borderRight: isMobile ? "none" : `1px solid ${C.border}`, background: C.surface, overflowY: "auto", padding: "16px 12px", ...(isMobile ? {} : { width: 280, flexShrink: 0 }) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingLeft: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em" }}>VERSÕES</span>
        {canEdit && (
          <button onClick={() => setShowModal(true)} style={{ background: C.primaryGlow, border: `1px solid ${C.primary}33`, borderRadius: 5, color: C.primary, fontSize: 10, fontWeight: 700, padding: "3px 8px", cursor: "pointer" }}>+ Nova</button>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", color: C.textMuted, fontSize: 13, padding: "20px 0" }}>Carregando…</div>
      ) : (
        releases.map((r) => {
          const isSel = r.version === cur?.version;
          return (
            <button key={r.version} onClick={() => { setSelected(r); if (editing) setDraft(r); if (isMobile) setShowDetail(true); }}
              style={{ width: "100%", background: isSel ? C.primaryGlow : "transparent", border: isSel ? `1px solid ${C.primary}44` : "1px solid transparent", borderRadius: 8, padding: "10px 12px", cursor: "pointer", textAlign: "left", marginBottom: 4, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isSel ? C.primary : C.text, fontFamily: "monospace" }}>{r.version}</span>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(r.status, C) }} />
              </div>
              <div style={{ fontSize: 12, color: C.textSec }}>{r.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: C.textMuted }}>{formatDateShort(r.date)}</span>
                <span style={{ fontSize: 10, color: statusColor(r.status, C) }}>{r.status}</span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  const DetailPanel = cur ? (
    <div style={{ overflowY: "auto", padding: isMobile ? "16px" : "24px 28px", flex: 1 }}>
      {isMobile && (
        <button onClick={() => setShowDetail(false)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 12, padding: "6px 12px", cursor: "pointer", marginBottom: 16 }}>
          ← Voltar
        </button>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            {editing ? (
              <>
                <input style={{ ...inputStyle, width: 100, fontFamily: "monospace", fontSize: 20, fontWeight: 800, padding: "4px 8px" }} value={draft.version} disabled />
                <input style={{ ...inputStyle, fontSize: 14, padding: "4px 8px", flex: 1 }} value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Nome da versão" />
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: C.text, fontFamily: "monospace" }}>{cur.version}</h2>
                <span style={{ fontSize: 14, color: C.textSec }}>{cur.name}</span>
              </>
            )}
          </div>
          <div style={{ fontSize: 13, color: C.textSec }}>
            {editing ? (
              <span>Deploy: <input style={{ ...inputStyle, display: "inline", width: "auto", padding: "2px 8px", fontSize: 13 }} type="date" value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} /></span>
            ) : (
              <>Deploy planejado: <span style={{ color: C.accent, fontWeight: 600 }}>{formatDate(cur.date)}</span></>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1 }}>{totalItems(cur)}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>itens</div>
          </div>
          {canEdit && !editing && <button onClick={startEdit} style={{ background: C.primaryGlow, border: `1px solid ${C.primary}44`, borderRadius: 7, color: C.primary, fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>Editar</button>}
          {editing && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={cancelEdit} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 12, padding: "7px 14px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveEdit} disabled={saving} style={{ background: C.success, border: "none", borderRadius: 7, color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 14px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Salvando…" : "Salvar"}</button>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em" }}>STATUS DE REDAÇÃO</span>
          {canEdit && WRITING_STEPS.indexOf(cur.writing_status) < WRITING_STEPS.length - 1 && (
            <button onClick={advanceStep} style={{ background: C.primaryGlow, border: `1px solid ${C.primary}33`, borderRadius: 5, color: C.primary, fontSize: 10, fontWeight: 700, padding: "3px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>Avançar →</button>
          )}
        </div>
        <WritingProgress current={cur.writing_status} />
      </div>

      {/* Highlight */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>HIGHLIGHT DESTA VERSÃO</div>
        {editing ? (
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70, lineHeight: 1.6 }} value={draft.highlight} onChange={(e) => setDraft((p) => ({ ...p, highlight: e.target.value }))} placeholder="Descreva o principal destaque desta versão…" />
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: C.textSec, lineHeight: 1.65, fontStyle: "italic" }}>"{cur.highlight || "—"}"</p>
        )}
      </div>

      <EditableSection label="🚀 Novidades" color={C.primary} items={cur.novidades} editing={editing} onItemsChange={(items) => setDraft((p) => ({ ...p, novidades: items }))} />
      <EditableSection label="✨ Melhorias" color={C.accent}  items={cur.melhorias} editing={editing} onItemsChange={(items) => setDraft((p) => ({ ...p, melhorias: items }))} />
      <EditableSection label="🛠 Correções"  color={C.danger}  items={cur.correcoes} editing={editing} onItemsChange={(items) => setDraft((p) => ({ ...p, correcoes: items }))} />
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: C.textMuted, fontSize: 14 }}>Selecione uma versão</div>
  );

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        {showDetail ? DetailPanel : VersionList}
        {showModal && <NovaVersaoModal onClose={() => setShowModal(false)} authFetch={authFetch} onCreated={(r) => { setReleases((prev) => [r, ...prev]); setSelected(r); }} />}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {VersionList}
      {DetailPanel}
      {showModal && <NovaVersaoModal onClose={() => setShowModal(false)} authFetch={authFetch} onCreated={(r) => { setReleases((prev) => [r, ...prev]); setSelected(r); }} />}
    </div>
  );
}
