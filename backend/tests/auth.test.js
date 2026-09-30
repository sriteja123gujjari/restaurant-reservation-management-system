process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('Authentication API', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
    };

    test('POST /api/auth/register — should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body.user.email).toEqual(testUser.email);
    });

    test('POST /api/auth/login — should log in and return tokens', async () => {
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
    });

    test('POST /api/auth/logout & /refresh — should invalidate refresh token on logout', async () => {
        const registerRes = await request(app).post('/api/auth/register').send(testUser);
        const { refreshToken } = registerRes.body;

        // Logout
        const logoutRes = await request(app)
            .post('/api/auth/logout')
            .send({ refreshToken });

        expect(logoutRes.statusCode).toEqual(200);

        // Refresh attempt should fail
        const refreshRes = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken });

        expect(refreshRes.statusCode).toEqual(401);
        expect(refreshRes.body.message).toMatch(/invalid or expired/i);
    });
});