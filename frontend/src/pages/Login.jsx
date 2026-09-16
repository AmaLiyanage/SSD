import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Normal Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );

      // Save authentication data
      login(res.data);
      localStorage.setItem("token", res.data.token);

      // Navigate based on role
      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "field_officer") {
        navigate("/field-dashboard");
      } else if (res.data.role === "lab_tester") {
        navigate("/lab-dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = () => {
    setGoogleLoading(true);

    window.location.href =
      "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 px-4 py-8">

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="text-center mb-7">

          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2">
            Login to your Water Well account
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Normal Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading || googleLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading || googleLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center my-6">

          <div className="flex-1 border-t border-gray-300"></div>

          <span className="px-4 text-gray-400 text-sm font-medium">
            OR
          </span>

          <div className="flex-1 border-t border-gray-300"></div>

        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >

          {/* Google Logo */}
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"
            />

            <path
              fill="#34A853"
              d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.7z"
            />

            <path
              fill="#FBBC05"
              d="M6.54 13.78A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.22.31-1.78V7.7H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.3l3.24-2.52z"
            />

            <path
              fill="#EA4335"
              d="M12 6.19c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.22 14.62 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.4l3.24 2.52C7.31 7.91 9.46 6.19 12 6.19z"
            />
          </svg>

          <span>
            {googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"}
          </span>

        </button>

        {/* Signup Link */}
        <p className="text-sm text-center text-gray-600 mt-7">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline"
          >
            Sign Up
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Login;