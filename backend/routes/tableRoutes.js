const express = require('express');
const Table = require('../models/Table');

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

module.exports = router;
