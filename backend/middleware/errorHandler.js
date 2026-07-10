// Catches requests to routes that don't exist
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Central place all errors flow through, instead of scattering
// try/catch response logic across every controller.
// Any controller can just call next(err) and it lands here.
const errorHandler = (err, req, res, next) => {
  // MongoDB duplicate key error (used by the reservation unique index)
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'This table is already booked for the selected date and time slot.',
    });
  }

  // Mongoose validation errors (e.g. missing required field)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server error',
  });
};

module.exports = { notFound, errorHandler };
