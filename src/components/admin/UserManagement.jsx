import { useState, useEffect } from "react";
import { C } from "../../constants.js";
import { Avatar } from "../ui.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLES = [
  { value: "master",    label: "Master",       color: C.purple,  dim: C.purpleDim },
  { value: "developer", label: "Desenvolvedor", color: C.primary, dim: C.primaryGlow },
  { value: "viewer",    label: "Visualizador",  color: C.textSec, dim: `rgba(123,150,186,0.1)` },
];

const inputStyle = {
  width: "100%",
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  padding: "9px 12px",
  color: C.text,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: C.textSec,
  marginBottom: 5,
  letterSpacing: "0.04em",
};

function RoleBadge({ role }) {
  const r = ROLES.find((x) => x.value === role) || ROLES[2];
  return (
    <span
      style={{
        background: r.dim,
        color: r.color,
        border: `1px solid ${r.color}44`,
        borderRadius: 5,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {r.label.toUpperCase()}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          width: "100%",
          maxWidth: 460,
          padding: "24px 28px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.textSec,
              cursor: "pointer",
              fontSize: 16,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UserForm({ initial, onSubmit, onClose, loading, error, isEdit }) {
  const [form, setForm] = useState({
    name:     initial?.name     || "",
    email:    initial?.email    || "",
    password: "",
    role:     initial?.role     || "viewer",
    active:   initial?.active !== undefined ? !!initial.active : true,
  });

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
    >
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Nome completo</label>
        <input
          style={inputStyle}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Nome do usuário"
          required
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>E-mail</label>
        <input
          style={inputStyle}
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="email@lightsystem.com.br"
          required
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>
          {isEdit ? "Nova senha (deixe em branco para não alterar)" : "Senha"}
        </label>
        <input
          style={inputStyle}
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"}
          required={!isEdit}
          minLength={form.password ? 6 : undefined}
        />
      </div>

      <div style={{ marginBottom: isEdit ? 14 : 20 }}>
        <label style={labelStyle}>Perfil de acesso</label>
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {isEdit && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              style={{ width: 15, height: 15, cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: C.textSec }}>Conta ativa</span>
          </label>
        </div>
      )}

      {error && (
        <div
          style={{
            background: C.dangerDim,
            border: `1px solid ${C.danger}44`,
            borderRadius: 7,
            padding: "9px 13px",
            marginBottom: 14,
            fontSize: 13,
            color: C.danger,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            color: C.textSec,
            fontSize: 13,
            padding: "8px 18px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: C.primary,
            border: "none",
            borderRadius: 7,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 20px",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar usuário"}
        </button>
      </div>
    </form>
  );
}

export default function UserManagement() {
  const { user: me, authFetch } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | 'create' | { edit: user }
  const [formErr, setFormErr] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const r = await authFetch("/api/users");
    const data = await r.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function handleCreate(form) {
    setSaving(true);
    setFormErr("");
    const r = await authFetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    });
    const data = await r.json();
    setSaving(false);
    if (r.ok) {
      setUsers((prev) => [data.user, ...prev]);
      setModal(null);
    } else {
      setFormErr(data.error || "Erro ao criar usuário");
    }
  }

  async function handleEdit(form) {
    if (!modal?.edit) return;
    setSaving(true);
    setFormErr("");
    const body = {
      name:   form.name,
      email:  form.email,
      role:   form.role,
      active: form.active,
    };
    if (form.password) body.password = form.password;

    const r = await authFetch(`/api/users/${modal.edit.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    const data = await r.json();
    setSaving(false);
    if (r.ok) {
      setUsers((prev) => prev.map((u) => (u.id === modal.edit.id ? data.user : u)));
      setModal(null);
    } else {
      setFormErr(data.error || "Erro ao salvar");
    }
  }

  async function handleDelete(userId) {
    const r = await authFetch(`/api/users/${userId}`, { method: "DELETE" });
    const data = await r.json();
    if (r.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      alert(data.error || "Erro ao excluir usuário");
    }
    setConfirmDelete(null);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("pt-BR");
  }

  return (
    <div style={{ padding: "24px 28px", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>
            Gerenciamento de Usuários
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec }}>
            {users.length} usuário(s) cadastrado(s)
          </p>
        </div>
        <button
          onClick={() => { setFormErr(""); setModal("create"); }}
          style={{
            background: C.primary,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            padding: "9px 18px",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          + Novo Usuário
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted, fontSize: 14 }}>
          Carregando usuários…
        </div>
      ) : (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2.5fr 1fr 1fr 1fr 100px",
              padding: "10px 20px",
              borderBottom: `1px solid ${C.border}`,
              background: C.card,
            }}
          >
            {["Usuário", "E-mail", "Perfil", "Status", "Cadastrado", "Ações"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.textMuted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.5fr 1fr 1fr 1fr 100px",
                padding: "13px 20px",
                borderBottom: `1px solid ${C.border}`,
                alignItems: "center",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.card)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Nome */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={u.name} size={28} />
                <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>
                  {u.name}
                  {u.id === me?.id && (
                    <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6 }}>(você)</span>
                  )}
                </span>
              </div>

              {/* Email */}
              <span style={{ fontSize: 12, color: C.textSec }}>{u.email}</span>

              {/* Role */}
              <RoleBadge role={u.role} />

              {/* Status */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: u.active ? C.success : C.danger,
                }}
              >
                {u.active ? "Ativo" : "Inativo"}
              </span>

              {/* Data */}
              <span style={{ fontSize: 11, color: C.textMuted }}>{formatDate(u.created_at)}</span>

              {/* Ações */}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => { setFormErr(""); setModal({ edit: u }); }}
                  style={{
                    background: C.primaryGlow,
                    border: `1px solid ${C.primary}33`,
                    borderRadius: 5,
                    color: C.primary,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Editar
                </button>
                {u.id !== me?.id && (
                  <button
                    onClick={() => setConfirmDelete(u)}
                    style={{
                      background: C.dangerDim,
                      border: `1px solid ${C.danger}33`,
                      borderRadius: 5,
                      color: C.danger,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontSize: 13 }}>
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      )}

      {/* Modal: criar usuário */}
      {modal === "create" && (
        <Modal title="Novo Usuário" onClose={() => setModal(null)}>
          <UserForm
            onSubmit={handleCreate}
            onClose={() => setModal(null)}
            loading={saving}
            error={formErr}
            isEdit={false}
          />
        </Modal>
      )}

      {/* Modal: editar usuário */}
      {modal?.edit && (
        <Modal title="Editar Usuário" onClose={() => setModal(null)}>
          <UserForm
            initial={modal.edit}
            onSubmit={handleEdit}
            onClose={() => setModal(null)}
            loading={saving}
            error={formErr}
            isEdit={true}
          />
        </Modal>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <Modal title="Confirmar exclusão" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize: 14, color: C.textSec, marginBottom: 20, lineHeight: 1.6 }}>
            Tem certeza que deseja excluir o usuário{" "}
            <strong style={{ color: C.text }}>{confirmDelete.name}</strong>? Esta ação não pode
            ser desfeita.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => setConfirmDelete(null)}
              style={{
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 7,
                color: C.textSec,
                fontSize: 13,
                padding: "8px 18px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => handleDelete(confirmDelete.id)}
              style={{
                background: C.danger,
                border: "none",
                borderRadius: 7,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 20px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
