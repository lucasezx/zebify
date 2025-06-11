import React, { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [mensagem, setMensagem] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem("Cadastro feito com sucesso!");
        setForm({ name: "", email: "", password: "" });
      } else {
        setMensagem(data.error || "Erro ao cadastrar.");
      }
    } catch (error) {
      console.error("Erro:", error);
      setMensagem("Erro na requisição.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Registar</button>
          <p>
            Já tem uma conta? <a href="/login">Entrar</a>
          </p>
        </form>
        {mensagem && <p>{mensagem}</p>}
      </div>
    </div>
  );
}
