const express = require("express");
const {
  initializePayment,
  verifyPayment,
  getTransactionsByUser,
} = require("../controllers/paymentController");
const authenticatedUser = require("../middleware/authenticatedUser");

const paymentRoutes = express.Router();

paymentRoutes.use(authenticatedUser);

/**
 * @swagger
 * tags:
 *  name: Payment
 * description: Payment
 */

/**
 * @swagger
 * /v1/payment/paystack/pay:
 *   post:
 *     summary: Payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               amount:
 *                 type: number
 *                 description: The amount *
 *             required:
 *               - email
 *               - amount
 *     responses:
 *       200:
 *        description: Success
 *       302:
 *         description: Redirect to Paystack payment page
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
paymentRoutes.post("/paystack/pay", initializePayment);
/**
 * @swagger
 * /v1/payment/paystack/callback:
 *   post:
 *     summary: Verify Payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         required: true
 *         description: The reference of the payment to verify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user making the payment
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
paymentRoutes.post("/paystack/callback", verifyPayment);

/**
 * @swagger
 * /v1/payment/transactions/{userId}:
 *   get:
 *     summary: Get Transactions by User
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose transactions are to be retrieved
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   transactionId:
 *                     type: string
 *                     description: The ID of the transaction
 *                   amount:
 *                     type: number
 *                     description: The amount of the transaction
 *                   status:
 *                     type: string
 *                     description: The status of the transaction
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time of the transaction
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
paymentRoutes.get("/transactions/:userId", getTransactionsByUser);

module.exports = paymentRoutes;
