const axios = require("axios");
const transactionsModel = require("../models/transactionsModel");

const initializePayment = async (req, res, next) => {
  try {
    const paymentData = {
      email: req.body.email,
      amount: req.body.amount * 100,
      callback_url: `${req.protocol}://${req.get(
        "host"
      )}/api/v1/payment/paystack/callback`,
    };
    console.log(paymentData);
    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      paymentData,
      { headers }
    );

    const { authorization_url } = response.data.data;

    // send the url to the frontend
    res.status(200).send({ authorization_url });
  } catch (error) {
    next(error);
    res.status(500).send("Error initializing payment");
  }
};

const verifyPayment = async (req, res) => {
  const { reference } = req.query;
  const { userId } = req.body;

  if (!reference || !userId) {
    return res
      .status(400)
      .send({ message: "Transaction reference and userId are required" });
  }

  try {
    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    };

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers }
    );

    const { status, data } = response.data;

    if (status) {
      const newTransaction = new transactionsModel({
        userId: userId,
        reference: data.reference,
        amount: data.amount / 100,
        status: data.status,
      });

      await newTransaction.save();
      res.status(200).send({ message: "Payment successful" });
    } else {
      res.status(400).send({ message: "Payment failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error verifying payment");
  }
};

const getTransactionsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all transactions for the user with the specified userId
    const transactions = await transactionsModel.find({ userId: userId });

    if (transactions.length === 0) {
      return res
        .status(404)
        .send({ message: "No transactions found for this user" });
    }

    // Return the transactions to the client
    res.status(200).send({ transactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

module.exports = { initializePayment, verifyPayment, getTransactionsByUser };
