import React from "react";
import { useNavigate } from "react-router-dom";
import NewPost from "../components/newPost";
import Footer from "../components/footer";

const NewPostPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br pt-20">
      <main className="flex flex-col items-center justify-start px-4 py-10 flex-1">
        <div className="bg-white border border-gray-300 shadow-md rounded-xl p-14 w-full max-w-5xl flex flex-col lg:flex-row gap-14 transition-all duration-300">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
              Crie um novo post
            </h2>
            <NewPost onPostSuccess={() => navigate("/")} />
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <img
              src="/assets/posting.svg"
              alt="Ilustração"
              className="max-w-[220px] drop-shadow-lg rounded-xl"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default NewPostPage;
