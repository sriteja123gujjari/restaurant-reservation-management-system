const jwt = require('jsonwebtoken');
const User = require('../models/User');

// AUTHENTICATE: checks "is this a logged-in user at all?"
// Runs on every protected route. Reads the token from the
// Authorization header, verifies it was signed by us, and
// loads the matching user onto req.user so later code can use it.
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>" -> <token>

    // jwt.verify throws if the token is expired, malformed, or
    // wasn't signed with our JWT_SECRET (i.e. someone forged it).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user; // now every downstream handler knows who's calling
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// AUTHORIZE: checks "is this logged-in user allowed to do THIS?"
// Usage: authorize('admin')  or  authorize('admin', 'customer')
// Must run after authenticate, since it relies on req.user.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
