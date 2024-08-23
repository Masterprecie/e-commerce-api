const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const { sendEmail } = require("../utils/emailUtils");
const jwt = require("jsonwebtoken");
const userTokenModel = require("../models/userToken");
const { validateAuth } = require("../utils/validation");

const googleAuthCallback = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user object exists
    if (!user) {
      return res.status(401).json({ message: "Authentication failed!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.AUTH_KEY,
      { expiresIn: "30m" }
    );

    // Generate Refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_KEY,
      { expiresIn: "7d" }
    );

    // Send the tokens and user info as response
    return res.status(200).json({
      message: "Login successful",
      access_token: token,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("Error in Google Auth Callback:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

const registerUser = async (req, res, next) => {
  try {
    const error = validateAuth(req.body);
    if (error) {
      return res.status(400).send({
        message: error.details[0].message,
      });
    }
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
    console.log(error);
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
    const error = validateAuth(req.body);
    if (error) {
      return res.status(400).send({
        message: error.details[0].message,
      });
    }
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
      process.env.AUTH_KEY,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.REFRESH_KEY,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).send({
      message: "Login successful",
      access_token: token,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
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

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).send({
        message: "Refresh token is required",
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);
    const user = await usersModel.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).send({
        message: "Invalid refresh token",
      });
      return;
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.AUTH_KEY,
      { expiresIn: "30m" }
    );
    res.status(200).send({
      message: "Token refreshed successfully",
      access_token: newAccessToken,
    });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "An error occurred while refreshing the token",
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  refreshToken,
  googleAuthCallback,
};
