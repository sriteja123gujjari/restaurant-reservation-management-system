const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllReservations, updateReservation } = require('../controllers/adminController');

const router = express.Router();

// Everything under /api/admin requires both a valid login AND the admin role
router.use(authenticate, authorize('admin'));

router.get('/reservations', getAllReservations);
router.put('/reservations/:id', updateReservation);

module.exports = router;
