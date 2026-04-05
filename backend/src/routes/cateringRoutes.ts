import { Router } from 'express';
import { 
    handleRequestCatering, 
    handleGetAllCaterings,
    handleUpdateCatering,
    handleDeleteCatering,
    handleApproveRejectCatering 
} from '../controllers/cateringController';
import { authenticate, requireAdmin, requireCustomer } from '../middlewares/authMiddleware';

const router = Router();

// Retrieve catering requests based on user role permissions
router.get('/', authenticate, handleGetAllCaterings);

// Submit a new catering event booking
router.post('/', authenticate, requireCustomer, handleRequestCatering);

// Update details of an existing catering booking
router.put('/:id', authenticate, handleUpdateCatering);

// Cancel a catering booking
router.delete('/:id', authenticate, handleDeleteCatering);

// Administrative review to Approve or Reject requests
router.patch('/:id/status', authenticate, requireAdmin, handleApproveRejectCatering);

export default router;