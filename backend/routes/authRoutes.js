const express = require('express');
const { register, login } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();

const registerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['customer', 'admin']).optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);

module.exports = router;