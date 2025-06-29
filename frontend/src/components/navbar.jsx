import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FaUsers, FaHome, FaUser, FaPlus, FaEnvelope } from "react-icons/fa";
import logoTexto from "../../assets/logoTexto.png";
import Avatar from "./avatar";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState(0);
  const [convs, setConvs] = useState([]);
  const [unread, setUnread] = useState(0);

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

  const buscarConversas = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setConvs([]);
          setUnread(0);
          logout();
          navigate("/login");
          return;
        }
        const txt = await res.text();
        throw new Error(txt);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setConvs(data);
        setUnread(data.reduce((s, c) => s + (c.unread_count || 0), 0));
      }
    } catch (err) {
      console.error("Erro ao buscar conversas:", err.message);
    }
  }, [logout, navigate]);

  useEffect(() => {
    if (!user) return;
    buscarPedidos();
    buscarConversas();
    const t = setInterval(buscarPedidos, 10000);
    const c = setInterval(buscarConversas, 10000);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, [user, buscarPedidos, buscarConversas]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Item = ({ Icon, to, badge, title, onClick }) => {
    const isActive = to && location.pathname === to;
    const handleClick = () => {
      if (onClick) onClick();
      else if (to) navigate(to);
    };
    return (
      <div
        onClick={handleClick}
        className={`relative cursor-pointer mx-2 flex items-center justify-center rounded-lg p-2 transition-all duration-200
          ${
            isActive
              ? "bg-emerald-100 shadow text-emerald-600"
              : "hover:bg-gray-100 text-gray-700"
          }
        `}
        title={title}
      >
        <Icon size={22} />
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow">
            {badge}
          </span>
        )}
      </div>
    );
  };

  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg px-6 py-3 flex justify-between items-center">
      <img
        src={logoTexto}
        alt="Zebify"
        onClick={() => navigate("/")}
        className="h-10 cursor-pointer transition-transform duration-200 hover:scale-105"
      />

      {!isAuthPage && (
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Ícones de navegação */}
              <Item Icon={FaHome} to="/" title="Feed" />
              <Item Icon={FaPlus} to="/new-post" title="Nova publicação" />
              <Item
                Icon={FaUsers}
                to="/users"
                badge={pedidos}
                title="Utilizadores / Pedidos"
              />
              <Item
                Icon={FaEnvelope}
                to="/messages"
                badge={unread}
                title="Conversas"
              />

              {/* Avatar + Olá + Sair */}
              <div className="flex items-center gap-3 ml-4">
                <div
                  onClick={() => navigate("/profile")}
                  title="Perfil"
                  className={`cursor-pointer transition hover:scale-105 ${
                    location.pathname === "/profile"
                      ? "ring-2 ring-emerald-400 rounded-full"
                      : ""
                  }`}
                >
                  <Avatar url={user.avatar_url} name={`${user.firstName} ${user.lastName}`} size={32} />

                </div>

                <span className="text-sm text-gray-700 font-semibold max-w-[150px] truncate">
                  Olá,{" "}
                  <span className="text-emerald-600">
                    {user.firstName} {user.lastName}
                  </span>
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 text-sm font-semibold shadow transition"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-1 rounded transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-gray-700 hover:text-emerald-600 font-medium px-3 py-1 rounded transition"
              >
                Registo
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
