import React from "react";
import { useNavigate } from "react-router-dom";
import NewPost from "../components/newPost";
import Footer from "../components/footer";

const NewPostPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 pt-10">
      <NewPost onPostSuccess={() => navigate("/")} />
      <Footer />
    </div>
  );
};

export default NewPostPage;
