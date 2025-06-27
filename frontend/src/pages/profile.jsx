import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import Footer from "../components/footer";
import PostCard from "../components/postCard";
import { getDaysInMonth } from "../../../backend/utils/date";
import Avatar from "../components/avatar";
import ProfilePictureModal from "../components/profilePictureModal";

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
  const [erros, setErros] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [picModal, setPicModal] = useState({ open: false, url: "" });

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
    setAvatarPreview(user?.avatar_url || null);
  }, [user?.avatar_url]);

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

  useEffect(() => {
    const maxDia = getDaysInMonth(ano || new Date().getFullYear(), mes || 1);
    if (dia && parseInt(dia) > maxDia) {
      setDia(String(maxDia));
    }
  }, [mes, ano]);

  const validar = () => {
    const novoErros = {};

    if (!nome.trim()) novoErros.nome = "Informe o nome";
    if (!apelido.trim()) novoErros.apelido = "Informe o apelido";

    if (!dia || !mes || !ano) {
      novoErros.birthDate = "Informe a data de nascimento";
    } else if (parseInt(dia) > getDaysInMonth(ano, mes)) {
      novoErros.birthDate = "Data de nascimento inválida";
    }

    setErros(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const salvarAlteracoes = async () => {
    if (!validar()) return;
    try {
      const birthDateStr = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(
        2,
        "0"
      )}`;

      const res = await fetch(`${API}/api/users/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: nome,
          lastName: apelido,
          birthDate: birthDateStr,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMensagem(err.error || "Erro ao atualizar.");
        return;
      }

      let userAtualizado = {
        ...user,
        firstName: nome,
        lastName: apelido,
        birth_date: birthDateStr,
        avatar_url: user.avatar_url,
      };

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const up = await fetch(`${API}/api/users/avatar`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (up.ok) userAtualizado = await up.json();
      }

      if (avatarRemoved && !avatarFile) {
        const del = await fetch(`${API}/api/users/avatar`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (del.ok) userAtualizado = await del.json();
      }

      login(userAtualizado);
      setEditando(false);
      setMensagem("Perfil atualizado com sucesso.");
      setAvatarRemoved(false);
    } catch (err) {
      console.error(err);
      setMensagem("Erro na requisição.");
    }
  };

  if (!user) return <Navigate to="/login" />;

  const showAvatarUrl = avatarPreview
    ? /^(https?:|blob:|data:)/.test(avatarPreview)
      ? avatarPreview 
      : `${API}/uploads/${avatarPreview}` 
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 pt-24 px-4 max-w-3xl w-full mx-auto">
        <div className="bg-white/10 border border-gray-400 rounded-2xl p-8 shadow-lg mb-10 relative overflow-hidden">
          <div className="absolute top-6 right-6 z-10">
            <div className="relative group w-24 h-24">
              <Avatar
                url={showAvatarUrl}
                name={`${user.firstName} ${user.lastName}`}
                size={96}
                className={
                  !editando && showAvatarUrl
                    ? "cursor-pointer"
                    : "cursor-default"
                }
                onClick={
                  !editando && showAvatarUrl
                    ? () => setPicModal({ open: true, url: showAvatarUrl })
                    : undefined
                }
              />

              {editando && (
                <>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <label className="cursor-pointer text-white text-xl hover:scale-110 transition">
                      📷
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                            setAvatarRemoved(false);
                          }
                        }}
                      />
                    </label>

                    {(avatarPreview || user.avatar_url) && (
                      <button
                        type="button"
                        className="text-white text-xl hover:scale-110 transition"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                          setAvatarRemoved(true);
                        }}
                        title="Remover foto"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-extrabold mb-2 text-green-800 drop-shadow-sm">
            Meu Perfil
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            Gerencie suas informações pessoais e veja suas publicações.
          </p>

          <div className="space-y-4 text-lg text-gray-800 font-semibold">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className="w-32 text-gray-600 font-bold">Nome:</span>
              {editando ? (
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={50}
                  className={`border px-3 py-2 rounded-lg font-normal text-base shadow-sm focus:ring-2 focus:ring-purple-300 transition ${
                    erros.nome && "border-red-500"
                  }`}
                />
              ) : (
                <span>{nome}</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className="w-32 text-gray-600 font-bold">Apelido:</span>
              {editando ? (
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  maxLength={50}
                  className={`border px-3 py-2 rounded-lg font-normal text-base shadow-sm focus:ring-2 focus:ring-purple-300 transition ${
                    erros.apelido && "border-red-500"
                  }`}
                />
              ) : (
                <span>{apelido}</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className="w-32 text-gray-600 font-bold">Email:</span>
              <span>{user.email || user.contact}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className="w-32 text-gray-600 font-bold">Idade:</span>
              {editando ? (
                <div className="flex gap-2 flex-wrap w-full">
                  <select
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                    className={`border px-2 py-2 rounded-lg font-normal text-base w-24 appearance-none shadow-sm focus:ring-2 focus:ring-purple-300 transition ${
                      erros.birthDate && "border-red-500"
                    }`}
                  >
                    <option value="">Dia</option>
                    {Array.from(
                      {
                        length: getDaysInMonth(
                          ano || new Date().getFullYear(),
                          mes || 1
                        ),
                      },
                      (_, i) => i + 1
                    ).map((d) => (
                      <option key={d} value={d.toString().padStart(2, "0")}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className={`border px-2 py-2 rounded-lg font-normal text-base w-28 appearance-none shadow-sm focus:ring-2 focus:ring-purple-300 transition ${
                      erros.birthDate && "border-red-500"
                    }`}
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
                      <option
                        key={i + 1}
                        value={(i + 1).toString().padStart(2, "0")}
                      >
                        {nome}
                      </option>
                    ))}
                  </select>
                  <select
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className={`border px-2 py-2 rounded-lg font-normal text-base w-28 appearance-none shadow-sm focus:ring-2 focus:ring-purple-300 transition ${
                      erros.birthDate && "border-red-500"
                    }`}
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
                  {erros.birthDate && (
                    <p className="text-sm text-red-600 mt-1 w-full">
                      {erros.birthDate}
                    </p>
                  )}
                </div>
              ) : user.birth_date ? (
                <span>{idade} anos</span>
              ) : (
                <span className="italic text-gray-400">Não informado</span>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            {editando ? (
              <>
                <button
                  onClick={salvarAlteracoes}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow transition-all duration-150 border border-green-700/30 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Salvar
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow border border-red-700/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-green-600 flex items-center gap-2"
              >
                <span role="img" aria-label="Editar">
                  ✏️
                </span>{" "}
                Editar Perfil
              </button>
            )}
          </div>

          {mensagem && (
            <p className="mt-4 text-green-700 text-lg font-bold">{mensagem}</p>
          )}
        </div>

        <h2 className="text-2xl font-bold text-green-700 mb-4 mt-10">
          Minhas Publicações
        </h2>
        <div className="space-y-6">
          {meusPosts.length === 0 && (
            <div className="text-gray-400 italic text-lg">
              Você ainda não publicou nada.
            </div>
          )}
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
      </main>
      <ProfilePictureModal
        isOpen={picModal.open}
        onClose={() => setPicModal({ ...picModal, open: false })}
        imageUrl={picModal.url}
        hideName={true}
      />
      <Footer />
    </div>
  );
};

export default Profile;
