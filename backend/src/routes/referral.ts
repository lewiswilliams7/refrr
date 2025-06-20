import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { referralController } from '../controllers/referral.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Logger middleware
const loggerMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🔍 Referral Route Hit:', {
    method: req.method,
    url: req.url,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query,
    route: req.route ? {
      path: req.route.path,
      methods: req.route.methods,
      params: req.route.params
    } : 'No route matched'
  });
  next();
};

// Apply logger middleware to all routes
router.use(loggerMiddleware);

// Simple health check for referral routes - NO AUTHENTICATION REQUIRED
router.get('/health', (req: Request, res: Response) => {
  console.log('Referral routes health check - no auth required');
  res.json({ 
    message: 'Referral routes are working', 
    timestamp: new Date().toISOString(),
    routes: {
      health: 'GET /health',
      track: 'GET /track/:code',
      getByCode: 'GET /code/:code',
      test: 'GET /test/:code',
      complete: 'POST /complete/:code'
    }
  });
});

// Public routes - NO AUTHENTICATION REQUIRED
router.get('/track/:code', asyncHandler(referralController.trackReferral));
router.get('/code/:code', asyncHandler(referralController.getReferralByCode));
router.post('/complete/:code', asyncHandler(referralController.completeReferral));

// Protected routes - Apply authentication middleware
router.use(authenticate);

// Protected route handlers
console.log('📝 Registering protected routes...');
router.post('/generate/:campaignId', asyncHandler(referralController.generateReferralLink));
console.log('✅ Registered POST /generate/:campaignId');
router.get('/', asyncHandler(referralController.getReferrals));
router.get('/:id', asyncHandler(referralController.getReferralById));
router.post('/', asyncHandler(referralController.createReferral));
router.patch('/:id/status', asyncHandler(referralController.updateReferralStatus));
router.put('/:id', asyncHandler(referralController.updateReferral));
router.delete('/:id', asyncHandler(referralController.deleteReferral));

// 404 handler for undefined routes
const notFoundHandler = async (req: Request, res: Response): Promise<void> => {
  console.log('❌ 404 - Referral Route Not Found:', {
    method: req.method,
    url: req.url,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query,
    route: req.route ? {
      path: req.route.path,
      methods: req.route.methods,
      params: req.route.params
    } : 'No route matched'
  });
  res.status(404).json({ message: 'Referral route not found' });
};

router.use(notFoundHandler);

export default router;
