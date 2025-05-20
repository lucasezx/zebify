import React from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import "./profile.css";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-container">
      <h1>Meu Perfil</h1>
      <p><strong>Nome:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
};

export default Profile;
