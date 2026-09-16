import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Normal Signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await signup(formData);

      alert(res?.message || "Signup successful");

      navigate("/login");

    } catch (err) {
      console.error("Signup Error:", err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Signup failed ❌"
      );

    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Signup
  const handleGoogleSignup = () => {
    setGoogleLoading(true);

    /*
      The same Google OAuth endpoint is used for
      both Login and Signup.

      Backend decides:

      Existing Google account
            ↓
          Login

      New Google account
            ↓
      Create communityUser
            ↓
          Login
    */

    window.location.href =
      "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 px-4 py-8">

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="text-center mb-7">

          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            Create Account
          </h2>

          <p className="text-gray-500 mt-2">
            Create your Water Well account
          </p>

        </div>

        {/* Normal Signup Form */}
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
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
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
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading || googleLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            />

          </div>

          {/* Role */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading || googleLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100"
            >

              <option value="customer">
                Customer
              </option>

              <option value="field_officer">
                Field Officer
              </option>

              <option value="lab_tester">
                Lab Tester
              </option>

            </select>

          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

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

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
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
              : "Sign up with Google"}
          </span>

        </button>

        {/* Login Link */}
        <p className="text-sm text-center text-gray-600 mt-7">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Signup;