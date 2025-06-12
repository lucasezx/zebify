import React, { useEffect, useState } from "react";
import Footer from "../components/footer";
import socket from "../socket";
import PostCard from "../components/postCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao carregar posts.");

      if (Array.isArray(data)) {
        setPosts(data);
        setErro("");
      } else {
        throw new Error("Resposta inesperada do servidor.");
      }
    } catch (err) {
      setErro(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    socket.on("atualizar_feed", fetchPosts);
    socket.on("postagem_editada", fetchPosts);
    socket.on("postagem_deletada", (postId) =>
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    );

    socket.on("amizade_aceita", ({ userId1, userId2 }) => {
      const meuId = JSON.parse(localStorage.getItem("user"))?.id;
      if (meuId === userId1 || meuId === userId2) fetchPosts();
    });

    socket.on("amizade_removida", ({ userId1, userId2 }) => {
      const meuId = JSON.parse(localStorage.getItem("user"))?.id;
      if (meuId === userId1 || meuId === userId2) fetchPosts();
    });

    return () => {
      socket.off("atualizar_feed");
      socket.off("postagem_editada");
      socket.off("postagem_deletada");
      socket.off("amizade_aceita");
      socket.off("amizade_removida");
    };
  }, []);

  return (
    <main className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-emerald-700">
            Bem-vindo ao Zebify
          </h1>
          <p className="text-sm text-gray-500">
            Veja as últimas publicações dos seus amigos
          </p>
        </header>

        {loading ? (
          <div className="text-center py-10 text-gray-500 animate-pulse">
            Carregando posts...
          </div>
        ) : erro ? (
          <div className="text-center py-10 text-red-500">{erro}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Nenhuma publicação ainda.
          </div>
        ) : (
          <section className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onChange={fetchPosts} />
            ))}
          </section>
        )}

        <Footer />
      </div>
    </main>
  );
};

export default Home;
