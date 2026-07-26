"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {useDispatch} from "react-redux"
import { AdminLogin } from "../../services/operations/Admin";

export default function AdminLoginPage() {
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate()
  const dispatch=useDispatch()

  async function handleLogin(e) {

    e.preventDefault();
    setLoading(true);
    const data={
      email,
      password
    }
    dispatch(AdminLogin(data,navigate))
    setLoading(false);
  }

  if(loading){
    return <div className="spinner"></div>
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b]">
      <form onSubmit={handleLogin} className="bg-white/10 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white text-center">Admin Login</h1>
        <input
          type="text"
          placeholder="Enter you Email"
          value={email}
          onChange={e => setUsername(e.target.value)}
          className="p-3 rounded bg-white/20 text-white placeholder:text-slate-300 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="p-3 rounded bg-white/20 text-white placeholder:text-slate-300 focus:outline-none"
          required
        />
        {error && <div className="text-red-400 text-center">{error}</div>}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}