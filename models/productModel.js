const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
    },
    productImages: {
      type: Array,
      default: "",
    },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

const productModel = model("product", productSchema);

module.exports = productModel;
