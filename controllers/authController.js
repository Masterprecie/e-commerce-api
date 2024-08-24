const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const { sendEmail } = require("../utils/emailUtils");
const jwt = require("jsonwebtoken");
const userTokenModel = require("../models/userToken");
const { validateAuth } = require("../utils/validation");
const axios = require("axios");

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
    // return res.status(200).json({
    //   message: "Login successful",
    //   access_token: token,
    //   refresh_token: refreshToken,
    //   user: {
    //     id: user._id,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     email: user.email,
    //     role: user.role,
    //     isEmailVerified: user.isEmailVerified,
    //   },
    // });
    return res.redirect(`http://localhost:5173/`);
  } catch (err) {
    console.error("Error in Google Auth Callback:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

const googleAuth = async (req, res) => {
  const { googleId, email, name, picture } = req.body;

  try {
    // Check if the user exists by email
    let user = await usersModel.findOne({ email });

    if (user) {
      // If the user exists and Google ID is present, log them in
      if (user.googleId === googleId) {
        console.log("User already exists and logged in:", user);
      }
      // If email exists but Google ID is missing, update the user with Google ID
      else if (!user.googleId) {
        console.log("User exists but missing Google ID. Updating...");
        user.googleId = googleId;
        user.profilePictureURL = picture; // Update profile picture if necessary
        user.firstName = name.split(" ")[0]; // Update first name if necessary
        user.lastName = name.split(" ")[1] || ""; // Update last name if necessary
        await user.save();
        console.log("User updated with Google ID:", user);
      }
      // If email exists and Google ID is different, handle the user conflict
      else {
        console.error("Google ID mismatch for existing email.");
        return res
          .status(400)
          .send({ error: "Google ID mismatch for this email." });
      }
    } else {
      // Create a new user if the email doesn't exist
      console.log("Creating a new user...");
      user = new usersModel({
        googleId,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
        email,
        profilePictureURL: picture,
        isEmailVerified: true,
      });
      await user.save(); // Save the new user
      console.log("New user saved:", user);
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

    // Send the tokens and user information back to the frontend
    res.status(200).json({
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
    console.error("Error during Google authentication:", error);

    // Handle specific duplicate key error (if using unique constraints)
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Duplicate email, user already exists" });
    }

    res.status(400).json({ error: "Authentication or user saving failed" });
  }
};

const googleAuthIdToken = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the Google ID token
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    );
    const { sub: googleId, name, picture, email } = response.data;

    // Check if the user exists by email
    let user = await usersModel.findOne({ email });

    if (user) {
      // If the user exists and Google ID matches, log them in
      if (user.googleId === googleId) {
        console.log("User already exists and logged in:", user);
      }
      // If email exists but Google ID is missing, update the user with Google ID
      else if (!user.googleId) {
        console.log("User exists but missing Google ID. Updating...");
        user.googleId = googleId;
        user.profilePictureURL = picture; // Update profile picture
        user.firstName = name.split(" ")[0]; // Update first name
        user.lastName = name.split(" ")[1] || ""; // Update last name
        await user.save();
        console.log("User updated with Google ID:", user);
      }
      // Handle potential Google ID mismatch case
      else {
        console.error("Google ID mismatch for existing email.");
        return res
          .status(400)
          .send({ error: "Google ID mismatch for this email." });
      }
    } else {
      // Create a new user if the email doesn't exist
      console.log("Creating a new user...");
      user = new usersModel({
        googleId,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
        email,
        profilePictureURL: picture,
        isEmailVerified: true, // verify email since Google OAuth is used
      });

      await user.save();
      console.log("New user saved:", user);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.AUTH_KEY,
      { expiresIn: "3m" } // You might want a longer expiry for practical use
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

    // Save refresh token to the user's document
    user.refreshToken = refreshToken;
    await user.save();

    // Send the user information, JWT, and refresh token back to the frontend
    res.status(200).send({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
        picture: user.profilePictureURL,
      },
      access_token: token,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error("Error during Google authentication:", error);

    // Handle specific duplicate key error (e.g., if using unique constraints)
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Duplicate email, user already exists" });
    }

    // Handle token verification or saving errors
    res.status(400).json({ error: "Token verification or user saving failed" });
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
      { expiresIn: "3m" }
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

    res.status(200).json({
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
      { expiresIn: "3m" }
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
  googleAuth,
  googleAuthIdToken,
};
