import { Router } from 'express';
import { 
    handleCreateDish, 
    handleGetAllDishes, 
    handleUpdateDish, 
    handleDeleteDish 
} from '../controllers/dishController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Browsable menu for all users
router.get('/', handleGetAllDishes);

// Admin-only Menu Management
// Create a Dish
router.post('/', authenticate, requireAdmin, handleCreateDish);

// Update a Dish
router.put('/:id', authenticate, requireAdmin, handleUpdateDish);

// Delete a Dish
router.delete('/:id', authenticate, requireAdmin, handleDeleteDish);

export default router;