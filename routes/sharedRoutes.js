const express = require("express");
const { profile, profilePicture } = require("../controllers/profileController");
const authenticatedUser = require("../middleware/authenticatedUser");
const { upload } = require("../utils/multerConfig");

const sharedRoutes = express.Router();

sharedRoutes.use(authenticatedUser);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile management
 */

/**
 * @swagger
 * /v1/profile:
 *   get:
 *     summary: Get Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */

sharedRoutes.get("/", profile);

/**
 * @swagger
 * /v1/profile/upload-profile-picture:
 *   put:
 *     summary: Upload Profile Picture
 *     tags: [Profile]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

sharedRoutes.put(
  "/upload-profile-picture",
  upload.single("picture"),
  profilePicture
);

module.exports = sharedRoutes;
