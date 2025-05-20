import { useAuth } from "../context/authContext.js";
import { Navigate, useNavigate } from "react-router-dom";

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <h1>Olá, {user.name}! Bem-vindo ao Zebify.</h1>
      <button onClick={() => navigate("/")}>Ir para Home</button>
    </div>
  );
};

export default Welcome;
