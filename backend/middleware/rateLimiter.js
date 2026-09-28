const rateLimit = require('express-rate-limit');

// Applied only to auth routes (/api/auth/register and /api/auth/login).
// 10 attempts per IP per 15 minutes is reasonable for login protection
// without blocking legitimate use. Adjust for production.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        message: 'Too many attempts from this IP, please try again after 15 minutes.',
    },
    standardHeaders: true,  // returns RateLimit-* headers (RFC 6585)
    legacyHeaders: false,
});

module.exports = { authLimiter };