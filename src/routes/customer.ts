import express from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/analytics', authenticateToken, customerController.getAnalytics);

export default router; 