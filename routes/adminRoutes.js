const express = require("express");
const rolesAllowed = require("../middleware/roleBasedAuth");
const {
  addProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/adminController");
const authenticatedUser = require("../middleware/authenticatedUser");

const adminRoutes = express.Router();
adminRoutes.use(authenticatedUser);
adminRoutes.use(rolesAllowed(["admin"]));

adminRoutes.get("/products/:page/:limit", getAllProducts);
adminRoutes.get("/product/:productId", getSingleProduct);
adminRoutes.post("/product", addProduct);

module.exports = adminRoutes;
