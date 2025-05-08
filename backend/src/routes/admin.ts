import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Debug logging middleware
const loggerMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  console.log(`[Admin Routes] ${req.method} ${req.url}`);
  next();
};

router.use(loggerMiddleware);

// Protected routes
router.use(authenticateToken);

// Get all users
router.get('/users', asyncHandler(adminController.getAllUsers));

// Get user by ID
router.get('/users/:id', asyncHandler(adminController.getUser));

// Delete user
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

// Get all businesses
router.get('/businesses', asyncHandler(adminController.getAllBusinesses));

// Get business by ID
router.get('/businesses/:id', asyncHandler(adminController.getBusiness));

// Update business status
router.patch('/businesses/:id/status', asyncHandler(adminController.updateBusinessStatus));

// Delete business
router.delete('/businesses/:id', asyncHandler(adminController.deleteBusiness));

// 404 handler for admin routes
const notFoundHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  console.log(`[Admin Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Admin route not found' });
};

router.use(notFoundHandler);

export default router; 