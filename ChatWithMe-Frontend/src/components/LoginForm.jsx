import React, { useState } from "react";
import baseURL from "../constants";
import axios from "axios"
import { generateKeyPair, storeKeys } from "../utils/enc_dec";

const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${baseURL}/login`, form);
      const { access_token } = res.data;
      localStorage.setItem("token", access_token);
      onLogin(access_token);

      // E2EE
      const { publicKey, privateKey } = generateKeyPair();
      storeKeys(publicKey, privateKey)

      await fetch(`${baseURL}/update-public-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ public_key: publicKey }),
      });

    } catch (err) {
      setError("Login failed.");
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/20 p-8 rounded-2xl shadow-xl border border-white/30 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">🔐 Login</h2>
      <form onSubmit={handleLogin} className="space-y-5">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 transition text-white font-semibold"
        >
          Login
        </button>
        {error && (
          <p className="text-sm mt-2 text-red-300 text-center">{error}</p>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
