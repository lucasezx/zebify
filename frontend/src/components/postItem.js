import { useState } from "react";
import { updatePost, deletePost } from "../services/posts";
import "../css/postOptions.css";

function PostItem({ post, onChange }) {
  const [editing, setEditing] = useState(false);
  const [conteudo, setConteudo] = useState(post.conteudo ?? "");
  const [legenda, setLegenda] = useState(post.legenda ?? "");
  const [msg, setMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visMenuOpen, setVisMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const visibilityIcons = {
    public: "🌍 Público",
    friends: "👥 Amigos",
    private: "🔒 Apenas eu",
  };

  const salvar = async () => {
    try {
      await updatePost(post.id, { conteudo, legenda });
      setEditing(false);
      onChange();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const apagar = async () => {
    if (!window.confirm("Tem certeza que deseja apagar?")) return;
    try {
      await deletePost(post.id);
      onChange();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const atualizarVisibilidade = async (vis) => {
    try {
      await updatePost(post.id, { visibility: vis });
      setVisMenuOpen(false);
      setMenuOpen(false);
      onChange();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="post-item">
      {editing ? (
        <>
          {post.tipo === "texto" && (
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva algo..."
            />
          )}

          {post.tipo === "imagem" && (
            <>
              <img
                src={`http://localhost:3001/uploads/${post.imagem_path}`}
                alt="imagem"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  marginBottom: "10px",
                }}
              />
              <input
                type="text"
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                placeholder="Legenda da imagem"
              />
            </>
          )}

          <button className="btn" onClick={salvar}>
            Salvar
          </button>
          <button className="btn cancel" onClick={() => setEditing(false)}>
            Cancelar
          </button>

          {msg && <p>{msg}</p>}
        </>
      ) : (
        <>
          <p>{post.conteudo}</p>
          {post.legenda && <small>{post.legenda}</small>}

          {post.user_id === user?.id && (
            <div className="post-options">
              <button onClick={() => setMenuOpen(!menuOpen)}>⋯</button>

              {menuOpen && (
                <div className="post-dropdown">
                  <div
                    className="dropdown-item visibility-button"
                    onClick={() => setVisMenuOpen(!visMenuOpen)}
                  >
                    {visibilityIcons[post.visibility]} ▼
                  </div>

                  {visMenuOpen && (
                    <div className="vis-menu">
                      {Object.entries(visibilityIcons).map(([key, label]) => (
                        <div
                          key={key}
                          className={`dropdown-item ${
                            post.visibility === key ? "selected" : ""
                          }`}
                          onClick={() => atualizarVisibilidade(key)}
                        >
                          {label} {post.visibility === key && "✓"}
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className="dropdown-item"
                    onClick={() => setEditing(true)}
                  >
                    ✏️ Editar publicação
                  </div>
                  <div className="dropdown-item" onClick={apagar}>
                    🗑️ Apagar
                  </div>
                </div>
              )}
            </div>
          )}

          {msg && <p>{msg}</p>}
        </>
      )}
    </div>
  );
}

export default PostItem;
