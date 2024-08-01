// const multer = require("multer");
const usersModel = require("../models/usersModel");
const cloudinary = require("cloudinary");
// const { v4 } = require("uuid");

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
    const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
      resource_type: "image",
      uploade_preset: "kodecamp4",
    });
    // console.log(uploadResult);

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
