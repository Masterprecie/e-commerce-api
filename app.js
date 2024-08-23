const connectDB = require("./config/db");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const cors = require("cors");
const setupSwaggerDocs = require("./swagger");
const passport = require("passport");
const session = require("express-session");

require("./utils/passport");
//routes-imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const sharedRoutes = require("./routes/sharedRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Initialize session for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
// app.use(
//   cors({
//     origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
//     methods: "GET, POST, PATCH, DELETE, PUT",
//     credentials: true,
//   })
// )
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//cloudinary setup
cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

setupSwaggerDocs(app);

//Connect to MongoDB
connectDB();
//routes
app.use("/v1/auth", authRoutes);
app.use("/v1/profile", sharedRoutes);
app.use("/v1/admin", adminRoutes);
app.use("/v1/user", userRoutes);
app.use("/v1/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Precious E-commerce store!");
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).send({
    message: res.locals.error,
  });
});

module.exports = app;
