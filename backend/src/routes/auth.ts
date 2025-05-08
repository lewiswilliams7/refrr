import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser));

export default router;