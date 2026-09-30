const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// Access token: short-lived (15 min), used on every API request
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Refresh token: long-lived (7 days), used only to get a new access token.
// It's a random string stored in the DB — not a JWT — so we can
// invalidate it on logout by deleting it from the DB.
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const safeRole = role === 'admin' ? 'admin' : 'customer';
    const user = await User.create({ name, email, password, role: safeRole });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store hashed refresh token in DB — same reason we hash passwords:
    // if the DB leaks, raw refresh tokens can't be used by an attacker.
    user.refreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.refreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
// Client sends their refresh token, gets a new access token back.
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Hash the incoming token to compare against what we stored
    const hashed = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const user = await User.findOne({
      refreshToken: hashed,
      refreshTokenExpiry: { $gt: Date.now() }, // must not be expired
    }).select('+refreshToken +refreshTokenExpiry');

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const accessToken = generateAccessToken(user);

    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
// Clears the refresh token from DB — future refresh attempts fail.
// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const hashed = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // 1. Explicitly select +refreshToken so Mongoose can match it
      const user = await User.findOne({ refreshToken: hashed }).select('+refreshToken +refreshTokenExpiry');

      if (user) {
        user.refreshToken = undefined;
        user.refreshTokenExpiry = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout };