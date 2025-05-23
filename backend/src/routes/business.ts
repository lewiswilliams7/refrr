import express from 'express';
import { businessController } from '../controllers/business.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// Public routes
router.get('/public', asyncHandler(businessController.getPublicBusinesses));
router.get('/public/:id', asyncHandler(businessController.getPublicBusiness));

// Protected routes
router.use(authenticate);
router.get('/profile', asyncHandler(businessController.getBusinessProfile));
router.put('/profile', asyncHandler(businessController.updateBusinessProfile));
router.get('/campaigns', asyncHandler(businessController.getBusinessCampaigns));
router.get('/analytics', asyncHandler(businessController.getBusinessAnalytics));

export default router;
