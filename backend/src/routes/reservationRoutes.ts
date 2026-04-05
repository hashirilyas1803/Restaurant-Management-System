import { Router } from 'express';
import { 
    handleCreateReservation, 
    handleGetAllReservations, 
    handleUpdateReservation, 
    handleDeleteReservation 
} from '../controllers/reservationController';
import { authenticate, requireAdmin, requireCustomer } from '../middlewares/authMiddleware';

const router = Router();

// RBAC: Only logged-in Customers can create a reservation
router.post('/', authenticate, requireCustomer, handleCreateReservation);

// A logged-in user can update their own reservation. An Admin can update ANY reservation.
router.put('/:id', authenticate, handleUpdateReservation);

// A logged-in user can view their own reservation. An Admin can view ANY reservation.
router.get('/', authenticate, handleGetAllReservations);

// A logged-in user can delete their own reservation. An Admin can delete ANY reservation.
router.delete('/:id', authenticate, handleDeleteReservation);

export default router;