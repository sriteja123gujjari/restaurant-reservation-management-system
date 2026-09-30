process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

jest.setTimeout(60000);

let mongoServer;
let token;
let user;
let table;

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

beforeEach(async () => {
    await User.deleteMany({});
    await Table.deleteMany({});
    await Reservation.deleteMany({});

    // Ensure unique index is built in memory DB before running assertions
    await Reservation.syncIndexes();

    const authRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Reservation Tester',
            email: 'res@example.com',
            password: 'password123',
        });

    token = authRes.body.accessToken;
    user = authRes.body.user;

    table = await Table.create({ tableNumber: 1, capacity: 4 });
});

describe('Reservation API & Double-Booking Prevention', () => {
    test('POST /api/reservations — should successfully create a booking', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const testDate = tomorrow.toISOString().split('T')[0];

        const validTimeSlot = Reservation.TIME_SLOTS[0];

        const reservationData = {
            tableId: table._id,
            date: testDate,
            timeSlot: validTimeSlot,
            guests: 2,
        };

        const res = await request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${token}`)
            .send(reservationData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.timeSlot).toEqual(validTimeSlot);
    });

    test('POST /api/reservations — SHOULD RETURN 409 CONFLICT ON DOUBLE-BOOKING', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const testDate = tomorrow.toISOString().split('T')[0];

        const validTimeSlot = Reservation.TIME_SLOTS[0];

        const reservationData = {
            tableId: table._id,
            date: testDate,
            timeSlot: validTimeSlot,
            guests: 2,
        };

        // First booking
        const firstRes = await request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${token}`)
            .send(reservationData);

        expect(firstRes.statusCode).toEqual(201);

        // Second booking attempt on exact same table, date, and time slot
        const duplicateRes = await request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${token}`)
            .send(reservationData);

        expect(duplicateRes.statusCode).toEqual(409);
    });
});