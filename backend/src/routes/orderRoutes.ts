import { Router } from 'express';
import { 
    handleCreateOrder, 
    handleGetOrder, 
    handleGetAllOrders, 
    handleUpdateOrderStatus, 
    handleDeleteOrder, 
    handleUpdateOrder
} from '../controllers/orderController';
import { authenticate, requireAdmin, requireCustomer } from '../middlewares/authMiddleware';

const router = Router();

// Retrieve all orders (Filtered for customers, full for admins)
router.get('/', authenticate, handleGetAllOrders);

// Place a new online order (Customer only)
router.post('/', authenticate, requireCustomer, handleCreateOrder);

// Update order only if it is still PENDING
router.put('/:id', authenticate, handleUpdateOrder);

// Retrieve a specific order by ID
router.get('/:id', authenticate, handleGetOrder);

// Update order fulfillment status (Admin only)
router.patch('/:id/status', authenticate, requireAdmin, handleUpdateOrderStatus);

// Cancel/Delete an order
router.delete('/:id', authenticate, handleDeleteOrder);

export default router;