import express, { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

router.use(authenticateToken);
router.get('/stats', dashboardController.getStats as express.RequestHandler);

export default router;
