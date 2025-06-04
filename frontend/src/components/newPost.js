import React, { useState } from "react";
import socket from "../socket";
import VisibilityToggle from "./visibilityToggle";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

const NewPost = ({ onPostSuccess }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagem("Você precisa estar logado para publicar.");
      return;
    }

    if (!content && !image) {
      setMensagem("Escreva algo ou adicione uma imagem.");
      return;
    }

    const tipoFinal = image ? "imagem" : "texto";

    const formData = new FormData();
    formData.append("tipo", tipoFinal);
    formData.append("visibility", visibility);

    if (content) {
      formData.append("conteudo", content);
    }

    if (image) {
      formData.append("imagem", image);
      formData.append("legenda", content);
    }

    try {
      const res = await fetch(`${API}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const msg = (await res.json()).error || "Erro ao publicar.";
        throw new Error(msg);
      }

      await res.json();
      setMensagem("Post criado com sucesso!");
      setContent("");
      setImage(null);
      setVisibility("public");
      if (onPostSuccess) onPostSuccess();
    } catch (err) {
      console.error("Erro ao publicar:", err.message);
      setMensagem(err.message || "Erro ao conectar com o servidor.");
    }

    socket.emit("nova_postagem", {
      tipo: tipoFinal,
      visibility: visibility,
      conteudo: content,
      imagem: image ? URL.createObjectURL(image) : null,
    });
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      <h3>Nova Publicação</h3>

     <VisibilityToggle visibility={visibility} setVisibility={setVisibility} />

      <div style={{ position: "relative", marginTop: "10px" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que está pensando?"
          rows={4}
          style={{
            width: "100%",
            padding: "15px 50px 15px 15px",
            fontSize: "16px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <label
          htmlFor="imageUpload"
          title="Adicionar imagem"
          style={{
            position: "absolute",
            right: "15px",
            bottom: "15px",
            fontSize: "22px",
            cursor: "pointer",
            opacity: 0.6,
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseOut={(e) => (e.currentTarget.style.opacity = 0.6)}
        >
          📷
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ display: "none" }}
        />
      </div>

      {image && (
        <div
          style={{
            position: "relative",
            marginTop: "10px",
            marginBottom: "15px",
            display: "inline-block",
            maxWidth: "100%",
          }}
        >
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={() => {
              setImage(null);
              document.getElementById("imageUpload").value = "";
            }}
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              zIndex: 10,
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              lineHeight: "18px",
              textAlign: "center",
              cursor: "pointer",
              padding: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
            title="Remover imagem"
          >
            ×
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          display: "block",
        }}
      >
        Publicar
      </button>

      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
    </div>
  );
};

export default NewPost;