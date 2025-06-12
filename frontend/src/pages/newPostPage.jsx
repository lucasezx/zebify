import React from "react";
import { useNavigate } from "react-router-dom";
import NewPost from "../components/newPost";
import Footer from "../components/footer";

const NewPostPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 flex justify-center items-start pt-20 px-4">
        <NewPost onPostSuccess={() => navigate("/")} />
      </main>
      <Footer />
    </div>
  );
};

export default NewPostPage;
