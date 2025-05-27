import React, { useState } from "react";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

const NewPost = ({ onPostSuccess }) => {
  const [tipo, setTipo] = useState("texto");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMensagem("Você precisa estar logado para publicar.");
      return;
    }

    const formData = new FormData();
    formData.append("tipo", tipo);
    if (tipo === "texto") formData.append("conteudo", content);
    if (tipo === "imagem" && image) {
      formData.append("imagem", image);
      formData.append("legenda", caption);
    }

    try {
      const res = await fetch(`${API}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const isJson = res.headers
        .get("content-type")
        ?.includes("application/json");

      if (!res.ok) {
        const msg = isJson ? (await res.json()).error : await res.text();
        throw new Error(msg || "Erro ao publicar.");
      }

      const data = await res.json();
      setMensagem("Post criado com sucesso!");
      setContent("");
      setImage(null);
      setCaption("");
      if (onPostSuccess) onPostSuccess();
    } catch (err) {
      console.error("Erro ao publicar:", err.message);
      setMensagem(err.message || "Erro ao conectar com o servidor.");
    }
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      <h3>Nova Publicação</h3>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setTipo("texto")} disabled={tipo === "texto"}>
          Texto
        </button>
        <button onClick={() => setTipo("imagem")} disabled={tipo === "imagem"}>
          Imagem
        </button>
      </div>

      {tipo === "texto" && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que você está pensando?"
          rows={4}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      )}

      {tipo === "imagem" && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <input
            type="text"
            placeholder="Legenda"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ width: "100%", marginTop: "10px" }}
          />
        </>
      )}

      <button onClick={handleSubmit} style={{ marginTop: "10px" }}>
        Publicar
      </button>

      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
    </div>
  );
};

export default NewPost;