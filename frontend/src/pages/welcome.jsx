import { useAuth } from "../context/authContext.jsx";
import { Navigate, useNavigate } from "react-router-dom";

const Welcome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Carregando...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-16 min-h-screen px-6 py-12 bg-white animate-fade-in">
      <div className="max-w-xl mb-10 md:mb-0">
        <h1 className="text-5xl font-extrabold text-green-600 mb-2 flex items-center gap-2">
          Bem-vindo
        </h1>
        <h2 className="text-xl text-black font-bold mb-4">
          Olá, {user.firstName || user.name}!
        </h2>
        <p className="text-gray-600 mb-6">
          Agora você faz parte da comunidade Zebify. Explore postagens, comente
          e interaja com outros utilizadores!
        </p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
        >
          Continuar ➪
        </button>
      </div>

      <div className="max-w-md">
        <img
          src="/assets/welcome.svg"
          alt="Ilustração de boas-vindas"
          className="w-72 md:w-96"
        />
      </div>
    </div>
  );
};

export default Welcome;
