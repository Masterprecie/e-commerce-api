const express = require("express");
const passport = require("passport");

const {
  registerUser,
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  refreshToken,
  googleAuthCallback,
  googleAuth,
  googleAuthIdToken,
} = require("../controllers/authController");

const authRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /v1/auth/google:
 *   get:
 *     summary: Google Auth
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: successfully
 *       400:
 *         description: Error
 */

// Google login route
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback route
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthCallback
);

authRoutes.post("/google/", googleAuth);

authRoutes.post("/google/token", googleAuthIdToken);

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Internal server error
 */

authRoutes.post("/register", registerUser);

/**
 * @swagger
 * /v1/auth/verify-email/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */

authRoutes.get("/verify-email/:token", verifyEmail);

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       500:
 *         description: Internal server error
 */

authRoutes.post("/login", loginUser);

/**
 * @swagger
 * /v1/auth/refresh-token:
 *   post:
 *     summary: Refresh Token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successful
 *       500:
 *         description: Internal server error
 */

authRoutes.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /v1/auth/forget-password:
 *   post:
 *     summary: Forget password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent successful
 *       500:
 *         description: Internal server error
 */

authRoutes.post("/forget-password", forgetPassword);

/**
 * @swagger
 * /v1/auth/reset-password/{token}:
 *   post:
 *     summary: Reset Password
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */
authRoutes.post("/reset-password/:token", resetPassword);

module.exports = authRoutes;
