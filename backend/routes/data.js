const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Employee = require("../models/Employee");
const Transaction = require("../models/Transaction");

// Create default 5 employees (run once)
router.post("/init-employees", auth, async (req, res) => {
  try {
    const employeesData = [
      { name: "Mayank", employeeId: "EMP001" },
      { name: "Rohit", employeeId: "EMP002" },
      { name: "Sneha", employeeId: "EMP003" },
      { name: "Anjali", employeeId: "EMP004" },
      { name: "Vikram", employeeId: "EMP005" },
    ];
    await Employee.deleteMany({});
    await Employee.insertMany(employeesData);
    res.json({ message: "Employees initialized" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all employees
router.get("/employees", auth, async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

// Add transaction (collection or deposit)
router.post("/transaction", auth, async (req, res) => {
  try {
    const { employeeId, type, amount, date } = req.body;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(400).json({ message: "Employee not found" });
    const transaction = new Transaction({
      employee: employee._id,
      type,
      amount,
      date: new Date(date),
    });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get outstanding report data
router.get("/outstanding-report", auth, async (req, res) => {
  try {
    // For each employee calculate net collection, most recent transaction date, difference
    const employees = await Employee.find();

    const report = await Promise.all(
      employees.map(async (emp) => {
        const transactions = await Transaction.find({ employee: emp._id }).sort({ date: 1 });
        let totalCollection = 0;
        let totalDeposit = 0;
        let lastTransactionDate = null;

        transactions.forEach((t) => {
          if (t.type === "collection") totalCollection += t.amount;
          else if (t.type === "deposit") totalDeposit += t.amount;

          if (!lastTransactionDate || t.date > lastTransactionDate) lastTransactionDate = t.date;
        });

        return {
          employeeId: emp.employeeId,
          name: emp.name,
          netCollection: totalCollection,
          totalDeposit,
          lastTransactionDate,
          difference: totalCollection - totalDeposit,
        };
      })
    );

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employee payment report with date-wise detailed transactions
router.get("/payment-report/:employeeId", auth, async (req, res) => {
  try {
    const emp = await Employee.findOne({ employeeId: req.params.employeeId });
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const transactions = await Transaction.find({ employee: emp._id }).sort({ date: 1 });

    // Logic: payments should clear oldest collection first (FIFO)
    // We'll create an array of collections and deposits and compute difference day-wise

    let collections = [];
    let deposits = [];
    transactions.forEach((t) => {
      if (t.type === "collection") {
        collections.push({ date: t.date, amount: t.amount, remaining: t.amount });
      } else {
        deposits.push({ date: t.date, amount: t.amount });
      }
    });

    // Apply deposits to collections FIFO
    let depositIndex = 0;
    deposits.forEach((dep) => {
      let amountLeft = dep.amount;
      for (let c of collections) {
        if (c.remaining > 0 && amountLeft > 0) {
          const payAmount = Math.min(c.remaining, amountLeft);
          c.remaining -= payAmount;
          amountLeft -= payAmount;
        }
      }
    });

    // Prepare detailed report combining collections and deposits per date
    // For each date involved, we will show the sum of collections and deposits on that date, difference etc.

    // Gather all dates
    const datesSet = new Set();
    collections.forEach((c) => datesSet.add(c.date.toISOString().slice(0,10)));
    deposits.forEach((d) => datesSet.add(d.date.toISOString().slice(0,10)));

    const dates = Array.from(datesSet).sort();

    // For each date calculate summary
    let runningBalance = 0;
    const detailedReport = dates.map((dateStr) => {
      const collectionForDate = collections
        .filter(c => c.date.toISOString().slice(0,10) === dateStr)
        .reduce((sum, c) => sum + c.amount, 0);

      const depositForDate = deposits
        .filter(d => d.date.toISOString().slice(0,10) === dateStr)
        .reduce((sum, d) => sum + d.amount, 0);

      runningBalance += collectionForDate - depositForDate;

      return {
        date: dateStr,
        employeeName: emp.name,
        employeeId: emp.employeeId,
        collectionAmount: collectionForDate,
        depositAmount: depositForDate,
        difference: runningBalance,
      };
    });

    res.json(detailedReport);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
