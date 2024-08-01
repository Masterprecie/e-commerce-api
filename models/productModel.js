const { Schema, model, Types } = require("mongoose");
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
    stock: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

const productModel = model("product", productSchema);

module.exports = productModel;
