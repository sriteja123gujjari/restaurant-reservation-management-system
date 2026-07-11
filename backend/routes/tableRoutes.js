const express = require('express');
const Table = require('../models/Table');
const { getAvailability } = require('../controllers/reservationController');

const router = express.Router();

// GET /api/tables - list all tables (public, just to sanity-check seeding)
router.get('/', async (req, res, next) => {
  try {
    const tables = await Table.find().sort('tableNumber');
    res.status(200).json(tables);
  } catch (err) {
    next(err);
  }
});

// GET /api/tables/availability?date=&timeSlot= - which tables are free
router.get('/availability', getAvailability);

module.exports = router;
