  import React, { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { useAuth } from "../context/authContext.js";
  import "../components/footer";
  import Footer from "../components/footer";

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
          localStorage.setItem("user", JSON.stringify(data.user));
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
      <div className="login-page">
        <div className="login-box">
          <h2>Entrar na Zebify</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" onClick={handleLogin}>
              Entrar
            </button>
            <p>
              Não tem uma conta? <a href="/signup">Registe-se</a>
            </p>
          </form>
          {mensagem && <p>{mensagem}</p>}
        </div>
        <Footer />
      </div>
    );
  };

  export default Login;
