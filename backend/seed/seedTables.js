// Run with: npm run seed
// Wipes existing tables and inserts a fixed set. Re-runnable safely.
require('dotenv').config();
const mongoose = require('mongoose');
const Table = require('../models/Table');
const User = require('../models/User');

const tables = [
  { tableNumber: 1, capacity: 2 },
  { tableNumber: 2, capacity: 2 },
  { tableNumber: 3, capacity: 4 },
  { tableNumber: 4, capacity: 4 },
  { tableNumber: 5, capacity: 6 },
  { tableNumber: 6, capacity: 8 },
];

// Demo accounts so reviewers (and you, while testing) can log in
// immediately without registering fresh accounts. Document these
// credentials in your README.
const demoUsers = [
  { name: 'Demo Admin', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  { name: 'Demo Customer', email: 'customer@demo.com', password: 'customer123', role: 'customer' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Table.deleteMany({});
    await Table.insertMany(tables);
    console.log(`Seeded ${tables.length} tables successfully.`);

    // Remove any existing demo accounts first so this script is re-runnable
    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });

    // Created one at a time (not insertMany) so the User model's
    // pre('save') password-hashing hook actually runs on each one.
    for (const demoUser of demoUsers) {
      await User.create(demoUser);
    }
    console.log(`Seeded ${demoUsers.length} demo users successfully.`);
    console.log('  Admin login:    admin@demo.com / admin123');
    console.log('  Customer login: customer@demo.com / customer123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
