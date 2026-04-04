import { Router } from 'express';
import { 
    handleRegister, 
    handleLogin, 
    handleGetUserProfile, 
    handleUpdateUser, 
    handleDeleteUser, 
    handleLogout
} from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

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