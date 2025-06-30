import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/authContext";
import socket from "../socket";
import Footer from "../components/footer";
import Avatar from "../components/avatar";
import ProfilePictureModal from "../components/profilePictureModal";
import { Link } from "react-router-dom";
import FilterSelect from "../components/filterSelect";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function UsersPage() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [utilizadores, setUtilizadores] = useState([]);
  const [onlineIds, setOnlineIds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos"); // 🆕
  const [picModal, setPicModal] = useState({ open: false, url: "", name: "" });

  const carregar = useCallback(
    async (pagina = 1, termo = "", status = filter) => {
      try {
        const res = await fetch(
          `${API}/api/users/with-status?page=${pagina}&limit=10&search=${encodeURIComponent(
            termo
          )}&status=${encodeURIComponent(status)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setHasMore(data.length === 10);
        setUtilizadores(pagina === 1 ? data : (prev) => [...prev, ...data]);
      } catch {
        alert("Erro ao carregar utilizadores");
      }
    },
    [token, filter]
  );

  useEffect(() => {
    if (!user) return;
    const me = user.id;

    const apply = (checker, newStatus) =>
      setUtilizadores((prev) =>
        prev.map((u) => (checker(u) ? { ...u, status: newStatus } : u))
      );

    socket.on("pedido_enviado", ({ senderId, receiverId }) => {
      const sid = Number(senderId),
        rid = Number(receiverId);
      apply((u) => me === sid && u.id === rid, "pendente");
      apply((u) => me === rid && u.id === sid, "recebido");
    });
    socket.on("pedido_cancelado", ({ senderId, receiverId }) => {
      const sid = Number(senderId),
        rid = Number(receiverId);
      apply((u) => me === sid && u.id === rid, "nenhum");
      apply((u) => me === rid && u.id === sid, "nenhum");
    });
    socket.on("amizade_aceita", ({ userId1, userId2 }) => {
      const u1 = Number(userId1),
        u2 = Number(userId2);
      apply((u) => me === u1 && u.id === u2, "amigos");
      apply((u) => me === u2 && u.id === u1, "amigos");
    });
    socket.on("amizade_removida", ({ userId1, userId2 }) => {
      const u1 = Number(userId1),
        u2 = Number(userId2);
      apply((u) => me === u1 && u.id === u2, "nenhum");
      apply((u) => me === u2 && u.id === u1, "nenhum");
    });

    return () => {
      socket.off("pedido_enviado");
      socket.off("pedido_cancelado");
      socket.off("amizade_aceita");
      socket.off("amizade_removida");
    };
  }, [user]);

  useEffect(() => {
    const atualizarOnline = (lista) => setOnlineIds(lista);
    const entrou = (id) => setOnlineIds((prev) => [...new Set([...prev, id])]);
    const saiu = (id) =>
      setOnlineIds((prev) => prev.filter((uid) => uid !== id));

    socket.on("online_users", atualizarOnline);
    socket.on("user_online", entrou);
    socket.on("user_offline", saiu);

    return () => {
      socket.off("online_users", atualizarOnline);
      socket.off("user_online", entrou);
      socket.off("user_offline", saiu);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setPage(1);
      carregar(1, search, filter);
    }
  }, [user, search, filter, carregar]);

  const normalizar = (u) => {
    const first = u.firstName ?? u.first_name ?? "";
    const last = u.lastName ?? u.last_name ?? "";
    return {
      ...u,
      name: [first, last].filter(Boolean).join(" "),
    };
  };

  useEffect(() => {
    const onProfileUpdated = (payload) => {
      const uid =
        typeof payload === "object" && payload !== null ? payload.id : payload;
      if (!uid) return;

      setUtilizadores((prev) =>
        prev.map((u) =>
          u.id === Number(uid)
            ? typeof payload === "object"
              ? normalizar({ ...u, ...payload })
              : normalizar(u)
            : u
        )
      );

      if (typeof payload !== "object") {
        fetch(`${API}/api/users/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((data) =>
            setUtilizadores((prev) =>
              prev.map((u) =>
                u.id === Number(uid) ? normalizar({ ...u, ...data }) : u
              )
            )
          )
          .catch(() => {});
      }
    };

    socket.on("profileUpdated", onProfileUpdated);
    return () => socket.off("profileUpdated", onProfileUpdated);
  }, [token]);

  const executar = async (url, method = "POST", body = null) => {
    const alvoId =
      body?.receiverId || body?.senderId || Number(url.match(/(\d+)$/)?.[1]);
    try {
      setLoadingId(alvoId);
      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body && { "Content-Type": "application/json" }),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 pt-20 px-6 max-w-6xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Utilizadores</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar utilizadores..."
            className="w-full sm:w-auto sm:min-w-[16rem]
               rounded-full bg-white border border-gray-300 shadow-sm
               py-2 pl-4 pr-10
               focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="flex items-center gap-2 w-full sm:w-auto">
            ☰<span className="font-medium whitespace-nowrap">Filtrar por:</span>
            <FilterSelect value={filter} onChange={setFilter} />
          </label>
        </div>

        {(() => {
          let lista = utilizadores.filter((u) => u.id !== user?.id);
          if (filter !== "todos")
            lista = lista.filter((u) => u.status === filter);

          if (lista.length === 0) {
            return (
              <p className="text-center text-gray-500 mt-6">
                Nenhum resultado para esse critério.
              </p>
            );
          }

          return (
            <>
              {lista.map((u) => {
                const avatarUrl =
                  !u.avatar_url || ["null", "undefined"].includes(u.avatar_url)
                    ? null
                    : /^(https?:|blob:|data:)/.test(u.avatar_url)
                    ? u.avatar_url
                    : `${API}/uploads/${u.avatar_url}`;

                return (
                  <div
                    key={u.id}
                    className="bg-white border border-gray-300 shadow-md rounded-xl p-6 mb-6 transition hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar
                        url={avatarUrl}
                        name={u.name}
                        size={40}
                        className={
                          avatarUrl ? "cursor-pointer" : "cursor-default"
                        }
                        onClick={
                          avatarUrl
                            ? () =>
                                setPicModal({
                                  open: true,
                                  url: avatarUrl,
                                  name: u.name,
                                })
                            : undefined
                        }
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/users/${u.id}`}
                            className="text-base font-semibold hover:underline truncate max-w-[160px]"
                          >
                            {u.name}
                          </Link>

                          {onlineIds.includes(u.id) && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-green-500"
                              title="Online"
                            ></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>

                      <span
                        className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold text-white capitalize ${
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
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2">
                      {u.status === "amigos" && (
                        <>
                          <Link
                            to={`/messages?user=${u.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Enviar mensagem
                          </Link>
                          <button
                            disabled={loadingId === u.id}
                            onClick={() =>
                              executar(`${API}/api/friends/${u.id}`, "DELETE")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Remover amigo
                          </button>
                        </>
                      )}
                      {u.status === "pendente" && (
                        <button
                          disabled={loadingId === u.id}
                          onClick={() =>
                            executar(
                              `${API}/api/friends/request/${u.id}`,
                              "DELETE"
                            )
                          }
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                          Cancelar pedido
                        </button>
                      )}
                      {u.status === "recebido" && (
                        <>
                          <button
                            disabled={loadingId === u.id}
                            onClick={() =>
                              executar(`${API}/api/friends/accept`, "POST", {
                                senderId: u.id,
                              })
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Aceitar
                          </button>
                          <button
                            disabled={loadingId === u.id}
                            onClick={() =>
                              executar(`${API}/api/friends/reject`, "POST", {
                                senderId: u.id,
                              })
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Recusar
                          </button>
                        </>
                      )}
                      {u.status === "nenhum" && (
                        <button
                          disabled={loadingId === u.id}
                          onClick={() =>
                            executar(`${API}/api/friends/request`, "POST", {
                              receiverId: u.id,
                            })
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                          Adicionar amigo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {hasMore && lista.length >= 10 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      carregar(next, search, filter);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                  >
                    Carregar mais
                  </button>
                </div>
              )}
            </>
          );
        })()}

        <ProfilePictureModal
          isOpen={picModal.open}
          onClose={() => setPicModal({ ...picModal, open: false })}
          imageUrl={picModal.url}
          userName={picModal.name}
        />
      </main>

      <Footer />
    </div>
  );
}
