import express from 'express';
import { referralController } from '../controllers/referral.controller';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth.types';
import { Response } from 'express';
import { Referral } from '../models/referral.model';
import { Customer } from '../models/customer.model';
import { Campaign } from '../models/campaign.model';
import { sendEmail } from '../services/email.service';
import { ReferralStatus } from '../types/referral.types';

const router = express.Router();

// Debug logging middleware
router.use((req, res, next) => {
  console.log(`[Referral Routes] ${req.method} ${req.url}`);
  next();
});

// Public routes
router.get('/code/:code', asyncHandler(referralController.getReferralByCode));
router.post('/code/:code/complete', asyncHandler(referralController.completeReferral));
router.get('/track/:code', asyncHandler(referralController.trackReferral));

// Protected routes
router.use(authenticateToken);

// Generate referral link
router.post('/', asyncHandler(referralController.create));

// Get all referrals
router.get('/', asyncHandler(referralController.getBusinessReferrals));

// Get referral by ID
router.get('/:id', asyncHandler(referralController.getReferral));

// Delete referral
router.delete('/:id', asyncHandler(referralController.deleteReferral));

// 404 handler for referral routes
router.use((req, res) => {
  console.log(`[Referral Routes] 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Referral route not found' });
});

export default router;
