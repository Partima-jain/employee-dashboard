const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/employee_reports", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const EmployeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  passwordHash: String,
});

const TransactionSchema = new mongoose.Schema({
  employeeId: String,
  type: { type: String, enum: ["collection", "deposit"] },
  amount: Number,
  date: Date,
});

const Employee = mongoose.model("Employee", EmployeeSchema);
const Transaction = mongoose.model("Transaction", TransactionSchema);

const JWT_SECRET = "your_jwt_secret";

app.post("/api/auth/login", async (req, res) => {
  const { employeeId, password } = req.body;
  const user = await Employee.findOne({ employeeId });
  if (!user) return res.status(400).send("Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).send("Invalid credentials");

  const token = jwt.sign({ employeeId: user.employeeId, name: user.name }, JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token, name: user.name, employeeId: user.employeeId });
});

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).send("Unauthorized");

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).send("Unauthorized");
  }
};

app.get("/api/data/employees", authMiddleware, async (req, res) => {
  const employees = await Employee.find({}, { passwordHash: 0 });
  res.json(employees);
});

app.post("/api/data/transaction", authMiddleware, async (req, res) => {
  const { employeeId, type, amount, date } = req.body;
  if (!["collection", "deposit"].includes(type)) return res.status(400).send("Invalid transaction type");
  const transaction = new Transaction({ employeeId, type, amount, date: new Date(date) });
  await transaction.save();
  res.json({ success: true });
});

// Logic to calculate outstanding report with net collection, total deposits, difference, last transaction date
app.get("/api/data/outstanding-report", authMiddleware, async (req, res) => {
  const employees = await Employee.find({}, { passwordHash: 0 });
  const data = [];

  for (const emp of employees) {
    const collections = await Transaction.aggregate([
      { $match: { employeeId: emp.employeeId, type: "collection" } },
      { $group: { _id: null, total: { $sum: "$amount" }, lastDate: { $max: "$date" } } },
    ]);
    const deposits = await Transaction.aggregate([
      { $match: { employeeId: emp.employeeId, type: "deposit" } },
      { $group: { _id: null, total: { $sum: "$amount" }, lastDate: { $max: "$date" } } },
    ]);

    const netCollection = collections.length > 0 ? collections[0].total : 0;
    const totalDeposit = deposits.length > 0 ? deposits[0].total : 0;
    const lastCollectionDate = collections.length > 0 ? collections[0].lastDate : null;
    const lastDepositDate = deposits.length > 0 ? deposits[0].lastDate : null;
    const lastTransactionDate =
      !lastCollectionDate && !lastDepositDate
        ? null
        : lastCollectionDate > lastDepositDate
        ? lastCollectionDate
        : lastDepositDate;

    data.push({
      employeeId: emp.employeeId,
      name: emp.name,
      netCollection,
      totalDeposit,
      lastTransactionDate,
      difference: netCollection - totalDeposit,
    });
  }
  res.json(data);
});

// Payment report endpoint with balance carry-over logic
app.get("/api/data/payment-report/:employeeId", authMiddleware, async (req, res) => {
  const { employeeId } = req.params;
  const transactions = await Transaction.find({ employeeId }).sort({ date: 1 });

  // Process transactions by date with balance carry-over
  const result = [];
  let balance = 0;

  // Group by date
  const dates = [...new Set(transactions.map((t) => t.date.toISOString().split("T")[0]))];

  for (const date of dates) {
    const dateTransactions = transactions.filter(
      (t) => t.date.toISOString().split("T")[0] === date
    );

    let collectionAmount = 0;
    let depositAmount = 0;

    for (const t of dateTransactions) {
      if (t.type === "collection") collectionAmount += t.amount;
      else if (t.type === "deposit") depositAmount += t.amount;
    }

    // Adjust deposit by balance
    let adjustedDeposit = depositAmount;
    if (balance > 0) {
      if (adjustedDeposit >= balance) {
        adjustedDeposit -= balance;
        balance = 0;
      } else {
        balance -= adjustedDeposit;
        adjustedDeposit = 0;
      }
    }

    balance += collectionAmount - adjustedDeposit;

    result.push({
      date,
      employeeName: (await Employee.findOne({ employeeId })).name,
      employeeId,
      collectionAmount,
      depositAmount,
      difference: collectionAmount - depositAmount,
    });
  }

  res.json(result);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// Insert initial employees if not present
const createInitialEmployees = async () => {
  const count = await Employee.countDocuments();
  if (count === 0) {
    const employees = [
      { employeeId: "E001", name: "Mayank" },
      { employeeId: "E002", name: "Sonal" },
      { employeeId: "E003", name: "Amit" },
      { employeeId: "E004", name: "Riya" },
      { employeeId: "E005", name: "Karan" },
    ];
    for (const emp of employees) {
      const hash = await bcrypt.hash("password123", 10);
      const newEmp = new Employee({ ...emp, passwordHash: hash });
      await newEmp.save();
    }
    console.log("Initial employees created");
  }
};

createInitialEmployees();
