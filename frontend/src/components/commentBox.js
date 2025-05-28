import { useEffect, useState, useCallback } from "react";
import socket from "../socket";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

export default function CommentBox({ postId }) {
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [editando, setEditando] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

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
    if (postId) {
      carregarComentarios();
    }

    const receberNovoComentario = (data) => {
      if (data.postId === postId) {
        setComentarios((prev) => [
          ...prev,
          {
            ...data,
            autor: data.user_name, // <- adapta para bater com o formato do seu .map
          },
        ]);
      }
    };

    socket.on("newComment", receberNovoComentario);

    return () => socket.off("newComment", receberNovoComentario);
  }, [postId, carregarComentarios]);

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
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
      carregarComentarios();
    } catch (err) {
      alert("Erro ao comentar: " + err.message);
    }
  };

  const apagarComentario = async (id) => {
    try {
      const res = await fetch(`${API}/api/comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      setMenuAbertoId(null);
      carregarComentarios();
    } catch (err) {
      alert("Erro ao apagar: " + err.message);
    }
  };

  const salvarEdicao = async (id, conteudo) => {
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
      setEditando(null);
      carregarComentarios();
    } catch (err) {
      alert("Erro ao editar: " + err.message);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h4>Comentários</h4>
      {comentarios.map((c) => (
        <div
          key={c.id}
          style={{
            marginBottom: "8px",
            paddingLeft: "10px",
            borderLeft: "2px solid #ccc",
            position: "relative",
          }}
        >
          <strong>{c.autor}:</strong>{" "}
          {editando?.id === c.id ? (
            <>
              <input
                type="text"
                value={editando.conteudo}
                onChange={(e) =>
                  setEditando({ ...editando, conteudo: e.target.value })
                }
                style={{ marginRight: "5px" }}
              />
              <button onClick={() => salvarEdicao(c.id, editando.conteudo)}>
                Salvar
              </button>
              <button onClick={() => setEditando(null)}>Cancelar</button>
            </>
          ) : (
            <>
              <span>{c.conteudo}</span>
              {user?.id === c.user_id && (
                <div style={{ display: "inline-block", marginLeft: "10px" }}>
                  <span
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      padding: "0 5px",
                    }}
                    onClick={() =>
                      setMenuAbertoId(menuAbertoId === c.id ? null : c.id)
                    }
                  >
                    ⋯
                  </span>
                  {menuAbertoId === c.id && (
                    <div
                      style={{
                        position: "absolute",
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        padding: "5px",
                        borderRadius: "4px",
                        top: "20px",
                        left: "60px",
                        zIndex: 100,
                      }}
                    >
                      <div
                        onClick={() => {
                          setEditando({ id: c.id, conteudo: c.conteudo });
                          setMenuAbertoId(null);
                        }}
                        style={{ cursor: "pointer", marginBottom: "4px" }}
                      >
                        Editar
                      </div>
                      <div
                        onClick={() => apagarComentario(c.id)}
                        style={{ cursor: "pointer", color: "red" }}
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

      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          placeholder="Escreva um comentário..."
          style={{ width: "80%", marginRight: "5px" }}
        />
        <button onClick={enviarComentario}>Comentar</button>
      </div>
    </div>
  );
}
