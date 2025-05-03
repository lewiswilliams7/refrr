import express, { RequestHandler } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import asyncHandler from '../middleware/asyncHandler';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(authController.register) as RequestHandler);
router.post('/register/customer', asyncHandler(authController.registerCustomer) as RequestHandler);
router.post('/login', asyncHandler(authController.login) as RequestHandler);
router.post('/forgot-password', asyncHandler(authController.forgotPassword) as RequestHandler);
router.post('/reset-password', asyncHandler(authController.resetPassword) as RequestHandler);

// Protected routes
router.use(authenticateToken as RequestHandler);
router.get('/me', asyncHandler(authController.getProfile) as RequestHandler);
router.patch('/me', asyncHandler(authController.updateProfile) as RequestHandler);
router.patch('/me/password', asyncHandler(authController.changePassword) as RequestHandler);

export default router;