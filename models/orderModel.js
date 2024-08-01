const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
  },
});

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderItems: [orderItemSchema],
    totalCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
  },
  { timestamps: true }
);
orderSchema.plugin(mongoosePaginate);

const order = model("order", orderSchema);
const orderItem = model("orderItem", orderItemSchema);

module.exports = {
  order,
  orderItem,
};
