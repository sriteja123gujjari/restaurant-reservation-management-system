const express = require('express');
const cors = require('cors');

// Import routes & middleware
const authRoutes = require('./routes/authRoutes'); // Adjust paths if needed
const reservationRoutes = require('./routes/reservationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;