import React, { useEffect, useState } from "react";
import "../css/style.css";
import Footer from "../components/footer";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      window.location.href = "/login";
      return;
    }

    const mockPosts = [
      { id: 1, author: "Lucas", content: "Olá, mundo!", likes: 10 },
      { id: 2, author: "Ana", content: "Estou usando o Zebify!", likes: 5 },
    ];
    setPosts(mockPosts);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Bem-vindo ao Zebify</h1>
      <PostList posts={posts} />
      <Footer />
    </div>
  );
};

const PostList = ({ posts }) => {
  if (posts.length === 0) {
    return <p>Nenhuma publicação ainda.</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  );
};

const Post = ({ author, content, likes }) => (
  <div style={postStyle}>
    <h2>@{author}</h2>
    <p>{content}</p>
    <p>❤️ {likes} curtidas</p>
  </div>
);

const postStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "15px",
  backgroundColor: "#f9f9f9"
};

export default Home;
