import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "../css/navbar.css";
import { FaUsers } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const irParaUtilizadores = () => {
    navigate("/users");
  };

  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {isLoginPage || isSignupPage ? (
          <span className="logo">Zebify</span>
        ) : (
          <Link to="/" className="logo">
            Zebify
          </Link>
        )}

        {!isLoginPage && !isSignupPage && user && (
          <Link to="/profile">Perfil</Link>
        )}
      </div>

      <div className="navbar-right">
        {!isLoginPage && !isSignupPage && user && (
          <>
            {/* Ícone de usuários */}
            <FaUsers
              onClick={irParaUtilizadores}
              size={20}
              style={{ cursor: "pointer", marginRight: "15px" }}
              title="Ver utilizadores"
            />

            <span className="welcome">Bem-vindo, {user.name}</span>

            <button
              className="btn-sair"
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
              }}
              onClick={handleLogout}
            >
              Sair
            </button>
          </>
        )}

        {isLoginPage && <Link to="/signup">Registo</Link>}
        {isSignupPage && <Link to="/login">Login</Link>}
      </div>
    </nav>
  );
};

export default Navbar;