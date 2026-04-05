import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes';
import orderRoutes from '../../src/routes/orderRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

describe('Workflow 2: Online Ordering Integration Tests', () => {
    let customerToken: string;
    let adminToken: string;
    let orderId: number;

    beforeAll(async () => {
        const customerRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'customer@example.com', password: 'customer123' });
        customerToken = customerRes.body.data.token;

        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@example.com', password: 'admin123' });
        adminToken = adminRes.body.data.token;
    });

    it('should place a new delivery order', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                location: "Test Location",
                type: "DELIVERY",
                paymentMethod: "ONLINE",
                items: [{ dishId: 2, quantity: 3 }]
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.status).toEqual('PENDING');
        orderId = res.body.data.id;
    });

    it('should prevent customer from updating status directly', async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ status: "PREPARING" });

        expect(res.statusCode).toEqual(403); // Validates RBAC
    });

    it('should allow Admin to update status to PREPARING', async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: "PREPARING" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.status).toEqual('PREPARING');
    });
});