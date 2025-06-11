import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/authContext";
import socket from "../socket";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const UsersPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [utilizadores, setUtilizadores] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const carregarUtilizadores = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/users/with-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUtilizadores(data);
    } catch (err) {
      alert("Erro ao carregar utilizadores");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      carregarUtilizadores();

      const meuId = user.id;

      socket.on("pedido_enviado", ({ senderId, receiverId }) => {
        if (meuId === senderId || meuId === receiverId) {
          console.log("🔄 Atualizando lista (pedido enviado)");
          carregarUtilizadores();
        }
      });

      socket.on("pedido_cancelado", ({ senderId, receiverId }) => {
        if (meuId === senderId || meuId === receiverId) {
          console.log("🚫 Pedido cancelado — atualizando lista");
          carregarUtilizadores();
        }
      });

      socket.on("amizade_aceita", ({ userId1, userId2 }) => {
        if (meuId === userId1 || meuId === userId2) {
          console.log("✅ Amizade aceita — recarregando lista");
          carregarUtilizadores();
        }
      });

      socket.on("amizade_removida", ({ userId1, userId2 }) => {
        if (meuId === userId1 || meuId === userId2) {
          console.log("❌ Amizade removida — recarregando lista");
          carregarUtilizadores();
        }
      });
    }


    return () => {
      socket.off("pedido_enviado");
      socket.off("pedido_cancelado");
      socket.off("amizade_aceita");
      socket.off("amizade_removida");
    };
  }, [user, carregarUtilizadores]);

  const executarAcao = async (url, method = "POST", body = null) => {
    try {
      setLoadingId(body?.receiverId || body?.senderId || null);

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : null,
      });

      carregarUtilizadores();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Utilizadores</h1>

      {utilizadores
        .filter((u) => u.id !== user?.id)
        .map((u) => (
          <div
            key={u.id}
            className="card"
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <p>
              <strong>{u.name}</strong> - {u.email}
              <span
                style={{
                  backgroundColor:
                    u.status === "amigos"
                      ? "green"
                      : u.status === "pendente"
                      ? "orange"
                      : u.status === "recebido"
                      ? "blue"
                      : "#999",
                  color: "white",
                  padding: "2px 8px",
                  marginLeft: "10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  textTransform: "capitalize",
                }}
              >
                {u.status}
              </span>
            </p>

            {u.status === "amigos" && (
              <button
                onClick={() =>
                  executarAcao(`${API}/api/friends/${u.id}`, "DELETE")
                }
                disabled={loadingId === u.id}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Remover amigo
              </button>
            )}

            {u.status === "pendente" && (
              <button
                onClick={() =>
                  executarAcao(`${API}/api/friends/request/${u.id}`, "DELETE")
                }
                disabled={loadingId === u.id}
              >
                Cancelar pedido
              </button>
            )}

            {u.status === "recebido" && (
              <>
                <button
                  onClick={() =>
                    executarAcao(`${API}/api/friends/accept`, "POST", {
                      senderId: u.id,
                    })
                  }
                  disabled={loadingId === u.id}
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    marginRight: "8px",
                  }}
                >
                  Aceitar
                </button>
                <button
                  onClick={() =>
                    executarAcao(`${API}/api/friends/reject`, "POST", {
                      senderId: u.id,
                    })
                  }
                  disabled={loadingId === u.id}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  Recusar
                </button>
              </>
            )}

            {u.status === "nenhum" && (
              <button
                onClick={() =>
                  executarAcao(`${API}/api/friends/request`, "POST", {
                    receiverId: u.id,
                  })
                }
                disabled={loadingId === u.id}
              >
                Adicionar amigo
              </button>
            )}
          </div>
        ))}
    </div>
  );
};

export default UsersPage;
