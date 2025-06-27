import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Footer from "../components/footer";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const Login = () => {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, password }),
      });

      const data = await res.json();

      if (res.ok && data.user && data.user.verified === false) {
        setMensagem(
          "Por favor, confirme o código enviado antes de fazer login."
        );
        return;
      }

      if (res.ok) {
        login(data.user, data.token);
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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl">
          <div className="mb-10 md:mb-0 md:w-1/2 flex items-center gap-6">
            <img src={logo} alt="Zebify" className="w-32 h-auto" />
            <p className="text-xl text-gray-700">
              O Zebify ajuda-te a partilhar ideias com o mundo.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-300 w-full md:w-1/3 ring-1 ring-green-200">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <input
                type="text"
                placeholder="Email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition"
              >
                Iniciar Sessão
              </button>

              <a
                href="/signup"
                className="block text-center text-green-600 hover:underline font-medium"
              >
                Criar nova conta
              </a>

              {mensagem && (
                <>
                  <p className="text-center text-red-600 font-medium">
                    {mensagem}
                  </p>
                  {mensagem.includes("não verificada") && (
                    <p className="text-center mt-2 text-sm text-gray-600">
                      <Link
                        to="/verify"
                        className="text-green-600 hover:underline"
                      >
                        Verificar agora
                      </Link>
                    </p>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
