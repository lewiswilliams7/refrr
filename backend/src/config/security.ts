import rateLimit from 'express-rate-limit';
import { Express } from 'express';
import cors from 'cors';

const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increase limit to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  skip: (req: any) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/api/health' || req.path === '/api/health/status';
  }
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://refrr.onrender.com',
      'https://refrr-frontend.onrender.com',
      'https://refrr.vercel.app',
      'https://refrr-git-main-lewiswilliams7.vercel.app'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided, allowing request');
      callback(null, true);
      return;
    }

    console.log('Checking CORS for origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development environment, allowing all origins');
      callback(null, true);
      return;
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Allowed CORS origin:', origin);
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Credentials'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export const setupSecurity = (app: Express) => {
  // Enable trust proxy
  app.set('trust proxy', 1);

  // Setup CORS
  app.use(cors(corsOptions));

  // Setup rate limiting
  app.use(rateLimit(rateLimitOptions));

  // Add security headers
  app.use((req, res, next) => {
    // Basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Additional security headers
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // CORS headers
    const origin = req.headers.origin;
    if (origin && corsOptions.origin(origin, (err, allow) => allow)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
    
    next();
  });
}; 