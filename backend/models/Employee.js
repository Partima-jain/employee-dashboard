const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
