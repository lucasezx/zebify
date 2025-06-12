import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import "../css/profile.css";
import Footer from "../components/footer";
import PostCard from "../components/postCard";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return null;

  const [ano, mes, dia] = dataNascimento.split("-").map(Number);
  const hoje = new Date();
  const nascimento = new Date(ano, mes - 1, dia);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
};

const Profile = () => {
  const { user, login } = useAuth();
  const token = localStorage.getItem("token");

  const [meusPosts, setMeusPosts] = useState([]);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(user?.firstName || "");
  const [apelido, setApelido] = useState(user?.lastName || "");
  const [idade, setIdade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");

  useEffect(() => {
    if (user?.birth_date) {
      const [anoNasc, mesNasc, diaNasc] = user.birth_date.split("-");
      setAno(anoNasc);
      setMes(mesNasc);
      setDia(diaNasc);
      setIdade(calcularIdade(user.birth_date));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchMinhasPublicacoes = async () => {
      try {
        const res = await fetch(`${API}/api/my-posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setMeusPosts(
          data.map((post) => ({
            ...post,
            author: `${user.firstName} ${user.lastName}`,
          }))
        );
      } catch (err) {
        console.error("Erro ao carregar publicações:", err.message);
      }
    };
    fetchMinhasPublicacoes();
  }, [user, token]);

  const salvarAlteracoes = async () => {
    try {
      const novaData = new Date();
      novaData.setFullYear(novaData.getFullYear() - parseInt(idade));
      const novaDataStr = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(
        2,
        "0"
      )}`;

      if (!dia || !mes || !ano) {
        setMensagem("Por favor, preencha dia, mês e ano.");
        return;
      }

      const res = await fetch(`${API}/api/users/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: nome,
          lastName: apelido,
          birthDate: novaDataStr,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        login({
          ...user,
          firstName: nome,
          lastName: apelido,
          birth_date: novaDataStr,
        });
        setMensagem("Perfil atualizado com sucesso.");
        setEditando(false);
      } else {
        setMensagem(data.error || "Erro ao atualizar.");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro na requisição.");
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <>
      <div className="profile-container">
        <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

        {/* Caixa com os dados do perfil */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Informações do Perfil
          </h2>

          <div className="space-y-2 text-lg text-gray-800 font-semibold">
            <p>
              <strong>Nome:</strong>{" "}
              {editando ? (
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="border px-2 py-1 rounded font-normal text-base"
                />
              ) : (
                nome
              )}
            </p>
            <p>
              <strong>Apelido:</strong>{" "}
              {editando ? (
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  className="border px-2 py-1 rounded font-normal text-base"
                />
              ) : (
                apelido
              )}
            </p>
            <p>
              <strong>Email:</strong> {user.email || user.contact}
            </p>
            <p className="flex items-center gap-2 flex-wrap">
              <strong>Idade:</strong>
              {editando ? (
                <>
                  <select
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                    className="border px-2 py-2 rounded font-normal text-base w-full sm:w-auto appearance-none pr-8"
                  >
                    <option value="">Dia</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className="border px-2 py-2 rounded font-normal text-base w-full sm:w-auto appearance-none pr-8"
                  >
                    <option value="">Mês</option>
                    {[
                      "Jan",
                      "Fev",
                      "Mar",
                      "Abr",
                      "Mai",
                      "Jun",
                      "Jul",
                      "Ago",
                      "Set",
                      "Out",
                      "Nov",
                      "Dez",
                    ].map((nome, i) => (
                      <option key={i + 1} value={i + 1}>
                        {nome}
                      </option>
                    ))}
                  </select>
                  <select
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="border px-2 py-2 rounded font-normal text-base w-full sm:w-auto appearance-none pr-8"
                  >
                    <option value="">Ano</option>
                    {Array.from(
                      { length: 120 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </>
              ) : user.birth_date ? (
                `${idade} anos`
              ) : (
                "Não informado"
              )}
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            {editando ? (
              <>
                <button
                  onClick={salvarAlteracoes}
                  className="bg-green-600 text-white px-6 py-1 rounded hover:bg-green-700 font-bold text-lg"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="bg-red-600 text-white px-6 py-1 rounded hover:bg-gray-400 font-bold text-lg"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 font-bold text-lg"
              >
                ✏️ Editar Perfil
              </button>
            )}
          </div>

          {mensagem && (
            <p className="mt-3 text-green-600 text-lg font-bold">{mensagem}</p>
          )}
        </div>

        {/* Publicações */}
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Minhas Publicações
        </h2>
        {meusPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwner={true}
            showComments={false}
            onChange={async () => {
              try {
                const res = await fetch(`${API}/api/my-posts`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setMeusPosts(data);
              } catch (err) {
                console.error("Erro ao atualizar posts:", err.message);
              }
            }}
          />
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Profile;
