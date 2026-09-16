import { google } from "googleapis";
import crypto from "crypto";
import User from "../models/User.js";
import { generateToken } from "./authController.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// --------------------------------------------------
// Start Google OAuth Login
// GET /api/auth/google
// --------------------------------------------------

export const googleLogin = async (req, res) => {
  try {
    // Generate secure random state
    const state = crypto.randomBytes(32).toString("hex");

    // Store state securely in an HTTP-only signed cookie
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: false, // true when using HTTPS in production
      sameSite: "lax",
      signed: true,
      maxAge: 10 * 60 * 1000,
    });

    // Generate Google authorization URL
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "online",

      scope: [
        "openid",
        "email",
        "profile",
      ],

      state,

      prompt: "select_account",
    });

    res.redirect(authorizationUrl);

  } catch (error) {
    console.error("Google login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to start Google login",
    });
  }
};


// --------------------------------------------------
// Google OAuth Callback
// GET /api/auth/google/callback
// --------------------------------------------------

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Check authorization code
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is missing",
      });
    }

    // Check state
    if (!state) {
      return res.status(400).json({
        success: false,
        message: "OAuth state is missing",
      });
    }

    // Retrieve signed state cookie
    const storedState = req.signedCookies.oauth_state;

    // Validate OAuth state
    if (!storedState || state !== storedState) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth state",
      });
    }

    // Remove OAuth state cookie after successful validation
    res.clearCookie("oauth_state");

    // Exchange authorization code for Google tokens
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    // Get Google user information
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    // Validate Google identity information
    if (!data.id || !data.email) {
      return res.status(400).json({
        success: false,
        message: "Unable to retrieve Google account information",
      });
    }

    // Require Google's email to be verified
    if (data.verified_email !== true) {
      return res.status(400).json({
        success: false,
        message: "Google email address is not verified",
      });
    }

    // --------------------------------------------------
    // Find existing Google user
    // --------------------------------------------------

    let user = await User.findOne({
      googleId: data.id,
    });

    // --------------------------------------------------
    // If Google account doesn't exist,
    // check whether an existing local account
    // uses the same verified email.
    // --------------------------------------------------

    if (!user) {
      user = await User.findOne({
        username: data.email,
      });

      if (user) {
        // Link verified Google account to existing user
        user.googleId = data.id;

        await user.save();

      } else {
        // Create new Google user
        user = await User.create({
          username: data.email,
          googleId: data.id,
          role: "customer",
        });
      }
    }

    // Generate YOUR application's JWT
    const token = generateToken(user._id);

    // User information passed to frontend
    const userData = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        username: user.username,
        role: user.role,
      })
    );

    // Redirect to React application
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    res.redirect(
      `${frontendUrl}/google-callback#token=${encodeURIComponent(
        token
      )}&user=${userData}`
    );

  } catch (error) {
    console.error("Google callback error:", error);

    // Handle duplicate Google account
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Google account is already linked to another user",
      });
    }

    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};