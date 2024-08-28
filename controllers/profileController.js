const usersModel = require("../models/usersModel");
const { uploadSingleImageToCloudinary } = require("../utils/helpers");

const profile = async (req, res, next) => {
  try {
    const user = await usersModel.findById(req.user.userId, {
      password: 0,
      authToken: 0,
      authPurpose: 0,
      refreshToken: 0,
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

// const profilePicture = async (req, res, next) => {
//   try {
//     const file = req.file?.path;
//     console.log(file);

//     const newProfilePictureURL = await uploadSingleImageToCloudinary(file);

//     await usersModel.findByIdAndUpdate(req.user.userId, {
//       profilePictureURL: newProfilePictureURL,
//     });
//     res.status(200).send({
//       message: "Profile picture uploaded successfully",
//       newProfilePictureURL,
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//     res.status(500).send({
//       message: "Internal server error",
//     });
//   }
// };

const profilePicture = async (req, res, next) => {
  try {
    const file = req.file?.path;

    // Check if a file was uploaded
    if (!file) {
      return res.status(400).send({
        message: "No file uploaded",
      });
    }

    let newProfilePictureURL;
    try {
      newProfilePictureURL = await uploadSingleImageToCloudinary(file);
    } catch (uploadError) {
      console.error("Error uploading image to Cloudinary:", uploadError);
      return res.status(500).send({
        message: "Error uploading image to Cloudinary",
      });
    }

    await usersModel.findByIdAndUpdate(req.user.userId, {
      profilePictureURL: newProfilePictureURL,
    });

    res.status(200).send({
      message: "Profile picture uploaded successfully",
      newProfilePictureURL,
    });
  } catch (error) {
    console.error("Unexpected error in profilePicture:", error);
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
