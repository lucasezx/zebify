import { useEffect, useState, useCallback, useRef } from "react";
import socket from "../socket";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function CommentBox({ postId }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [editando, setEditando] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const menuRefs = useRef({});

  const carregarComentarios = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/comments/${postId}`);
      if (!res.ok) throw new Error("Erro ao buscar comentários");
      const data = await res.json();
      if (Array.isArray(data)) {
        setComentarios(data);
      }
    } catch (err) {
      console.error("Erro ao carregar comentários:", err.message);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) carregarComentarios();

    const novo = (data) => {
      if (data.postId === postId) {
        setComentarios((prev) => [...prev, { ...data, autor: data.user_name }]);
      }
    };

    const editado = (comentario) => {
      if (comentario.post_id === postId) {
        setComentarios((prev) =>
          prev.map((c) => (c.id === comentario.id ? comentario : c))
        );
      }
    };

    const deletado = (id) => {
      setComentarios((prev) => prev.filter((c) => c.id !== id));
    };

    socket.on("newComment", novo);
    socket.on("comentario_editado", editado);
    socket.on("comentario_deletado", deletado);

    return () => {
      socket.off("newComment", novo);
      socket.off("comentario_editado", editado);
      socket.off("comentario_deletado", deletado);
    };
  }, [postId, carregarComentarios]);

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    if (novoComentario.length > 100) {
      alert("O comentário deve ter no máximo 100 caracteres.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, conteudo: novoComentario }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNovoComentario("");
      await carregarComentarios();
    } catch (err) {
      alert("Erro ao comentar: " + err.message);
    }
  };

  const apagarComentario = async (id) => {
    try {
      const res = await fetch(`${API}/api/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setMenuAbertoId(null);
    } catch (err) {
      alert("Erro ao apagar: " + err.message);
    }
  };

  const salvarEdicao = async (id, conteudo) => {
    if (conteudo.length > 100) {
      alert("O comentário deve ter no máximo 100 caracteres.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conteudo }),
      });
      if (!res.ok) throw new Error(await res.text());
      const atualizado = await res.json();
      setComentarios((prev) =>
        prev.map((c) => (c.id === atualizado.id ? atualizado : c))
      );
      setEditando(null);
    } catch (err) {
      alert("Erro ao editar: " + err.message);
    }
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (
        menuAbertoId &&
        menuRefs.current[menuAbertoId] &&
        !menuRefs.current[menuAbertoId].contains(e.target)
      ) {
        setMenuAbertoId(null);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [menuAbertoId]);

  return (
    <div className="mt-4 space-y-4">
      {comentarios.length > 0 && (
        <div className="space-y-3 text-sm text-gray-800">
          {comentarios.map((c) => (
            <div
              key={c.id}
              className="relative border-l-2 border-gray-300 pl-3"
            >
              <strong>{c.autor}:</strong>{" "}
              {editando?.id === c.id ? (
                <div className="mt-1 space-y-1">
                  <input
                    type="text"
                    value={editando.conteudo}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        setEditando({ ...editando, conteudo: e.target.value });
                      }
                    }}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {editando.conteudo.length}/100 caracteres
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => salvarEdicao(c.id, editando.conteudo)}
                      className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditando(null)}
                      className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="break-words whitespace-pre-wrap">
                    {c.conteudo}
                  </span>
                  {user?.id === c.user_id && (
                    <div
                      className="inline-block ml-2 relative"
                      ref={(el) => (menuRefs.current[c.id] = el)}
                    >
                      <span
                        className="cursor-pointer font-bold px-2"
                        onClick={() =>
                          setMenuAbertoId((prevId) =>
                            prevId === c.id ? null : c.id
                          )
                        }
                      >
                        ⋯
                      </span>
                      {menuAbertoId === c.id && (
                        <div className="absolute z-10 left-6 top-5 bg-white border border-gray-300 rounded shadow-sm text-sm">
                          <div
                            onClick={() => {
                              setEditando({ id: c.id, conteudo: c.conteudo });
                              setMenuAbertoId(null);
                            }}
                            className="cursor-pointer px-3 py-1 hover:bg-gray-100"
                          >
                            Editar
                          </div>
                          <div
                            onClick={() => apagarComentario(c.id)}
                            className="cursor-pointer px-3 py-1 text-red-600 hover:bg-red-100"
                          >
                            Apagar
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviarComentario();
        }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={novoComentario}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNovoComentario(e.target.value);
              }
            }}
            placeholder="Escreva um comentário..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded"
          >
            Comentar
          </button>
        </div>
        <div className="text-xs text-gray-500 text-right">
          {novoComentario.length}/100 caracteres
        </div>
      </form>
    </div>
  );
}
