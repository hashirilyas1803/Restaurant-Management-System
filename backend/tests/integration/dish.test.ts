import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes';
import dishRoutes from '../../src/routes/dishRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);

describe('Menu Management (Dish) Integration Tests', () => {
    let customerToken: string;
    let adminToken: string;
    let dishId: number;

    beforeAll(async () => {
        // Authenticate Customer
        const customerRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'customer@example.com', password: 'customer123' });
        customerToken = customerRes.body.data.token;

        // Authenticate Admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@example.com', password: 'admin123' });
        adminToken = adminRes.body.data.token;
    });

    it('should allow public access to view the menu', async () => {
        const res = await request(app).get('/api/dishes');
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should prevent a customer from adding a new dish', async () => {
        const res = await request(app)
            .post('/api/dishes')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                name: "Customer Attempt Dish",
                price: 10.00,
                cuisine: "Test",
                category: "Starters"
            });

        expect(res.statusCode).toEqual(403);
    });

    it('should allow an Admin to add a new dish', async () => {
        const res = await request(app)
            .post('/api/dishes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: "Spicy Beef Tacos",
                price: 12.99,
                cuisine: "Mexican",
                category: "Mains"
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data.name).toEqual("Spicy Beef Tacos");
        
        dishId = res.body.data.id;
    });

    it('should allow an Admin to update a dish', async () => {
        const res = await request(app)
            .put(`/api/dishes/${dishId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                price: 14.99
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.price).toEqual(14.99);
    });

    it('should allow an Admin to delete a dish', async () => {
        const res = await request(app)
            .delete(`/api/dishes/${dishId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
    });
});