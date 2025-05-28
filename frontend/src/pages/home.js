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

    return () => {
      socket.off("atualizar_feed");
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
