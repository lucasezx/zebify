import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // ou um spinner

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
