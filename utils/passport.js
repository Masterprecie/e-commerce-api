const passport = require("passport");
const usersModel = require("../models/usersModel");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersModel.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(new Error("User not found"), null);
    }
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with the same Google ID exists
        let user = await usersModel.findOne({ googleId: profile.id });

        if (user) {
          // If user exists with Google ID, continue with authentication
          return done(null, user);
        }

        // If no user exists with this Google ID, check if a user exists with the same email
        user = await usersModel.findOne({ email: profile.emails[0].value });

        if (user) {
          // If a user with the same email exists, update their account to link Google ID
          user.googleId = profile.id;
          user.profilePictureURL = profile.photos[0].value; // Optionally update their profile picture
          await user.save();

          return done(null, user); // Continue with linked account
        }

        // If user doesn't exist, create a new user
        console.log("Creating new user...");
        const newUser = new usersModel({
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          profilePictureURL: profile.photos[0].value,
          isEmailVerified: true,
        });

        // Save the new user to the database
        user = await newUser.save();
        console.log("New user saved:", user);
        done(null, user);
      } catch (err) {
        console.error("Error during Google Auth:", err);
        done(err, null);
      }
    }
  )
);
