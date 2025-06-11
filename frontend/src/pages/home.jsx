import React, { useEffect, useState } from "react";
import Footer from "../components/footer";
import socket from "../socket";
import PostCard from "../components/postCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPosts(data);
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
          <div className="bg-green-500 text-white p-4 rounded-lg">
  Tailwind funcionando 🎉
</div>

          <p className="text-sm text-gray-500">
            Veja as últimas publicações dos seus amigos
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 animate-pulse">
            Carregando posts...
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
