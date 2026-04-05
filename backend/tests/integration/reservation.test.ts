import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/authRoutes';
import reservationRoutes from '../../src/routes/reservationRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

describe('Workflow 1: Reservation Integration Tests', () => {
    let customerToken: string;
    let reservationId: number;

    beforeAll(async () => {
        // Authenticate as the seeded customer to get a token
        const authRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'customer@example.com', password: 'customer123' });
        customerToken = authRes.body.data.token;
    });

    it('should create a reservation with pre-ordered dishes and auto-calculate total', async () => {
        const res = await request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                tableId: 1, // Assumes table 1 exists from seed
                datetime: new Date().toISOString(),
                preOrders:[
                    { dishId: 1, quantity: 2 } // Assumes dish 1 exists
                ]
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.total).toBeGreaterThan(0); // Validates math logic
        reservationId = res.body.data.id;
    });

    it('should retrieve reservations for the logged-in user', async () => {
        const res = await request(app)
            .get('/api/reservations')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].user).not.toHaveProperty('password_hash'); // Validates surgical select
    });

    it('should delete the reservation', async () => {
        const res = await request(app)
            .delete(`/api/reservations/${reservationId}`)
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toEqual(200);
    });
});