import React, { useState, useEffect, useRef } from "react";
import CommentBox from "./commentBox";
import { updatePost, deletePost } from "../services/posts";
import socket from "../socket";
import Avatar from "./avatar";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function PostCard({
  post,
  onChange,
  isOwner = false,
  showComments = true,
}) {
  const [editing, setEditing] = useState(false);
  const [conteudo, setConteudo] = useState(post.conteudo ?? "");
  const [legenda, setLegenda] = useState(post.legenda ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [visMenuOpen, setVisMenuOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [verMais, setVerMais] = useState(false);

  const menuRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  const LIMITE = 200;
  const textoCurto = post.conteudo?.length > LIMITE && !verMais;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setVisMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibilityIcons = {
    public: "🌍 Público",
    friends: "👥 Amigos",
    private: "🔒 Apenas eu",
  };

  const formatarData = (data) => {
    const dt = new Date(data);
    return dt.toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const salvar = async () => {
    try {
      const conteudoOriginal = post.conteudo ?? "";
      const conteudoNovo = conteudo ?? "";

      const foiEditado = conteudoOriginal.trim() !== conteudoNovo.trim();

      await updatePost(post.id, { conteudo, legenda });
      setEditing(false);
      setMsg("");

      onChange?.();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const apagar = async () => {
    if (!window.confirm("Tem certeza que deseja apagar?")) return;
    try {
      await deletePost(post.id);
      socket.emit("postagem_deletada", post.id);
      onChange?.();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const atualizarVisibilidade = async (vis) => {
    try {
      await updatePost(post.id, {
        conteudo: post.conteudo,
        legenda: post.legenda,
        visibility: vis,
      });
      setVisMenuOpen(false);
      setMenuOpen(false);
      onChange?.();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <article className="bg-white border border-gray-400 shadow-sm hover:shadow-md rounded-xl p-6 transition">
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar
            url={post.avatar_url}
            name={post.author?.split(" ")[0]}
            size={32}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800">
                @{post.author}
              </span>
              {post.visibility && (
                <span className="text-xs text-blue-600">
                  {visibilityIcons[post.visibility]}
                </span>
              )}
            </div>

            <span className="text-xs text-gray-400">
              {formatarData(post.created_at)}
              {post.editado === 1 && (
                <span className="text-gray-400 italic"> (editado)</span>
              )}
            </span>
          </div>
        </div>

        {isOwner && post.user_id === user?.id && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-xl font-bold text-gray-600 hover:text-black"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                <button
                  onClick={() => setVisMenuOpen(!visMenuOpen)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  {visibilityIcons[post.visibility]} ▼
                </button>
                {visMenuOpen && (
                  <div className="border-t">
                    {Object.entries(visibilityIcons).map(([key, label]) => (
                      <div
                        key={key}
                        onClick={() => atualizarVisibilidade(key)}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                          post.visibility === key
                            ? "font-semibold text-emerald-600"
                            : ""
                        }`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  ✏️ Editar publicação
                </button>
                <button
                  onClick={apagar}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  🗑️ Apagar
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {editing ? (
        <div className="space-y-3 mt-2">
          {post.tipo === "texto" && (
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          )}
          {post.tipo === "imagem" && (
            <>
              <img
                src={`${API}/uploads/${post.imagem_path}`}
                alt="imagem"
                className="rounded-lg w-full max-w-md mx-auto"
              />
              <input
                type="text"
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Legenda da imagem"
              />
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={salvar}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 rounded text-sm"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded text-sm"
            >
              Cancelar
            </button>
          </div>
          {msg && <p className="text-red-500 text-sm mt-1">{msg}</p>}
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {post.tipo === "imagem" && post.imagem_path && (
            <img
              src={`${API}/uploads/${post.imagem_path}`}
              alt="imagem"
              className="rounded-lg w-full max-w-md mx-auto"
            />
          )}

          {post.conteudo && (
            <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
              {textoCurto
                ? `${post.conteudo.slice(0, LIMITE)}...`
                : post.conteudo}

              {post.conteudo.length > LIMITE && (
                <button
                  className="ml-1 text-emerald-600 text-sm hover:underline"
                  onClick={() => setVerMais(!verMais)}
                >
                  {verMais ? "ver menos" : "ver mais"}
                </button>
              )}
            </p>
          )}

          {post.legenda && (
            <p className="text-sm text-gray-500 italic">{post.legenda}</p>
          )}
        </div>
      )}

      {showComments && (
        <section className="pt-4 border-t mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Comentários
          </h3>
          <CommentBox postId={post.id} />
        </section>
      )}
    </article>
  );
}
