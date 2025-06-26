import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/authContext";
import socket from "../socket";
import Footer from "../components/footer";
import Avatar from "../components/avatar";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const UsersPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [utilizadores, setUtilizadores] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [search, setSearch] = useState("");

  const carregarUtilizadores = useCallback(
    async (pagina = 1, termoBusca = "") => {
      try {
        const res = await fetch(
          `${API}/api/users/with-status?page=${pagina}&limit=10&search=${encodeURIComponent(
            termoBusca
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setHasMoreUsers(data.length === 10);

        if (pagina === 1) {
          setUtilizadores(data);
        } else {
          setUtilizadores((prev) => [...prev, ...data]);
        }
      } catch (err) {
        alert("Erro ao carregar utilizadores");
      }
    },
    [token]
  );

  useEffect(() => {
    if (user) {
      setPage(1);
      carregarUtilizadores(1, search);

      const meuId = user.id;

      const atualizar = () => {
        setPage(1);
        carregarUtilizadores(1, search);
      };

      socket.on("pedido_enviado", ({ senderId, receiverId }) => {
        if (meuId === senderId || meuId === receiverId) {
          atualizar();
        }
      });

      socket.on("pedido_cancelado", ({ senderId, receiverId }) => {
        if (meuId === senderId || meuId === receiverId) {
          atualizar();
        }
      });

      socket.on("amizade_aceita", ({ userId1, userId2 }) => {
        if (meuId === userId1 || meuId === userId2) {
          atualizar();
        }
      });

      socket.on("amizade_removida", ({ userId1, userId2 }) => {
        if (meuId === userId1 || meuId === userId2) {
          atualizar();
        }
      });
    }

    return () => {
      socket.off("pedido_enviado");
      socket.off("pedido_cancelado");
      socket.off("amizade_aceita");
      socket.off("amizade_removida");
    };
  }, [user, carregarUtilizadores, search]);

  useEffect(() => {
    setPage(1);
    carregarUtilizadores(1, search);
  }, [search, carregarUtilizadores]);

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

      setPage(1);
      carregarUtilizadores(1, search);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 pt-20 px-6 max-w-6xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Utilizadores</h1>

        <input
          type="text"
          placeholder="Pesquisar utilizadores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 px-4 py-2 border border-gray-300 rounded-lg w-full max-w-md"
        />

        {(() => {
          const listaFiltrada = utilizadores.filter((u) => u.id !== user?.id);

          if (listaFiltrada.length === 0) {
            return (
              <p className="text-center text-gray-500 mt-6">
                {search ? (
                  <>
                    O utilizador "{search}" não foi encontrado.
                    <span className="block mt-2">
                      Tente pesquisar por outro nome.
                    </span>
                  </>
                ) : (
                  "Nenhum utilizador disponível no momento."
                )}
              </p>
            );
          }

          return (
            <>
              {listaFiltrada.map((u) => (
                <div
                  key={u.id}
                  className="bg-white border border-gray-300 shadow-md rounded-xl p-6 mb-6 transition hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar url={u.avatar_url} name={u.name} size={40} />

                    <div>
                      <p className="text-base font-semibold text-gray-800 truncate max-w-[160px]">
                        {u.name}
                      </p>
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

              {hasMoreUsers && listaFiltrada.length >= 10 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      carregarUtilizadores(nextPage, search);
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
      </main>

      <Footer />
    </div>
  );
};

export default UsersPage;
