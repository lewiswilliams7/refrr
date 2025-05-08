import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router; 