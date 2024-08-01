const usersModel = require("../models/usersModel");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const profile = async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.user.userId, {
      password: 0,
      authToken: 0,
      authPurpose: 0,
      createdAt: 0,
      updatedAt: 0,
    });

    res.status(200).send(user);
  } catch (error) {
    next(error);
    console.log(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const profilePicture = async (req, res, next) => {
  try {
    const filePath = req.file.path;

    console.log(filePath);
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      upload_preset: "kodecamp4",
    });

    // Remove the local file after successful upload
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Failed to delete local file: ${filePath}`, err);
      }
    });
    console.log(uploadResult);

    await usersModel.findByIdAndUpdate(req.user.userId, {
      profilePictureURL: uploadResult.secure_url,
    });
    res.status(200).send({
      message: "Profile picture uploaded successfully",
      newProfilePictureURL: uploadResult.secure_url,
    });
  } catch (error) {
    console.log(error);
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

module.exports = {
  profile,
  profilePicture,
};
