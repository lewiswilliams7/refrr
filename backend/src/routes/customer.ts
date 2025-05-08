import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { customerController } from '../controllers/customer.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Protected routes
router.get('/analytics', authenticateToken, asyncHandler(customerController.getAnalytics));

export default router; 