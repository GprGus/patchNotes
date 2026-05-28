import { useState } from "react";
import { C } from "./constants.js";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./components/Login.jsx";
import Header from "./components/Header.jsx";
import Backlog from "./components/Backlog.jsx";
import ReleaseManagement from "./components/ReleaseManagement.jsx";
import PublicNotes from "./components/PublicNotes.jsx";
import UserManagement from "./components/admin/UserManagement.jsx";

const TABS_BY_ROLE = {
  master:    ["public", "backlog", "release", "admin"],
  developer: ["public", "backlog", "release"],
  viewer:    ["public"],
};

export default function App() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("public");

  // Tela de carregamento inicial (verificando token)
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"DM Sans", system-ui, sans-serif',
          color: C.textMuted,
          fontSize: 14,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "monospace",
              marginBottom: 16,
            }}
          >
            LS
          </div>
          <div>Carregando…</div>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  // Garante que a aba ativa é permitida para o role atual
  const allowedTabs = TABS_BY_ROLE[user.role] || ["public"];
  const activeTab   = allowedTabs.includes(tab) ? tab : allowedTabs[0];

  return (
    <div
      style={{
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        background: C.bg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        color: C.text,
        overflow: "hidden",
      }}
    >
      <Header tab={activeTab} setTab={setTab} allowedTabs={allowedTabs} />

      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeTab === "public" && <PublicNotes />}
        {activeTab === "backlog" && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Backlog />
          </div>
        )}
        {activeTab === "release" && <ReleaseManagement />}
        {activeTab === "admin"   && <UserManagement />}
      </main>
    </div>
  );
}
