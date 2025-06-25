import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* 👉 utilitário de normalização */
const normalizeUser = (u = {}) => ({
  ...u,
  firstName:  u.firstName  ?? u.first_name  ?? "",
  lastName:   u.lastName   ?? u.last_name   ?? "",
  birth_date: u.birth_date ?? u.birthDate   ?? null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* carrega do localStorage já normalizado */
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(normalizeUser(JSON.parse(saved)));
    setLoading(false);
  }, []);

  /* login sempre normaliza e persiste */
  const login = (rawUser) => {
    const userData = normalizeUser(rawUser);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
