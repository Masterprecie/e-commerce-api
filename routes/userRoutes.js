const express = require("express");
const rolesAllowed = require("../middleware/roleBasedAuth");

const authenticatedUser = require("../middleware/authenticatedUser");
const {
  getSingleProduct,
  getAllProducts,
  createOrder,
  getCustomerOrders,
} = require("../controllers/userController");

const userRoutes = express.Router();

//middlewares
userRoutes.use(authenticatedUser);
userRoutes.use(rolesAllowed(["user"]));

userRoutes.get("/products/:page/:limit", getAllProducts);

userRoutes.get("/product/:productId", getSingleProduct);

userRoutes.post("/product/order", createOrder);

userRoutes.get("/orders/:customerId/:page/:limit", getCustomerOrders);

module.exports = userRoutes;
