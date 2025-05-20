import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <span style={{ margin: "0 10px" }}></span>
        <Link to="/profile">Perfil</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span>Bem-vindo, {user.name}</span>
            <button onClick={logout}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Cadastro</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
