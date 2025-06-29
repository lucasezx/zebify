import React, { createContext, useContext, useState, useEffect } from "react";
import socket from "../socket";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const normalizeUser = (u = {}) => ({
  ...u,
  firstName: u.firstName ?? u.first_name ?? "",
  lastName: u.lastName ?? u.last_name ?? "",
  birth_date: u.birth_date ?? u.birthDate ?? null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(normalizeUser(JSON.parse(savedUser)));
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  const login = (rawUser, receivedToken = token) => {
    if (!rawUser) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return;
    }

    const userData = normalizeUser(rawUser);
    setUser(userData);
    setToken(receivedToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", receivedToken);
    socket.emit("login", userData.id);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    socket.emit("login", null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
