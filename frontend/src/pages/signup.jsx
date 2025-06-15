import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import { getDaysInMonth } from "../../../backend/utils/date";

export default function Signup() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [days, setDays] = useState(() =>
    Array.from({ length: getDaysInMonth(currentYear, 1) }, (_, i) => i + 1)
  );
  const months = [
    { value: "1", label: "Jan" },
    { value: "2", label: "Fev" },
    { value: "3", label: "Mar" },
    { value: "4", label: "Abr" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Jun" },
    { value: "7", label: "Jul" },
    { value: "8", label: "Ago" },
    { value: "9", label: "Set" },
    { value: "10", label: "Out" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dez" },
  ];
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    password: "",
    gender: "",
    day: "",
    month: "",
    year: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const count = getDaysInMonth(form.year || currentYear, form.month || 1);
    setDays(Array.from({ length: count }, (_, i) => i + 1));
    if (form.day && parseInt(form.day, 10) > count) {
      setForm((prev) => ({ ...prev, day: String(count) }));
    }
  }, [form.month, form.year]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    const novoErros = {};

    if (!form.firstName.trim()) novoErros.firstName = "Informe o nome";
    if (!form.lastName.trim()) novoErros.lastName = "Informe o apelido";

    if (!form.contact.trim()) {
      novoErros.contact = "Introduza e-mail ou nº de telemóvel";
    } else {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact);
      const phoneOk = /^\d{9}$/.test(form.contact);
      if (!emailOk && !phoneOk) {
        novoErros.contact = "Contacto inválido (e-mail ou 9 dígitos)";
      }
    }

    if (!form.password) {
      novoErros.password = "Crie uma senha";
    } else if (form.password.length < 6) {
      novoErros.password = "A senha deve ter pelo menos 6 caracteres";
    }

    if (!confirmPassword) {
      novoErros.confirmPassword = "Confirme a senha.";
    } else if (form.password !== confirmPassword) {
      novoErros.confirmPassword = "As senhas não coincidem.";
    }

    if (!form.day || !form.month || !form.year) {
      novoErros.birthDate = "Informe a data de nascimento";
    } else {
      const d = Number(form.day);
      const m = Number(form.month);
      const y = Number(form.year);
      const testDate = new Date(y, m - 1, d);
      if (
        Number.isNaN(testDate.getTime()) ||
        testDate.getFullYear() !== y ||
        testDate.getMonth() !== m - 1 ||
        testDate.getDate() !== d
      ) {
        novoErros.birthDate = "Data de nascimento inválida";
      }

    if (!form.gender) {
      novoErros.gender = "Selecione o gênero.";
    }

    setErros(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    if (!validar()) return;

    const birthDate = `${form.year}-${form.month.padStart(
      2,
      "0"
    )}-${form.day.padStart(2, "0")}`;

    try {
      const res = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, birthDate }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/verify", { state: { contact: form.contact } });
      } else {
        setMensagem(data.error || "Erro ao registar");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro na requisição");
    }
  };

  const inputBase =
    "w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-green-400 focus:outline-none";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20">
        <h1 className="text-5xl font-extrabold text-green-600 text-center">
          zebify
        </h1>
        <p className="text-gray-700 text-center mt-2 mb-8">
          Bem-vindo ao zebify! Junte-se à nossa comunidade.
        </p>

        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-300 ring-1 ring-green-200 w-full max-w-md text-gray-800">
          <h2 className="text-2xl font-semibold mb-2 text-center">
            Criar uma conta nova
          </h2>
          <p className="text-gray-600 mb-6 text-center">É rápido e fácil.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="firstName"
              placeholder="Nome próprio"
              value={form.firstName}
              onChange={handleChange}
              className={`${inputBase} ${erros.firstName && "border-red-500"}`}
            />
            {erros.firstName && (
              <p className="text-sm text-red-600 mt-1">{erros.firstName}</p>
            )}

            <input
              name="lastName"
              placeholder="Apelido"
              value={form.lastName}
              onChange={handleChange}
              className={`${inputBase} ${erros.lastName && "border-red-500"}`}
            />
            {erros.lastName && (
              <p className="text-sm text-red-600 mt-1">{erros.lastName}</p>
            )}

            <div className="flex space-x-2">
              <select
                name="day"
                value={form.day}
                onChange={handleChange}
                className={`${inputBase} ${
                  erros.birthDate && "border-red-500"
                }`}
              >
                <option value="">Dia</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                name="month"
                value={form.month}
                onChange={handleChange}
                className={`${inputBase} ${
                  erros.birthDate && "border-red-500"
                }`}
              >
                <option value="">Mês</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className={`${inputBase} ${
                  erros.birthDate && "border-red-500"
                }`}
              >
                <option value="">Ano</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {erros.birthDate && (
              <p className="text-sm text-red-600 mt-1">{erros.birthDate}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {["feminino", "masculino"].map((g) => (
                <label
                  key={g}
                  className={`flex items-center justify-between px-4 py-2 rounded-md border cursor-pointer select-none ${
                    form.gender === g
                      ? "border-green-500 bg-gray-50"
                      : "border-gray-300"
                  }`}
                >
                  <span className="capitalize">{g}</span>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                    className="accent-green-600"
                  />
                </label>
              ))}
            </div>
            {erros.gender && (
              <p className="text-sm text-red-600 mt-1">{erros.gender}</p>
            )}

            <input
              name="contact"
              placeholder="Email ou número de telemóvel"
              value={form.contact}
              onChange={handleChange}
              className={`${inputBase} ${erros.contact && "border-yellow-500"}`}
            />
            {erros.contact && (
              <p className="text-sm text-red-600 mt-1">{erros.contact}</p>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Senha"
                value={form.password}
                onChange={handleChange}
                className={`${inputBase} pr-10 ${
                  erros.password && "border-red-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {erros.password && (
              <p className="text-sm text-red-600 mt-1">{erros.password}</p>
            )}

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputBase} ${
                erros.confirmPassword && "border-red-500"
              }`}
            />
            {erros.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {erros.confirmPassword}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
            >
              Registrar
            </button>

            <p className="text-xs text-gray-600 text-center mt-2">
              Poderás receber notificações nossas por SMS e cancelá-las a
              qualquer altura.
            </p>
            <p className="text-sm text-center text-gray-600">
              Já tens uma conta?{" "}
              <a
                href="/login"
                className="text-green-600 hover:underline font-medium"
              >
                Entrar
              </a>
            </p>

            {mensagem && (
              <p className="mt-4 text-center text-green-600 font-medium">
                {mensagem}
              </p>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
}
