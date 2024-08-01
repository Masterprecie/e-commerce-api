const { order } = require("../models/orderModel");
const productModel = require("../models/productModel");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

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

const addProduct = async (req, res, next) => {
  try {
    // const productImages = await cloudinary.v2.uploader.upload(req.file.path, {
    //   resource_type: "image",
    //   uploade_preset: "kodecamp4",
    // });
    // console.log(productImages);

    const files = req.files;
    console.log(files);

    if (!files || files.length === 0) {
      return res.status(400).send({ message: "No images uploaded" });
    }

    // Upload images to Cloudinary
    const imageUploadPromises = files.map((file) => {
      const filePath = path.join(
        __dirname,
        "../public",
        "images",
        file.filename
      );

      // Use a promise to handle the file upload
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          filePath,
          {
            resource_type: "image",
            upload_preset: "kodecamp4",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            // Remove the local file after uploading
            fs.unlinkSync(filePath);
            resolve(result.secure_url);
          }
        );
      });
    });

    // Resolve all upload promises
    const imageUrls = await Promise.all(imageUploadPromises);
    console.log(imageUrls);

    const { productName, description, price, quantity } = req.body;

    // Check if all required fields are provided
    if (!productName || !description || !price || !quantity) {
      return res.status(400).send({ message: "All fields are required" });
    }

    await productModel.create({
      productName,
      description,
      price,
      quantity,
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
    const { productId } = req.params;
    const { productName, description, price, quantity } = req.body;

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        productName,
        description,
        price,
        quantity,
      },
      {
        new: true,
      }
    );
    res.status(200).send({
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

module.exports = {
  getAllProducts,
  addProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getAllCustomerOrders,
  approveOrRejectOrder,
};
