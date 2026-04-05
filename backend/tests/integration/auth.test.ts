import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Integration Tests', () => {
    const testUser = {
        name: "Test User",
        email: "tester@example.com",
        password: "password123",
        phone_number: "1234567890"
    };

    it('should register a new user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('token');
    });
});