import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import "../css/style.css";
import Footer from "../components/footer";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

const Profile = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [meusPosts, setMeusPosts] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoConteudo, setNovoConteudo] = useState("");
  const [novaLegenda, setNovaLegenda] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchMinhasPublicacoes = async () => {
      try {
        const res = await fetch(`${API}/api/my-posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setMeusPosts(data);
      } catch (err) {
        console.error("Erro ao carregar publicações:", err.message);
      }
    };

    fetchMinhasPublicacoes();
  }, [user, token]);

  const apagarPost = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar esta publicação?"))
      return;

    try {
      const res = await fetch(`${API}/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const erro = await res
          .json()
          .catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(erro.error);
      }

      setMeusPosts(meusPosts.filter((post) => post.id !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err.message);
      alert("Erro ao deletar: " + err.message);
    }
  };

  const iniciarEdicao = (post) => {
    setEditando(post.id);
    setNovoConteudo(post.conteudo || "");
    setNovaLegenda(post.legenda || "");
  };

  const salvarEdicao = async (id) => {
    try {
      const res = await fetch(`${API}/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conteudo: novoConteudo,
          legenda: novaLegenda,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setEditando(null);
      setMeusPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, conteudo: novoConteudo, legenda: novaLegenda }
            : post
        )
      );
    } catch (err) {
      console.error("Erro ao editar:", err.message);
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <div className="profile-container">
        <h1>Meu Perfil</h1>
        <p>
          <strong>Nome:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <h2 style={{ marginTop: "30px" }}>Minhas Publicações</h2>
        {meusPosts.map((post) => (
          <div key={post.id} className="card">
            <h3>{post.tipo === "imagem" ? "📷 Imagem" : "📝 Texto"}</h3>

            {editando === post.id ? (
              <>
                {post.tipo === "texto" && (
                  <textarea
                    value={novoConteudo}
                    onChange={(e) => setNovoConteudo(e.target.value)}
                  />
                )}
                {post.tipo === "imagem" && (
                  <>
                    <img
                      src={`${API}/uploads/${post.imagem_path}`}
                      alt="imagem"
                      style={{ width: "100%", maxWidth: "300px" }}
                    />
                    <input
                      type="text"
                      value={novaLegenda}
                      onChange={(e) => setNovaLegenda(e.target.value)}
                    />
                  </>
                )}
                <button onClick={() => salvarEdicao(post.id)}>Salvar</button>
                <button onClick={() => setEditando(null)}>Cancelar</button>
              </>
            ) : (
              <>
                {post.tipo === "texto" && <p>{post.conteudo}</p>}
                {post.tipo === "imagem" && (
                  <>
                    <img
                      src={`${API}/uploads/${post.imagem_path}`}
                      alt="imagem"
                      style={{ width: "100%", maxWidth: "300px" }}
                    />
                    <p>{post.legenda}</p>
                  </>
                )}
                <small>{new Date(post.created_at).toLocaleString()}</small>
                <br />
                <button onClick={() => iniciarEdicao(post)}>Editar</button>
                <button onClick={() => apagarPost(post.id)}>Apagar</button>
              </>
            )}
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Profile;
