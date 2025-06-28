import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import PostCard from "../components/postCard";
import Avatar from "../components/avatar";
import ProfilePictureModal from "../components/profilePictureModal";
import Footer from "../components/footer";
import socket from "../socket";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function UserProfile() {
  const { id } = useParams();
  const { user: loggedUser, token } = useAuth();

  const viewId = Number(id);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [picModal, setPicModal] = useState({ open: false, url: "" });
  const [friendshipStatus, setStatus] = useState("nenhum");

  useEffect(() => {
    if (!socket || !loggedUser) return;
    const me = loggedUser.id;

    const onRequest = ({ senderId, receiverId }) => {
      const sid = Number(senderId),
        rid = Number(receiverId);
      if (me === sid && viewId === rid) setStatus("pendente");
      else if (me === rid && viewId === sid) setStatus("recebido");
    };
    const onCancel = ({ senderId, receiverId, userId1, userId2 }) => {
      const sid = Number(senderId ?? userId1);
      const rid = Number(receiverId ?? userId2);

      if (
        (loggedUser.id === sid && viewId === rid) ||
        (loggedUser.id === rid && viewId === sid)
      ) {
        setStatus("nenhum");
        loadProfileAndPosts();
      }
    };

    const onAccept = ({ userId1, userId2 }) => {
      const u1 = Number(userId1),
        u2 = Number(userId2);
      if ((me === u1 && viewId === u2) || (me === u2 && viewId === u1))
        setStatus("amigos");
    };

    socket.on("pedido_enviado", onRequest);
    socket.on("pedido_cancelado", onCancel);
    socket.on("amizade_aceita", onAccept);
    socket.on("amizade_removida", onCancel);

    return () => {
      socket.off("pedido_enviado", onRequest);
      socket.off("pedido_cancelado", onCancel);
      socket.off("amizade_aceita", onAccept);
      socket.off("amizade_removida", onCancel);
    };
  }, [loggedUser, viewId]);

  useEffect(() => {
    const onProfileUpdated = (payload) => {
      const uid =
        typeof payload === "object" && payload !== null ? payload.id : payload;
      if (Number(uid) === viewId) loadProfileAndPosts();
    };

    socket.on("profileUpdated", onProfileUpdated);
    return () => socket.off("profileUpdated", onProfileUpdated);
  }, [viewId]);

  const loadProfileAndPosts = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [p, ps] = await Promise.all([
        fetch(`${API}/api/users/${viewId}`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/users/${viewId}/posts`, { headers }).then((r) =>
          r.json()
        ),
      ]);
      setProfile(p);
      setStatus(p.friendshipStatus ?? "nenhum");
      setPosts(ps);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    setLoading(true);
    loadProfileAndPosts();
  }, [viewId, token]);

  const executarAcao = async (url, method = "POST", body = null) => {
    try {
      setLoadingAcao(true);
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body && { "Content-Type": "application/json" }),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Erro.");
        return;
      }

      const data = await res.json();

      if (data.novoStatus) {
        setStatus(data.novoStatus);
      } else {
        if (url.includes("/request") && method === "POST")
          setStatus("pendente");
        if (url.includes("/request") && method === "DELETE")
          setStatus("nenhum");
        if (url.includes("/accept")) setStatus("amigos");
        if (url.includes("/reject")) setStatus("nenhum");
        if (url.includes("/friends/") && method === "DELETE")
          setStatus("nenhum");
      }

      await loadProfileAndPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAcao(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando…</div>;
  if (!profile)
    return <div className="p-8 text-center">Utilizador não encontrado.</div>;

  const memberSince = new Date(profile.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="container mx-auto pt-20 px-6 flex flex-col gap-8 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <Avatar
              url={profile.avatar_url}
              name={`${profile.firstName} ${profile.lastName}`}
              size={96}
              className={
                profile.avatar_url ? "cursor-pointer" : "cursor-default"
              }
              onClick={() => {
                const avatar = profile.avatar_url;
                const fullUrl =
                  !avatar || ["null", "undefined"].includes(avatar)
                    ? null
                    : /^(https?:|blob:|data:)/.test(avatar)
                    ? avatar
                    : `${API}/uploads/${avatar}`;
                setPicModal({ open: true, url: fullUrl });
              }}
            />
            <div>
              <h1 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-sm text-gray-500">
                Membro desde {memberSince}
              </p>
              <p className="text-sm text-gray-500">
                {posts.length} publicações
              </p>
            </div>
          </div>

          {loggedUser?.id !== viewId && (
            <div className="flex gap-3">
              {friendshipStatus === "nenhum" && (
                <button
                  type="button"
                  disabled={loadingAcao}
                  onClick={() =>
                    executarAcao(`${API}/api/friends/request`, "POST", {
                      receiverId: viewId,
                    })
                  }
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full shadow transition"
                >
                  Adicionar amigo
                </button>
              )}
              {friendshipStatus === "pendente" && (
                <button
                  disabled={loadingAcao}
                  onClick={() =>
                    executarAcao(
                      `${API}/api/friends/request/${viewId}`,
                      "DELETE"
                    )
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-full shadow transition"
                >
                  Cancelar pedido
                </button>
              )}
              {friendshipStatus === "recebido" && (
                <>
                  <button
                    disabled={loadingAcao}
                    onClick={() =>
                      executarAcao(`${API}/api/friends/accept`, "POST", {
                        senderId: viewId,
                      })
                    }
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full shadow transition"
                  >
                    Aceitar
                  </button>
                  <button
                    disabled={loadingAcao}
                    onClick={() =>
                      executarAcao(`${API}/api/friends/reject`, "POST", {
                        senderId: viewId,
                      })
                    }
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full shadow transition"
                  >
                    Recusar
                  </button>
                </>
              )}
              {friendshipStatus === "amigos" && (
                <button
                  disabled={loadingAcao}
                  onClick={() =>
                    executarAcao(`${API}/api/friends/${viewId}`, "DELETE")
                  }
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full shadow transition"
                >
                  Remover amigo
                </button>
              )}
            </div>
          )}
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Publicações</h2>
          {posts.length === 0 ? (
            <p className="text-center text-slate-500">
              Este utilizador ainda não publicou nada.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} readOnly />
              ))}
            </div>
          )}
        </section>
      </div>

      {picModal.open && (
        <ProfilePictureModal
          isOpen={picModal.open}
          onClose={() => setPicModal({ open: false, url: "" })}
          imageUrl={picModal.url}
          hideName
        />
      )}

      <Footer />
    </div>
  );
}
