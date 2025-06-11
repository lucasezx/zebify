// src/pages/NewPostPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import NewPost from "../components/newPost";
import Footer from "../components/footer";

const NewPostPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Criar nova publicação</h1>

      {/* Reaproveita o componente que você já tem */}
      <NewPost onPostSuccess={() => navigate("/")} />

      <Footer />
    </div>
  );
};

export default NewPostPage;
