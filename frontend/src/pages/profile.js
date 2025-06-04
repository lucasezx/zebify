import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import "../css/profile.css";
import Footer from "../components/footer";
import PostItem from "../components/postItem";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

const Profile = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [meusPosts, setMeusPosts] = useState([]);

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
        setMeusPosts(data);
      } catch (err) {
        console.error("Erro ao carregar publicações:", err.message);
      }
    };

    fetchMinhasPublicacoes();
  }, [user, token]);

  if (!user) return <Navigate to="/login" />;
  
  return (
    <>
      <div className="profile-container">
        <h1>Meu Perfil</h1>
        <p>
          <strong>Nome:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <h2 style={{ marginTop: "30px" }}>Minhas Publicações</h2>
        {meusPosts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
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
