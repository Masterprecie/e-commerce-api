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
const productRoutes = require("./routes/productRoutes");
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

// Configure CORS to allow requests from your frontend origin
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://presh-auth.netlify.app/"], // Replace with your frontend origin
//     methods: "GET, POST, PATCH, DELETE, PUT",
//     credentials: true,
//   })
// );

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
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", sharedRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/payment", paymentRoutes);

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
