const mongoose = require('mongoose');

// Connects to MongoDB Atlas using the URI stored in .env
// This runs once when the server starts up.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // stop the server if we can't reach the database
  }
};

module.exports = connectDB;
