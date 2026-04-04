import express from 'express';
import reservationRoutes from './routes/reservationRoutes';

// Create the express app
const app = express();

// Parse incoming JSON payloads
app.use(express.json());

// Use the reservation routes for any request to /api/reservations
app.use('/api/reservations', reservationRoutes);

// Set the app to listen on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});