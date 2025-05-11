import React, { useState } from "react";
import axios from "axios";
import baseURL from "../constants";

const RegisterForm = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseURL}/register`, form);
      setMessage("🎉 Registered successfully! You can now login.");
    } catch (err) {
      setMessage("❌ Registration failed.");
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/20 p-8 rounded-2xl shadow-xl border border-white/30 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">🚀 Register</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold"
        >
          Register
        </button>
        {message && <p className="text-sm mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default RegisterForm;
