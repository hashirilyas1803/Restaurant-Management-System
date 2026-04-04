import { Router } from 'express';
import { 
    handleCreateReservation, 
    handleGetAllReservations, 
    handleUpdateReservation, 
    handleDeleteReservation 
} from '../controllers/reservationController';

const router = Router();

// Route to get all reservations
router.get('/', handleGetAllReservations);

// Route to create a new reservation
router.post('/', handleCreateReservation);

// Route to update an existing reservation by ID
router.put('/:id', handleUpdateReservation);

// Route to delete a reservation by ID
router.delete('/:id', handleDeleteReservation);

export default router;