import React, { useState } from "react";
import Footer from "../components/footer";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const Verificar = () => {
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [verificado, setVerificado] = useState(false);

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
        setMensagem("Conta verificada com sucesso! Faça login.");
      } else {
        setMensagem(data.error || "Erro ao verificar.");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro na requisição.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 pt-20 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold text-center text-green-600">
            Verificar Conta
          </h2>
          <p className="text-sm text-gray-600 text-center">
            Insere o email ou número usado no registo e o código recebido.
          </p>

          <input
            type="text"
            placeholder="Email ou número de telemóvel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
          />

          <input
            type="text"
            placeholder="Código de verificação"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
          />

          <button
            onClick={handleVerify}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md"
          >
            Verificar
          </button>

          {mensagem && (
            <p
              className={`text-center font-medium ${
                verificado ? "text-green-600" : "text-red-600"
              }`}
            >
              {mensagem}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Verificar;
