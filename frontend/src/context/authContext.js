// src/context/authContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

// Criação do contexto
const AuthContext = createContext();

// Hook para usar o contexto mais facilmente
export const useAuth = () => useContext(AuthContext);

// Provedor de autenticação (envolve a aplicação)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Ao carregar, tenta restaurar o usuário do localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Função de login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
