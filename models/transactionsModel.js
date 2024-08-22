const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reference: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

transactionSchema.plugin(mongoosePaginate);

const transactionsModel = model("transaction", transactionSchema);

module.exports = transactionsModel;
