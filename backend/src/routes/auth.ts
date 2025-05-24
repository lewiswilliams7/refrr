import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/register/business', asyncHandler(authController.registerBusiness));
router.post('/customer/register', asyncHandler(authController.registerCustomer));
router.post('/login', asyncHandler(authController.login));
router.post('/business/login', asyncHandler(authController.loginBusiness));
router.post('/customer/login', asyncHandler(authController.loginCustomer));
router.get('/verify-email', asyncHandler(authController.verifyEmail));
router.post('/resend-verification', asyncHandler(authController.resendVerificationEmail));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser));
router.post('/logout', authenticate, asyncHandler(authController.logout));

export default router;