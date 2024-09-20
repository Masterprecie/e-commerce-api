const { order } = require("../models/orderModel");
const productModel = require("../models/productModel");
const transactionsModel = require("../models/transactionsModel");
const { uploadMultipleImagesToCloudinary } = require("../utils/helpers");

const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, category } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }

    const products = await productModel.paginate(query, { page, limit });
    if (products.docs.length === 0) {
      if (category) {
        return res.status(404).send({
          message: "No category found",
        });
      } else {
        return res.status(404).send({
          message: "No products found",
        });
      }
    }
    res.status(200).json({ products });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const addProduct = async (req, res, next) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).send({ message: "No images uploaded" });
    }

    // Upload images to Cloudinary
    const imageUrls = await uploadMultipleImagesToCloudinary(files);

    // console.log(imageUrls);

    const { productName, description, price, stock, category } = req.body;

    // Check if all required fields are provided
    if (!productName || !description || !price || !stock || !category) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Check if a product with the same name already exists
    const existingProduct = await productModel.findOne({ productName });
    if (existingProduct) {
      return res
        .status(400)
        .send({ message: "Product with this name already exists" });
    }

    await productModel.create({
      productName,
      description,
      price,
      stock,
      category,
      productImages: imageUrls,
    });

    res.status(201).send({
      message: "Product created successfully",
    });
  } catch (error) {
    console.log(error);
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
    console.log(error);
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const files = req.files;
    const { productId } = req.params;
    const { productName, description, price, stock, category } = req.body;

    const updateData = {};

    // Only include fields if they are provided
    if (productName) updateData.productName = productName;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (stock) updateData.stock = stock;
    if (category) updateData.category = category;
    // Check if new images are uploaded
    if (files && files.length > 0) {
      const imageUrls = await uploadMultipleImagesToCloudinary(files);
      updateData.productImages = imageUrls;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await productModel.findByIdAndDelete(productId);

    res.status(200).send({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const getAllCustomerOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const options = {
      page,
      limit,
      populate: {
        path: "orderItems.productId",
        select: "-createdAt -updatedAt -__v",
      },
      sort: { createdAt: -1 },
    };

    const orders = await order.paginate({}, options);

    if (!orders || orders.docs.length === 0) {
      res.status(400).send({
        message: "No orders found ",
      });
      return;
    }
    res.status(200).send({ orders });
  } catch (error) {
    console.log(error);
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const approveOrRejectOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      res.status(400).send({
        message: "Invalid status. It must be either 'approved' or 'rejected'",
      });
      return;
    }

    if (!status) {
      res.status(400).send({ message: "Status is required" });
      return;
    }

    const updatedOrder = await order.findByIdAndUpdate(
      orderId,
      {
        status,
      },
      {
        new: true,
      }
    );

    if (!updatedOrder) {
      res.status(404).send({
        message: "Order not found",
      });
      return;
    }

    res.status(200).send({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    next(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const getAllPaymentsDetails = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
    };

    const payments = await transactionsModel.paginate({}, options);

    if (!payments || payments.docs.length === 0) {
      res.status(400).send({
        message: "No payments found ",
      });
      return;
    }
    res.status(200).json(payments);
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
  addProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAllCustomerOrders,
  approveOrRejectOrder,
  getAllPaymentsDetails,
};
