const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await User.deleteMany();

  await User.create([
    { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'employee' },
    { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'employee' },
    { name: 'Mayank', email: 'mayank@example.com', password: 'password123', role: 'employee' },
    { name: 'Sita', email: 'sita@example.com', password: 'password123', role: 'employee' },
    { name: 'Ravi', email: 'ravi@example.com', password: 'password123', role: 'employee' },
  ]);

  console.log("Users seeded successfully");
  process.exit();
};

seed();
