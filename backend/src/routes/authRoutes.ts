import { Router } from 'express';
import { 
    handleRegister, 
    handleLogin, 
    handleGetUserProfile, 
    handleUpdateUser, 
    handleDeleteUser, 
    handleLogout,
    handleGetAllUsers,
    handleUpdateUserRole
} from '../controllers/authController';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Route to get all users for administration
router.get('/users', authenticate, requireAdmin, handleGetAllUsers);

// Route to update a user's role 
router.patch('/users/:id/role', authenticate, requireAdmin, handleUpdateUserRole);

// Route to register a new user
router.post('/register', handleRegister);

// Route to authenticate an existing user
router.post('/login', handleLogin);

// Route to get a specific user profile
router.get('/:id', authenticate, handleGetUserProfile);

// Route to update a specific user profile
router.put('/:id', authenticate, handleUpdateUser);

// Route to delete a specific user profile
router.delete('/:id', authenticate, handleDeleteUser);

// Route to handle user logout
router.post('/logout', authenticate, handleLogout);

export default router;