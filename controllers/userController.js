const { order } = require("../models/orderModel");
const productModel = require("../models/productModel");

const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const products = await productModel.paginate({}, { page, limit });
    res.status(200).send({ products });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const getSingleProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    console.log(productId);
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        message: "Product not found",
      });
    }
    res.status(200).send({ product });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { orderItems } = req.body;
    const customerId = req.user.userId;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).send({ message: "Invalid order data" });
    }

    try {
      let totalOrderCost = 0;
      const items = [];

      for (const item of orderItems) {
        const product = await productModel.findById(item.productId);
        if (!product) {
          res
            .status(404)
            .send({ message: `Product not found: ${item.productId}` });
        }

        //checks if the stock is enough for the order
        if (product.stock < item.quantity) {
          res.status(400).send({
            message: `Insufficient stock for product: ${product.productName}`,
          });
          return;
        }

        //calculate the total cost for this product
        const totalCost = product.price * item.quantity;

        totalOrderCost += totalCost;

        items.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
          totalCost,
        });
      }

      for (const item of items) {
        const product = await productModel.findById(item.productId);
        product.stock -= item.quantity;
        await product.save();
      }

      //create the order
      const newOrder = await order.create({
        customerId,
        orderItems: items,
        totalCost: totalOrderCost,
      });

      res.status(201).send({
        message: "Order created successfully",
        order: newOrder,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { page, limit } = req.query;

    if (!customerId) {
      res.status(400).send({
        message: "Customer ID is required",
      });
      return;
    }

    const options = {
      page,
      limit,
      populate: {
        path: "orderItems.productId",
        select: "-stock -createdAt -updatedAt  -__v",
      },
      sort: { createdAt: -1 },
    };

    const orders = await order.paginate({ customerId }, options);

    if (!orders || orders.docs.length === 0) {
      res.status(400).send({
        message: "No orders found for this customer",
      });
      return;
    }
    res.status(200).send({
      message: "Customer orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createOrder,
  getCustomerOrders,
};
