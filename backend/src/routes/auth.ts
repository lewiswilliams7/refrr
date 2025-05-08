import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/register/customer', asyncHandler(authController.registerCustomer));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/verify-email', asyncHandler(authController.verifyEmail));
router.post('/resend-verification', asyncHandler(authController.resendVerificationEmail));

export default router;