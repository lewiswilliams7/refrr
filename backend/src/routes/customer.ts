import express, { RequestHandler } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/analytics', authenticateToken as RequestHandler, customerController.getAnalytics as RequestHandler);

export default router; 