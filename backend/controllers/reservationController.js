const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// POST /api/reservations  (customer)
const createReservation = async (req, res, next) => {
  try {
    const { tableId, date, timeSlot, guests } = req.body;

    if (!tableId || !date || !timeSlot || !guests) {
      return res.status(400).json({
        message: 'tableId, date, timeSlot and guests are all required',
      });
    }

    if (!Reservation.TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({
        message: `timeSlot must be one of: ${Reservation.TIME_SLOTS.join(', ')}`,
      });
    }

    // Basic sanity check: don't allow bookings for dates in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ message: 'Cannot book a date in the past' });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Capacity check - business rule, not a database constraint
    if (guests > table.capacity) {
      return res.status(400).json({
        message: `Table ${table.tableNumber} only seats ${table.capacity} guests`,
      });
    }

    // This is the line that can throw a MongoDB duplicate-key error (11000)
    // if another confirmed reservation already holds this table/date/slot.
    // That error is caught by middleware/errorHandler.js and turned into
    // a clean 409 Conflict response - this is the actual double-booking
    // prevention at work, not just a pre-check.
    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date,
      timeSlot,
      guests,
    });

    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
};

// GET /api/reservations/my  (customer - their own reservations only)
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table', 'tableNumber capacity')
      .sort('-date');

    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reservations/:id  (customer: only their own / admin: any)
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // A customer may only cancel their own reservation; an admin may cancel any.
    // This is authorization logic that can't live in middleware, since it
    // depends on WHICH reservation, not just the route.
    const isOwner = reservation.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'You can only cancel your own reservations' });
    }

    reservation.status = 'cancelled';
    await reservation.save();
    // Note: because the unique index only applies to status:'confirmed',
    // cancelling frees up that table/date/slot for someone else to book.

    res.status(200).json({ message: 'Reservation cancelled', reservation });
  } catch (err) {
    next(err);
  }
};

// GET /api/tables/availability?date=&timeSlot=  (public - used by booking form)
const getAvailability = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.query;

    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'date and timeSlot query params are required' });
    }

    const allTables = await Table.find().sort('tableNumber');

    const bookedTableIds = await Reservation.find({
      date,
      timeSlot,
      status: 'confirmed',
    }).distinct('table');

    const bookedIdSet = new Set(bookedTableIds.map((id) => id.toString()));

    const availableTables = allTables.filter(
      (table) => !bookedIdSet.has(table._id.toString())
    );

    res.status(200).json(availableTables);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAvailability,
};
