const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

// Models
const User = require("./models/User");
const Employee = require("./models/Employee");
const Transaction = require("./models/Transaction");

// Auth Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Employee and Transaction Routes
const dataRoutes = require("./routes/data");
app.use("/api/data", dataRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
