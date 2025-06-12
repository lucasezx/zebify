import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Profile from "./pages/profile";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Welcome from "./pages/welcome";
import PrivateRoute from "./components/privateRoute";
import UsersPage from "./pages/usersPage";
import NewPostPage from "./pages/newPostPage";
import Verificar from "./pages/verificar";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/new-post"
          element={
            <PrivateRoute>
              <NewPostPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />

        <Route path="/verify" element={<Verificar />} />
      </Routes>
    </div>
  );
}

export default App;
