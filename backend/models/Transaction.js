const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type: { type: String, enum: ["collection", "deposit"], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
