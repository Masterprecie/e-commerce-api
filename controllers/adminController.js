const productModel = require("../models/productModel");

const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit } = req.params;
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
    const { productName, description, price, stock } = req.body;

    // Check if all required fields are provided
    if (!productName || !description || !price || !stock) {
      return res.status(400).send({ message: "All fields are required" });
    }

    await productModel.create({
      productName,
      description,
      price,
      stock,
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

const updateProduct = async (req, res, next) => {};

const deleteProduct = async (req, res, next) => {};

module.exports = {
  getAllProducts,
  addProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
