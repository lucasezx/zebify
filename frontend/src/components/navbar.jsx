import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FaUsers, FaHome, FaUser, FaPlus } from "react-icons/fa";
import logoTexto from "../../assets/logoTexto.png";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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
    const t = setInterval(buscarPedidos, 10000);
    return () => clearInterval(t);
  }, [user, buscarPedidos]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Item = ({ Icon, to, badge, title }) => {
    const isActive = location.pathname === to;
    return (
      <div
        onClick={() => navigate(to)}
        className="relative cursor-pointer mx-2"
        title={title}
      >
        <Icon
          size={22}
          className={isActive ? "text-emerald-600" : "text-gray-700"}
        />
        {badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    );
  };

  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-4 py-3 flex justify-between items-center">
      <img
        src={logoTexto}
        alt="Zebify"
        onClick={() => navigate("/")}
        className="h-10 cursor-pointer"
      />

      {!isAuthPage && (
        <div className="flex items-center gap-4">
          {user ? (
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
              <span className="text-sm text-gray-700 whitespace-nowrap">
                Olá, {user.firstName} {user.lastName}
              </span>

              <button
                onClick={handleLogout}
                className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm transition"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-emerald-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-gray-700 hover:text-emerald-600 font-medium"
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
