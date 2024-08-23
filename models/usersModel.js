const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    googleId: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    profilePictureURL: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      // Custom validator to require password only if not a Google user
      required: function () {
        // Password is required only if googleId is not provided (i.e., for email/password users)
        return !this.googleId;
      },
    },
    authToken: {
      type: String,
    },
    authPurpose: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    refreshToken: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const usersModel = model("user", userSchema);
module.exports = usersModel;
