const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createReservation,
  getMyReservations,
  cancelReservation,
} = require('../controllers/reservationController');

const router = express.Router();

// Every route here requires a logged-in user
router.use(authenticate);

router.post('/', authorize('customer'), createReservation);
router.get('/my', authorize('customer'), getMyReservations);
router.delete('/:id', authorize('customer', 'admin'), cancelReservation);

module.exports = router;
