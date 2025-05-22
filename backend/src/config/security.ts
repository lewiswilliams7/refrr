import rateLimit from 'express-rate-limit';
import { Express } from 'express';

const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  skip: (req: any) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/api/health' || req.path === '/api/health/status';
  }
};

export const setupSecurity = (app: Express) => {
  // Enable trust proxy
  app.set('trust proxy', 1);

  // Setup rate limiting
  app.use(rateLimit(rateLimitOptions));

  // Add security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}; 