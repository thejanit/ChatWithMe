import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import LogoutButton from "./components/Logout";
import Chat from "./components/ChatWebSocket";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiry = decoded.expired;
        const now = Math.floor(Date.now() / 1000);
        console.log("Token exp:", expiry, "Now:", now);

        if (expiry && expiry < now) {
          // Token expired
          handleLogout();
        } else if (expiry) {
          const timeout = (expiry - now) * 1000;
          const logoutTimer = setTimeout(() => {
            handleLogout();
          }, timeout);

          return () => clearTimeout(logoutTimer); // cleanup
        }
      } catch (e) {
        console.error("Failed to decode token:", e);
        handleLogout();
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  if (!token) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-600 via-black-600 to-blue-500 px-4">
        <div className="w-full max-w-md space-y-10">
          <RegisterForm />
          <LoginForm
            onLogin={(tk) => {
              setToken(tk); // token is already being stored in localStorage inside LoginForm
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-red-300 p-4">
      <div className="w-full max-w-4xl h-full md:h-[90vh] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
          <h2 className="text-3xl font-bold mb-1">🎉 Welcome to ChatWithMe</h2>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 bg-blue flex justify-end">
          <LogoutButton />
        </div>

        <div className="flex-1 overflow-hidden bg-white p-4">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default App;
