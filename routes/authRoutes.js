const express = require("express");
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");
const authRoutes = express.Router();

authRoutes.post("/register", registerUser);
authRoutes.get("/verify-email/:token", verifyEmail);
authRoutes.post("/login", loginUser);
authRoutes.post("/forget-password", forgetPassword);
authRoutes.post("/reset-password/:token", resetPassword);

module.exports = authRoutes;
