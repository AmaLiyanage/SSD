import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = () => {
      try {
        // Read URL fragment
        const hash = window.location.hash.substring(1);

        const params = new URLSearchParams(hash);

        const token = params.get("token");
        const userString = params.get("user");

        // Validate response
        if (!token || !userString) {
          console.error(
            "Google authentication data is missing"
          );

          navigate("/login");
          return;
        }

        const userData = JSON.parse(userString);

        // Create the same structure
        // used by normal login
        const authData = {
          _id: userData._id,
          username: userData.username,
          role: userData.role,
          token,
        };

        // Store authentication
        login(authData);

        localStorage.setItem(
          "token",
          token
        );

        // Remove token from URL fragment
        window.history.replaceState(
          {},
          document.title,
          "/google-callback"
        );

        // Redirect according to role
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (
          userData.role === "field_officer"
        ) {
          navigate("/field-dashboard");
        } else if (
          userData.role === "lab_tester"
        ) {
          navigate("/lab-dashboard");
        } else {
          navigate("/home");
        }

      } catch (error) {
        console.error(
          "Google callback error:",
          error
        );

        navigate("/login");
      }
    };

    handleGoogleCallback();

  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md">

        <p className="text-gray-700">
          Signing in with Google...
        </p>

      </div>

    </div>
  );
};

export default GoogleCallback;