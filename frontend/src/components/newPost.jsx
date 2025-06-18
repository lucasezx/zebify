import React, { useState } from "react";
import socket from "../socket";
import VisibilityToggle from "./visibilityToggle";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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

    if (tipoFinal === "texto") {
      formData.append("conteudo", content);
    }

    if (tipoFinal === "imagem") {
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
    <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Nova Publicação</h3>
      <VisibilityToggle visibility={visibility} setVisibility={setVisibility} />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="O que está pensando?"
        rows={5}
        className="w-full mt-4 p-3 text-base border border-gray-300 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
        <label
          htmlFor="imageUpload"
          className="flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl cursor-pointer transition"
        >
          Adicionar Imagem
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="hidden"
        />

        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
        >
          Publicar
        </button>
      </div>

      {image && (
        <div className="relative mt-4">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="max-w-full max-h-80 rounded-lg border border-gray-300"
          />
          <button
            onClick={() => {
              setImage(null);
              document.getElementById("imageUpload").value = "";
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center shadow"
            title="Remover imagem"
          >
            ×
          </button>
        </div>
      )}

      {mensagem && <p className="mt-2 text-green-600">{mensagem}</p>}
    </div>
  );
};

export default NewPost;
