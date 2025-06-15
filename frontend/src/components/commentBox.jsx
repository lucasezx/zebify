import { useEffect, useState, useCallback, useRef } from "react";
import socket from "../socket";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function CommentBox({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editing, setEditing] = useState(null);
  const [openedMenuId, setOpenedMenuId] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const menuRefs = useRef({});

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/comments/${postId}`);
      if (!res.ok) throw new Error("Erro ao buscar comentários");
      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      }
    } catch (err) {
      console.error("Erro ao carregar comentários:", err.message);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) loadComments();

    const newC = (data) => {
      if (data.postId === postId) {
        setComments((prev) => [...prev, { ...data, autor: data.user_name }]);
      }
    };

    const edited = (comment) => {
      if (comment.post_id === postId) {
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? comment : c))
        );
      }
    };

    const deleted = (id) => {
      setComments((prev) => prev.filter((c) => c.id !== id));
    };

    socket.on("newComment", newC);
    socket.on("comentario_editado", edited);
    socket.on("comentario_deletado", deleted);

    return () => {
      socket.off("newComment", newC);
      socket.off("comentario_editado", edited);
      socket.off("comentario_deletado", deleted);
    };
  }, [postId, loadComments]);

  const sendComment = async () => {
    if (!newComment.trim()) return;
    if (newComment.length > 100) {
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
        body: JSON.stringify({ postId, conteudo: newComment }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewComment("");
      await loadComments();
    } catch (err) {
      alert("Erro ao comentar: " + err.message);
    }
  };

  const deleteComment = async (id) => {
    try {
      const res = await fetch(`${API}/api/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setOpenedMenuId(null);
    } catch (err) {
      alert("Erro ao apagar: " + err.message);
    }
  };

  const saveEdit = async (id, conteudo) => {
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
      const updated = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditing(null);
    } catch (err) {
      alert("Erro ao editar: " + err.message);
    }
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (
        openedMenuId &&
        menuRefs.current[openedMenuId] &&
        !menuRefs.current[openedMenuId].contains(e.target)
      ) {
        setOpenedMenuId(null);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [openedMenuId]);

  return (
    <div className="mt-4 space-y-4">
      {comments.length > 0 && (
        <div className="space-y-3 text-sm text-gray-800">
          {comments.map((c) => (
            <div
              key={c.id}
              className="relative border-l-2 border-gray-300 pl-3"
            >
              <strong>{c.autor}:</strong>{" "}
              {editing?.id === c.id ? (
                <div className="mt-1 space-y-1">
                  <input
                    type="text"
                    value={editing.conteudo}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        setEditing({ ...editing, conteudo: e.target.value });
                      }
                    }}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {editing.conteudo.length}/100 caracteres
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => saveEdit(c.id, editing.conteudo)}
                      className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditing(null)}
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
                          setOpenedMenuId((prevId) =>
                            prevId === c.id ? null : c.id
                          )
                        }
                      >
                        ⋯
                      </span>
                      {openedMenuId === c.id && (
                        <div className="absolute z-10 left-6 top-5 bg-white border border-gray-300 rounded shadow-sm text-sm">
                          <div
                            onClick={() => {
                              setEditing({ id: c.id, conteudo: c.conteudo });
                              setOpenedMenuId(null);
                            }}
                            className="cursor-pointer px-3 py-1 hover:bg-gray-100"
                          >
                            Editar
                          </div>
                          <div
                            onClick={() => deleteComment(c.id)}
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
          sendComment();
        }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNewComment(e.target.value);
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
          {newComment.length}/100 caracteres
        </div>
      </form>
    </div>
  );
}
