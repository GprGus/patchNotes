import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useIsMobile } from "../../hooks/useIsMobile.js";
import { Avatar } from "../ui.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function Modal({ title, onClose, children }) {
  const { C } = useTheme();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 460, padding: "24px 22px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textSec, cursor: "pointer", fontSize: 16, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const { C } = useTheme();
  const map = {
    master:    { label: "MASTER",      color: C.purple,  dim: C.purpleDim },
    developer: { label: "DEV",         color: C.primary, dim: C.primaryGlow },
    viewer:    { label: "VIEWER",      color: C.textSec, dim: "rgba(123,150,186,0.1)" },
  };
  const r = map[role] || map.viewer;
  return (
    <span style={{ background: r.dim, color: r.color, border: `1px solid ${r.color}44`, borderRadius: 5, fontSize: 10, fontWeight: 700, padding: "2px 8px", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
      {r.label}
    </span>
  );
}

function UserForm({ initial, onSubmit, onClose, loading, error, isEdit }) {
  const { C } = useTheme();
  const [form, setForm] = useState({ name: initial?.name || "", email: initial?.email || "", password: "", role: initial?.role || "viewer", active: initial?.active !== undefined ? !!initial.active : true });
  const inputStyle = { width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 5, letterSpacing: "0.04em" };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Nome completo</label>
        <input style={inputStyle} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nome do usuário" required />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>E-mail</label>
        <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@lightsystem.com.br" required />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>{isEdit ? "Nova senha (deixe em branco para não alterar)" : "Senha"}</label>
        <input style={inputStyle} type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"} required={!isEdit} minLength={form.password ? 6 : undefined} />
      </div>
      <div style={{ marginBottom: isEdit ? 14 : 20 }}>
        <label style={labelStyle}>Perfil de acesso</label>
        <select style={{ ...inputStyle, cursor: "pointer" }} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
          <option value="master">Master</option>
          <option value="developer">Desenvolvedor</option>
          <option value="viewer">Visualizador</option>
        </select>
      </div>
      {isEdit && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} style={{ width: 15, height: 15, cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: C.textSec }}>Conta ativa</span>
          </label>
        </div>
      )}
      {error && <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 7, padding: "9px 13px", marginBottom: 14, fontSize: 13, color: C.danger }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 13, padding: "8px 18px", cursor: "pointer" }}>Cancelar</button>
        <button type="submit" disabled={loading} style={{ background: C.primary, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 20px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar usuário"}
        </button>
      </div>
    </form>
  );
}

