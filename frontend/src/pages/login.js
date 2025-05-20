import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.js";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
        localStorage.setItem("token", data.token);

        setMensagem("Login realizado com sucesso!");
        navigate("/welcome"); 
      } else {
        setMensagem(data.error || "Erro ao fazer login.");
      }
    } catch (error) {
      console.error("Erro:", error);
      setMensagem("Erro na requisição.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <button onClick={handleLogin}>Entrar</button>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
};

export default Login;
