const Reservation = require('../models/Reservation');

// GET /api/admin/reservations           - all reservations
// GET /api/admin/reservations?date=...  - filtered by date
const getAllReservations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort('-date');

    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/reservations/:id  - admin can update date/timeSlot/guests/status
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const { date, timeSlot, guests, status } = req.body;

    if (date) reservation.date = date;
    if (timeSlot) reservation.timeSlot = timeSlot;
    if (guests) reservation.guests = guests;
    if (status) reservation.status = status;

    // .save() re-triggers the unique index check - so an admin can't
    // accidentally move a reservation onto a slot that's already taken either.
    await reservation.save();

    res.status(200).json(reservation);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllReservations, updateReservation };
