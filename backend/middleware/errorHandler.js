const { ZodError } = require('zod');

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  // Zod validation failure — flatten to a readable message list
  if (err instanceof ZodError) {
    const errors = err.issues ?? err.errors;
    return res.status(400).json({
      message: errors.map((e) => `${e.path.join('.') || e.path[0]}: ${e.message}`).join(', '),
    });
  }

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