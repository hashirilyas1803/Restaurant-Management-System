import express from 'express';
import cors from 'cors';
import reservationRoutes from './routes/reservationRoutes';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import cateringRoutes from './routes/cateringRoutes';
import dishRoutes from './routes/dishRoutes';

// Create the express app
const app = express();

// Enable CORS
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Mount the authentication routes
app.use('/api/auth', authRoutes);

// Mount the dish routes
app.use('/api/dishes', dishRoutes);

// Mount the reservation routes
app.use('/api/reservations', reservationRoutes);

// Mount the order routes
app.use('/api/orders', orderRoutes);

// Mount the catering routes
app.use('/api/caterings', cateringRoutes);

// Set the app to listen on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});