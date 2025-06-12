import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/authContext";
import socket from "../socket";
import Footer from "../components/footer";

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
          Authorization: `Bearer ${token}`,
          ...(body && { "Content-Type": "application/json" }),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      carregarUtilizadores();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 pt-20 px-6 max-w-4xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Utilizadores</h1>

        {utilizadores
          .filter((u) => u.id !== user?.id)
          .map((u) => (
            <div
              key={u.id}
              className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 mb-4"
            >
              <p className="text-base mb-2">
                <strong className="text-green-700">{u.name}</strong> -{" "}
                <span className="text-gray-600">{u.email}</span>
                <span
                  className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold text-white capitalize ${
                    u.status === "amigos"
                      ? "bg-green-600"
                      : u.status === "pendente"
                      ? "bg-yellow-500"
                      : u.status === "recebido"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}
                >
                  {u.status}
                </span>
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                {u.status === "amigos" && (
                  <button
                    onClick={() =>
                      executarAcao(`${API}/api/friends/${u.id}`, "DELETE")
                    }
                    disabled={loadingId === u.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Remover amigo
                  </button>
                )}

                {u.status === "pendente" && (
                  <button
                    onClick={() =>
                      executarAcao(
                        `${API}/api/friends/request/${u.id}`,
                        "DELETE"
                      )
                    }
                    disabled={loadingId === u.id}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition"
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
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
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
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Adicionar amigo
                  </button>
                )}
              </div>
            </div>
          ))}
      </main>

      <Footer />
    </div>
  );
};

export default UsersPage;
