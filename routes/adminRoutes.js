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
  getAllPaymentsDetails,
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

//get all products

/**
 * @swagger
 * /api/v1/admin/products:
 *   get:
 *     summary: Get Products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Product category
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

adminRoutes.get("/products", getAllProducts);

/**
 * @swagger
 * /api/v1/admin/payments:
 *   get:
 *     summary: Get Payments
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Payments fetched successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

adminRoutes.get("/payments", getAllPaymentsDetails);

//get single product

/**
 * @swagger
 * /api/v1/admin/product/{productId}:
 *   get:
 *     summary: Get a Product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to fetch
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

adminRoutes.get("/product/:productId", getSingleProduct);

//add product

/**
 * @swagger
 * /api/v1/admin/product:
 *   post:
 *     summary: Add a new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of product images
 *               productName:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Description of the product
 *               price:
 *                 type: string
 *                 description: Price of the product
 *               stock:
 *                 type: number
 *                 description: Stock of the product
 *               category:
 *                 type: string
 *                 description: Category of the product
 *             required:
 *               - productImages
 *               - productName
 *               - description
 *               - price
 *               - stock
 *               - category
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
adminRoutes.post("/product", upload.array("productImages", 10), addProduct);

//update product

/**
 * @swagger
 * /api/v1/admin/product/{productId}:
 *   put:
 *     summary: Edit a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of product images
 *               productName:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Description of the product
 *               price:
 *                 type: string
 *                 description: Price of the product
 *               stock:
 *                 type: number
 *                 description: Stock of the product
 *               category:
 *                 type: string
 *                 description: Category of the product
 *             required:
 *               - productName
 *               - description
 *               - price
 *               - stock
 *               - category
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

adminRoutes.put(
  "/product/:productId",
  upload.array("productImages", 10),
  updateProduct
);

//delete product
/**
 * @swagger
 * /api/v1/admin/product/{productId}:
 *   delete:
 *     summary: Delete Product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

adminRoutes.delete("/product/:productId", deleteProduct);

//get all orders
/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */

adminRoutes.get("/orders", getAllCustomerOrders);

//approve or reject order
/**
 * @swagger
 * /api/v1/admin/order/{orderId}/status:
 *   patch:
 *     summary: Approve or Reject Orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: The new status of the order
 *     responses:
 *       200:
 *         description: Successfully updated order status
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
adminRoutes.patch("/order/:orderId/status", approveOrRejectOrder);

module.exports = adminRoutes;
