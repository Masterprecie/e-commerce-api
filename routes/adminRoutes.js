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
const multer = require("multer");

const { v4 } = require("uuid");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    const newFilename = v4() + "." + file.mimetype.split("/")[1];
    cb(null, newFilename);
  },
});

const upload = multer({ storage });

const adminRoutes = express.Router();
adminRoutes.use(authenticatedUser);
adminRoutes.use(rolesAllowed(["admin"]));

adminRoutes.get("/products/:page/:limit", getAllProducts);
adminRoutes.get("/product/:productId", getSingleProduct);

adminRoutes.post("/product", upload.array("productImages", 10), addProduct);

adminRoutes.put("/product/:productId", updateProduct);
adminRoutes.delete("/product/:productId", deleteProduct);
adminRoutes.get("/orders/:page/:limit", getAllCustomerOrders);
adminRoutes.patch("/order/:orderId/status", approveOrRejectOrder);

module.exports = adminRoutes;
