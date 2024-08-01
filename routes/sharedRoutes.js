const express = require("express");
const { profile, profilePicture } = require("../controllers/profileController");
const authenticatedUser = require("../middleware/authenticatedUser");
const multer = require("multer");
const sharedRoutes = express.Router();
const { v4 } = require("uuid");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    const newFilename = v4() + "." + file.mimetype.split("/")[1];
    cb(null, newFilename);
  },
});

const upload = multer({ storage });
sharedRoutes.use(authenticatedUser);

sharedRoutes.get("/", profile);

sharedRoutes.put(
  "/upload-profile-picture",
  upload.single("picture"),
  profilePicture
);

// sharedRoutes.put(
//   "/upload-profile-picture",
//   upload.("picture"),
//   profilePicture
// );

module.exports = { storage, sharedRoutes };
