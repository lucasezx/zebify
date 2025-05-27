import React, { useEffect, useState } from "react";
import NewPost from "../components/newPost";
import Footer from "../components/footer";
import CommentBox from "../components/commentBox";

const Home = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await fetch("http://localhost:3001/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Bem-vindo ao Zebify</h1>
      <NewPost onPostSuccess={fetchPosts} />
      <PostList posts={posts} />
      <Footer />
    </div>
  );
};

const PostList = ({ posts }) => (
  <div style={{ marginTop: "20px" }}>
    {posts.map((post) => (
      <div key={post.id} style={postStyle}>
        <h2>@{post.author}</h2>
        {post.tipo === "texto" && <p>{post.conteudo}</p>}
        {post.tipo === "imagem" && (
          <>
            <img
              src={`http://localhost:3001/uploads/${post.imagem_path}`}
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
