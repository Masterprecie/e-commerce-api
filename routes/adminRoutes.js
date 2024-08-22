const express = require("express");
const rolesAllowed = require("../middleware/roleBasedAuth");
const {
  addProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAllCustomerOrders,
  approveOrRejectOrder,
} = require("../controllers/adminController");
const authenticatedUser = require("../middleware/authenticatedUser");
const { upload } = require("../utils/multerConfig");

const adminRoutes = express.Router();

//middlewares
adminRoutes.use(authenticatedUser);
adminRoutes.use(rolesAllowed(["admin"]));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

adminRoutes.get("/products/:page/:limit", getAllProducts);

adminRoutes.get("/product/:productId", getSingleProduct);

adminRoutes.post("/product", upload.array("productImages", 10), addProduct);

adminRoutes.put(
  "/product/:productId",
  upload.array("productImages", 10),
  updateProduct
);

adminRoutes.delete("/product/:productId", deleteProduct);

adminRoutes.get("/orders/:page/:limit", getAllCustomerOrders);

adminRoutes.patch("/order/:orderId/status", approveOrRejectOrder);

module.exports = adminRoutes;
