const express = require("express");
const { profile, profilePicture } = require("../controllers/profileController");
const authenticatedUser = require("../middleware/authenticatedUser");
const { upload } = require("../utils/multerConfig");

const sharedRoutes = express.Router();

sharedRoutes.use(authenticatedUser);

sharedRoutes.get("/", profile);

sharedRoutes.put(
  "/upload-profile-picture",
  upload.single("picture"),
  profilePicture
);

module.exports = sharedRoutes;
