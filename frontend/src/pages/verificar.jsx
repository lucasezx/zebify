import React, { useState } from "react";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const Verificar = () => {
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [verificado, setVerificado] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const res = await fetch(`${API}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, code }),
      });

      const data = await res.json();
      if (res.ok) {
        setVerificado(true);
        setMensagem(
          "Conta verificada com sucesso! Redirecionando para o login..."
        );
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMensagem(data.error || "Erro ao verificar.");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro na requisição.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-green-100">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center bg-green-100 p-4 rounded-full mb-2 shadow">
              <img
                src="/assets/confirmation.svg"
                alt="Verificação de Conta"
                className="w-26 h-26 object-contain"
                style={{ aspectRatio: "1 / 1" }}
              />
            </div>
            <h2 className="text-3xl font-extrabold text-center text-green-700">
              Confirmação de Conta
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Insere o email ou número usado no registo e o código de
              verificação.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Email ou número de telemóvel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            />

            <input
              type="text"
              placeholder="Código de verificação"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            />

            <button
              onClick={handleVerify}
              disabled={verificado}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-md transition disabled:opacity-60"
            >
              {verificado ? "Verificando..." : "Verificar"}
            </button>
          </div>

          {mensagem && (
            <div
              className={`text-center font-semibold px-4 py-2 rounded-lg mt-2 ${
                verificado
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {mensagem}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Verificar;
