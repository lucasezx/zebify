import React, { useEffect, useState } from "react";
import Footer from "../components/footer";
import CommentBox from "../components/commentBox";
import socket from "../socket";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

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

    socket.on("atualizar_feed", () => {
      console.log("Recebido: atualizar_feed");
      fetchPosts();
    });

    socket.on("postagem_editada", () => {
      console.log("Post atualizado, recarregando feed...");
      fetchPosts();
    });

    socket.on("postagem_deletada", (postId) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    });

    socket.on("amizade_aceita", ({ userId1, userId2 }) => {
      const meuId = JSON.parse(localStorage.getItem("user"))?.id;
      if (meuId === userId1 || meuId === userId2) {
        console.log("Amizade aceita, recarregando feed...");
        fetchPosts();
      }
    });

    socket.on("amizade_removida", ({ userId1, userId2 }) => {
      const meuId = JSON.parse(localStorage.getItem("user"))?.id;
      if (meuId === userId1 || meuId === userId2) {
        console.log("Amizade removida — recarregando feed...");
        fetchPosts();
      }
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
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Bem-vindo ao Zebify</h1>
      <PostList posts={posts} />
      <Footer />
    </div>
  );
};

const PostList = ({ posts }) => (
  <div style={{ marginTop: "20px" }}>
    {posts.map((post) => (
      <div key={post.id} style={postStyle}>
        <h2>
          @{post.author}
          {post.visibility === "friends" && (
            <span
              style={{ fontSize: "12px", color: "#777", marginLeft: "6px" }}
            >
              🔒 Apenas amigos
            </span>
          )}
        </h2>

        {post.tipo === "texto" && <p>{post.conteudo}</p>}

        {post.tipo === "imagem" && (
          <>
            <img
              src={`${API}/uploads/${post.imagem_path}`}
              alt="imagem"
              style={{ width: "100%", maxWidth: "400px" }}
            />
            <p>{post.legenda}</p>
          </>
        )}

        <small>{new Date(post.created_at).toLocaleString()}</small>
        <CommentBox postId={post.id} />
      </div>
    ))}
  </div>
);

const postStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px",
  backgroundColor: "#f9f9f9",
};

export default Home;
