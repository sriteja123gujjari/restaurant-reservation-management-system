const mongoose = require('mongoose');

// Fixed time slots instead of free-form start/end times.
// This turns "does this overlap with an existing booking?" (hard, error-prone)
// into "does this exact table+date+slot combination already exist?" (simple).
const TIME_SLOTS = [
  '12:00-13:30',
  '13:30-15:00',
  '19:00-20:30',
  '20:30-22:00',
];

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD' to keep comparisons simple
      required: true,
    },
    timeSlot: {
      type: String,
      enum: TIME_SLOTS,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// THE CORE ANTI-DOUBLE-BOOKING MECHANISM.
// A unique index on (table, date, timeSlot) that only applies to
// documents where status === 'confirmed'. MongoDB itself will reject
// a second confirmed reservation for the same table/date/slot combo
// with a duplicate-key error (code 11000) - even if two requests
// arrive at the exact same millisecond. This is enforced at the
// database layer, not just in application code, so it can't be
// bypassed by a race condition between "check" and "insert".
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'confirmed' },
  }
);

reservationSchema.statics.TIME_SLOTS = TIME_SLOTS;

module.exports = mongoose.model('Reservation', reservationSchema);
