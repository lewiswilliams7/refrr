import express, { Router, Request, Response, NextFunction } from 'express';
import { referralController } from '../controllers/referral.controller';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// Debug logging middleware
router.use((req, res, next) => {
  console.log(`[Referral Routes] ${req.method} ${req.url}`);
  next();
});

// Public routes (no authentication required)
router.get('/code/:code', referralController.getReferralByCode as express.RequestHandler);
router.post('/complete/:code', referralController.completeReferral as express.RequestHandler);

// Protected routes (require authentication)
router.use(authenticateToken as express.RequestHandler); // Authentication middleware for routes below this line

// These routes require authentication
router.post('/', referralController.create as express.RequestHandler);
router.get('/', referralController.getBusinessReferrals as express.RequestHandler);
router.post('/generate/:campaignId', referralController.generateReferralLink as express.RequestHandler);
router.get('/:id', referralController.getReferral as express.RequestHandler);
router.patch('/:id/status', referralController.updateStatus as express.RequestHandler);

// 404 handler for referral routes
router.use((req, res) => {
  console.log(`[Referral Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Referral route not found' });
});

export default router;
