import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes';
import cateringRoutes from '../../src/routes/cateringRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/catering', cateringRoutes);

describe('Workflow 3: Catering & Events Integration Tests', () => {
    let customerToken: string;
    let adminToken: string;
    let cateringId: number;

    beforeAll(async () => {
        const customerRes = await request(app).post('/api/auth/login').send({ email: 'customer@example.com', password: 'customer123' });
        customerToken = customerRes.body.data.token;

        const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'admin123' });
        adminToken = adminRes.body.data.token;
    });

    it('should create a catering request with Price-Per-Head logic', async () => {
        const res = await request(app)
            .post('/api/catering')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                eventName: "Test Wedding",
                guestCount: 100,
                location: "Grand Hall",
                datetime: new Date().toISOString(),
                menuItemIds:[1, 2]
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.guestCount).toEqual(100);
        expect(res.body.data.total).toBeGreaterThan(0); // Proves math logic executed
        cateringId = res.body.data.id;
    });

    it('should allow Admin to APPROVE the event', async () => {
        const res = await request(app)
            .patch(`/api/catering/${cateringId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: "APPROVED" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.status).toEqual('APPROVED');
    });
});