export default function UserManagement() {
  const { C } = useTheme();
  const { user: me, authFetch } = useAuth();
  const isMobile = useIsMobile();
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(null);
  const [formErr,       setFormErr]       = useState("");
  const [saving,        setSaving]        = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const r    = await authFetch("/api/users");
    const data = await r.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function handleCreate(form) {
    setSaving(true); setFormErr("");
    const r    = await authFetch("/api/users", { method: "POST", body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }) });
    const data = await r.json(); setSaving(false);
    if (r.ok) { setUsers((prev) => [data.user, ...prev]); setModal(null); } else setFormErr(data.error || "Erro ao criar usuário");
  }

  async function handleEdit(form) {
    if (!modal?.edit) return;
    setSaving(true); setFormErr("");
    const body = { name: form.name, email: form.email, role: form.role, active: form.active };
    if (form.password) body.password = form.password;
    const r    = await authFetch(`/api/users/${modal.edit.id}`, { method: "PUT", body: JSON.stringify(body) });
    const data = await r.json(); setSaving(false);
    if (r.ok) { setUsers((prev) => prev.map((u) => (u.id === modal.edit.id ? data.user : u))); setModal(null); } else setFormErr(data.error || "Erro ao salvar");
  }

  async function handleDelete(userId) {
    const r    = await authFetch(`/api/users/${userId}`, { method: "DELETE" });
    const data = await r.json();
    if (r.ok) setUsers((prev) => prev.filter((u) => u.id !== userId)); else alert(data.error || "Erro ao excluir");
    setConfirmDelete(null);
  }

  const formatDate = (d) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div style={{ padding: isMobile ? "16px 14px" : "24px 28px", overflowY: "auto", height: isMobile ? "auto" : "100%" }}>
      <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", marginBottom: 22, gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, color: C.text }}>Gerenciamento de Usuários</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec }}>{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <button onClick={() => { setFormErr(""); setModal("create"); }}
          style={{ background: C.primary, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, padding: "9px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          + Novo Usuário
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted, fontSize: 14 }}>Carregando usuários…</div>
      ) : isMobile ? (
        /* Mobile: card layout */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar name={u.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>
                    {u.name}{u.id === me?.id && <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 6 }}>(você)</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{u.email}</div>
                </div>
                <RoleBadge role={u.role} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: u.active ? C.success : C.danger }}>{u.active ? "Ativo" : "Inativo"}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>desde {formatDate(u.created_at)}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setFormErr(""); setModal({ edit: u }); }} style={{ background: C.primaryGlow, border: `1px solid ${C.primary}33`, borderRadius: 5, color: C.primary, fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer" }}>Editar</button>
                  {u.id !== me?.id && <button onClick={() => setConfirmDelete(u)} style={{ background: C.dangerDim, border: `1px solid ${C.danger}33`, borderRadius: 5, color: C.danger, fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer" }}>Excluir</button>}
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontSize: 13 }}>Nenhum usuário encontrado</div>}
        </div>
      ) : (
        /* Desktop: table layout */
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2.5fr 1fr 1fr 1fr 100px", padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.card }}>
            {["Usuário", "E-mail", "Perfil", "Status", "Cadastrado", "Ações"].map((h) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>
          {users.map((u) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 2.5fr 1fr 1fr 1fr 100px", padding: "13px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center", transition: "background 0.1s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.card)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={u.name} size={28} />
                <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{u.name}{u.id === me?.id && <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6 }}>(você)</span>}</span>
              </div>
              <span style={{ fontSize: 12, color: C.textSec }}>{u.email}</span>
              <RoleBadge role={u.role} />
              <span style={{ fontSize: 11, fontWeight: 600, color: u.active ? C.success : C.danger }}>{u.active ? "Ativo" : "Inativo"}</span>
              <span style={{ fontSize: 11, color: C.textMuted }}>{formatDate(u.created_at)}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setFormErr(""); setModal({ edit: u }); }} style={{ background: C.primaryGlow, border: `1px solid ${C.primary}33`, borderRadius: 5, color: C.primary, fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer" }}>Editar</button>
                {u.id !== me?.id && <button onClick={() => setConfirmDelete(u)} style={{ background: C.dangerDim, border: `1px solid ${C.danger}33`, borderRadius: 5, color: C.danger, fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer" }}>Excluir</button>}
              </div>
            </div>
          ))}
          {users.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontSize: 13 }}>Nenhum usuário encontrado</div>}
        </div>
      )}

      {modal === "create" && <Modal title="Novo Usuário" onClose={() => setModal(null)}><UserForm onSubmit={handleCreate} onClose={() => setModal(null)} loading={saving} error={formErr} isEdit={false} /></Modal>}
      {modal?.edit && <Modal title="Editar Usuário" onClose={() => setModal(null)}><UserForm initial={modal.edit} onSubmit={handleEdit} onClose={() => setModal(null)} loading={saving} error={formErr} isEdit={true} /></Modal>}
      {confirmDelete && (
        <Modal title="Confirmar exclusão" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize: 14, color: C.textSec, marginBottom: 20, lineHeight: 1.6 }}>
            Tem certeza que deseja excluir <strong style={{ color: C.text }}>{confirmDelete.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setConfirmDelete(null)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textSec, fontSize: 13, padding: "8px 18px", cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => handleDelete(confirmDelete.id)} style={{ background: C.danger, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 20px", cursor: "pointer" }}>Excluir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
