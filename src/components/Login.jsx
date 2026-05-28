import { useState } from "react";
import { C } from "../constants.js";
import { useAuth } from "../context/AuthContext.jsx";

const inputStyle = {
  width: "100%",
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "11px 14px",
  color: C.text,
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

export default function Login() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow orbs decorativos */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${C.primaryGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          right: -150,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "monospace",
              marginBottom: 16,
              boxShadow: `0 8px 32px ${C.primaryGlow}`,
            }}
          >
            LS
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            Light System
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.textMuted,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Patch Notes
          </div>
        </div>

        {/* Card de login */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "32px 28px",
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: 18,
              fontWeight: 700,
              color: C.text,
            }}
          >
            Entrar
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: C.textSec }}>
            Acesse com sua conta Light System
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.textSec,
                  marginBottom: 6,
                  letterSpacing: "0.03em",
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                required
                autoFocus
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.primary)}
                onBlur={(e)  => (e.target.style.borderColor = C.border)}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.textSec,
                  marginBottom: 6,
                  letterSpacing: "0.03em",
                }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.primary)}
                onBlur={(e)  => (e.target.style.borderColor = C.border)}
              />
            </div>

            {error && (
              <div
                style={{
                  background: C.dangerDim,
                  border: `1px solid ${C.danger}44`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: C.danger,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? C.primaryGlow : C.primary,
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s, opacity 0.15s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 11,
            color: C.textMuted,
          }}
        >
          Light System Soft · Patch Notes v2
        </div>
      </div>
    </div>
  );
}
