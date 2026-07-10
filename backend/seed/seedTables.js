// Run with: npm run seed
// Wipes existing tables and inserts a fixed set. Re-runnable safely.
require('dotenv').config();
const mongoose = require('mongoose');
const Table = require('../models/Table');

const tables = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 8 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Table.deleteMany({});
    await Table.insertMany(tables);

    console.log(`Seeded ${tables.length} tables successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
