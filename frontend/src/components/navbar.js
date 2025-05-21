import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
        {isLoginPage && <Link to="/signup">Cadastro</Link>}

        {isSignupPage && <Link to="/login">Login</Link>}

        {!isLoginPage &&
          !isSignupPage &&
          (user ? (
            <>
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
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Cadastro</Link>
            </>
          ))}
      </div>
    </nav>
  );
};

export default Navbar;
