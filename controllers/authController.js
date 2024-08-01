const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const { sendEmail } = require("../utils/emailUtils");
const jwt = require("jsonwebtoken");
const userTokenModel = require("../models/userToken");

const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await usersModel.findOne({ email: email });

    if (existingUser) {
      res.status(400).send({
        message: "User with this email already exists",
      });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const token = v4();

    await usersModel.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      authToken: token,
      authPurpose: "verify-email",
    });

    await sendEmail(
      email,
      "Email Verification",
      `${firstName} Please Click on this link to verify your email: http://localhost:3000/v1/auth/verify-email/${token}`
    );

    res.status(201).send({
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "An error occurred while creating the user",
    });
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const doesUserExist = await usersModel.exists({
      authToken: token,
      authPurpose: "verify-email",
    });

    if (!doesUserExist) {
      res.status(400).send({
        isSuccessful: false,
        message: "Invalid token",
      });
      return;
    }

    const updateUser = await usersModel.findOneAndUpdate(
      {
        authToken: token,
        authPurpose: "verify-email",
      },
      {
        isEmailVerified: true,
        authToken: "",
        authPurpose: "",
      },
      {
        new: true,
      }
    );

    if (!updateUser) {
      res.status(400).send({
        isSuccessful: false,
        message: "An error occurred during email verification",
      });
      return;
    }
    res.send({
      isSuccessful: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
    res.status(500).send({
      message: "An error occurred while verifying the email",
    });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await usersModel.findOne({
      email: email,
    });

    if (!user) {
      res.status(404).send({
        message: "User not found",
      });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      res.status(401).send({
        message: "Invalid Credentials",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.AUTH_KEY
    );

    res.status(200).send({
      message: "Login successful",
      access_token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "An error occurred while logging in",
    });
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await usersModel.findOne({ email });

    if (!user) {
      res.status(404).send({
        isSuccessful: false,
        message: "User not found",
      });
      return;
    }

    const token = v4();

    await userTokenModel({
      userId: user._id,
      token,
    }).save();

    const resetPasswordLink = `http://localhost:3000/v1/auth/reset-password/${token}`;

    await sendEmail(
      email,
      "Password Reset",
      `Click on this link to reset your password: ${resetPasswordLink}`
    );

    res.status(200).send({
      isSuccessful: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "An error occurred while sending password reset email",
    });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const userToken = await userTokenModel.findOne({ token });

    if (!userToken) {
      res.status(400).send({
        message: "Invalid token",
      });
      return;
    }

    const user = await usersModel.findById(userToken.userId);

    if (!user) {
      res.status(404).send({
        message: "User not found",
      });
      return;
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    await userToken.deleteOne({
      _id: userToken._id,
    });

    res.status(200).send({
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "An error occurred while resetting the password",
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
};
