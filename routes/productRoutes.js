const express = require("express");
const rolesAllowed = require("../middleware/roleBasedAuth");

const authenticatedUser = require("../middleware/authenticatedUser");
const {
  getSingleProduct,
  getAllProducts,
  createOrder,
  getCustomerOrders,
} = require("../controllers/productController");

const productRoutes = express.Router();

//middlewares
// userRoutes.use(authenticatedUser);
// productRoutes.use(rolesAllowed(["user"]));

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

//get all products

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get Products
 *     tags: [Products]
 *     security: []
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
 *         description: Category to filter products by
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
productRoutes.get("/", getAllProducts);

//get a single product

/**
 * @swagger
 * /api/v1/products/{productId}:
 *   get:
 *     summary: Get a Product
 *     tags: [Products]
 *     security: []
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
productRoutes.get("/:productId", getSingleProduct);

//create an order
/**
 * @swagger
 * /api/v1/products/order:
 *   post:
 *     summary: Create a new order
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItems
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ID of the product
 *                     quantity:
 *                       type: number
 *                       description: Quantity of the product
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

productRoutes.post(
  "/order",
  authenticatedUser,
  rolesAllowed(["user"]),
  createOrder
);

//get customer orders

/**
 * @swagger
 * /api/v1/products/orders/{customerId}:
 *   get:
 *     summary: Get orders for a customer
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: Customer orders fetched successfully
 *       400:
 *         description: Bad request
 *       401:
 *        description: Invalid or expired
 *       404:
 *         description: No orders found for this customer
 *       500:
 *         description: Internal server error
 */

productRoutes.get(
  "/orders/:customerId",
  authenticatedUser,
  rolesAllowed(["user"]),
  getCustomerOrders
);

module.exports = productRoutes;
