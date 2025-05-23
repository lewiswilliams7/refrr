import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import businessRoutes from './routes/business';
import campaignRoutes from './routes/campaign';
import customerRoutes from './routes/customer';
import adminRoutes from './routes/admin';
import dashboardRoutes from './routes/dashboard';
import healthRoutes from './routes/health';
import referralRoutes from './routes/referral';
import { setupSecurity } from './config/security';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// CORS configuration - MUST be first middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Log CORS-related headers
  console.log('=== CORS Headers ===');
  console.log('Origin:', req.headers.origin);
  console.log('Access-Control-Request-Method:', req.headers['access-control-request-method']);
  console.log('Access-Control-Request-Headers:', req.headers['access-control-request-headers']);
  console.log('=====================');

  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', 'https://refrr-frontend.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(204).end();
    return;
  }

  next();
});

// Debug middleware - Log all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('=====================');
  next();
});

// Basic middleware
app.use(morgan('dev'));
app.use(express.json());

// Setup security (includes rate limiting)
setupSecurity(app);

// Root route
app.get('/', (req: Request, res: Response) => {
  console.log('=== Root Route Handler ===');
  res.json({
    message: 'Welcome to Refrr API',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/docs'
  });
});

// API Routes - Order matters!
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  console.log('404 - Route not found:', {
    method: req.method,
    url: req.url,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query
  });
  res.status(404).json({
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Use the PORT environment variable provided by Render.com
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 