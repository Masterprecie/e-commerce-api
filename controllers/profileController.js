const usersModel = require("../models/usersModel");
const { uploadSingleImageToCloudinary } = require("../utils/helpers");

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
    const file = req.file.path;

    const newProfilePictureURL = await uploadSingleImageToCloudinary(file);

    await usersModel.findByIdAndUpdate(req.user.userId, {
      profilePictureURL: newProfilePictureURL,
    });
    res.status(200).send({
      message: "Profile picture uploaded successfully",
      newProfilePictureURL,
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
