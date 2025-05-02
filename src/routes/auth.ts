import express, { Request, Response, NextFunction } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Wrap controller methods to ensure proper Promise handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/register/customer', asyncHandler(authController.registerCustomer));
router.post('/login', asyncHandler(authController.login));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser));

export default router;