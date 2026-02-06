import { useState } from "react";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });

      // store token & role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userEmail", res.data.user.email || email);

      // connect socket after login (if needed)
      try {
        const { connectSocket } = await import("../services/socket");
        connectSocket();
      } catch (e) {}
      localStorage.setItem("userId", res.data.user.id);

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid credentials or email not verified");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Hospital Login
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Access your supply dashboard
        </p>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
            {error}
          </p>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="hospital@email.com"
            className="w-full border p-3 rounded mt-1 mb-4 focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border p-3 rounded mt-1 mb-6 focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        {/* Back to Home */}
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          ← Back to Home
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          New hospital?{" "}
          <a href="/register" className="text-blue-600 font-medium">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
