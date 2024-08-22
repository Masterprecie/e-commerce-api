const express = require("express");
const rolesAllowed = require("../middleware/roleBasedAuth");

const authenticatedUser = require("../middleware/authenticatedUser");
const {
  getSingleProduct,
  getAllProducts,
  createOrder,
  getCustomerOrders,
  getProductsByCategory,
} = require("../controllers/userController");

const userRoutes = express.Router();

//middlewares
userRoutes.use(authenticatedUser);
userRoutes.use(rolesAllowed(["user"]));

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

userRoutes.get("/products", getAllProducts);

userRoutes.get("/product/:productId", getSingleProduct);

userRoutes.get("/products/category", getProductsByCategory);

userRoutes.post("/product/order", createOrder);

userRoutes.get("/orders/:customerId/:page/:limit", getCustomerOrders);

module.exports = userRoutes;
