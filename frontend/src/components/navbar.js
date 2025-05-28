import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FaUsers, FaHome, FaUser, FaPlus } from "react-icons/fa";
import "../css/navbar.css";

const API = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState(0);

  const buscarPedidos = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setPedidos(0);
          logout();
          navigate("/login");
          return;
        }
        const txt = await res.text();
        throw new Error(txt);
      }

      const data = await res.json();
      setPedidos(data.length);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err.message);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) return;
    buscarPedidos();
    const t = setInterval(buscarPedidos, 10_000);
    return () => clearInterval(t);
  }, [user, buscarPedidos]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Item = ({ Icon, to, badge, title }) => (
    <div
      onClick={() => navigate(to)}
      style={{ position: "relative", marginRight: "18px", cursor: "pointer" }}
      title={title}
    >
      <Icon
        size={22}
        color={location.pathname === to ? "#4287f5" : undefined}
      />
      {badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "-8px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );

  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo" onClick={() => navigate("/")}>
          Zebify
        </span>
      </div>

      <div className="navbar-right">
        {user && !isAuthPage ? (
          <>
            <Item Icon={FaHome} to="/" title="Feed" />

            <Item Icon={FaPlus} to="/new-post" title="Nova publicação" />

            <Item
              Icon={FaUsers}
              to="/users"
              badge={pedidos}
              title="Utilizadores / Pedidos"
            />

            <Item Icon={FaUser} to="/profile" title="Perfil" />

            <span className="welcome">Olá, {user.name}</span>
            <button className="btn-sair" onClick={handleLogout}>
              Sair
            </button>
          </>
        ) : (
          !isAuthPage && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Registo</Link>
            </>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;
