import express, { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router: Router = express.Router();

// Public routes
router.get('/public', campaignController.getPublicCampaigns as express.RequestHandler);
router.get('/public/:id', campaignController.getPublicCampaign as express.RequestHandler);

// All campaign routes require authentication
router.use(authenticateToken);

// Campaign routes
router.post('/', campaignController.create as express.RequestHandler);
router.get('/', campaignController.getBusinessCampaigns as express.RequestHandler);
router.get('/:id', campaignController.getCampaign as express.RequestHandler);
router.patch('/:id', campaignController.update as express.RequestHandler);
router.delete('/:id', campaignController.delete as express.RequestHandler);
router.patch('/:id/toggle-active', campaignController.toggleActive as express.RequestHandler);

export default router;
