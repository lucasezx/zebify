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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-emerald-600 mb-4">
        Olá, {user.firstName || user.name}! Bem-vindo ao Zebify.
      </h1>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Ir para Home
      </button>
    </div>
  );
};

export default Welcome;
