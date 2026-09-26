import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

// SIGNUP
export const signup = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const exists = await User.findOne({ username });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      username,
      password,
      role: role || "communityUser",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error("Signup error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "Invalid User Name",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = role ? { role } : {};

    const users = await User.find(filter).select("-password");

    res.json(users);

  } catch (err) {
    console.error("Get users error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};