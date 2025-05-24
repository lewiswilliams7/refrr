import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import businessRoutes from './routes/business';
import campaignRoutes from './routes/campaign';
import customerRoutes from './routes/customer';
import dashboardRoutes from './routes/dashboard';
import healthRoutes from './routes/health';
import referralRoutes from './routes/referral';
import { setupSecurity } from './config/security';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Debug middleware - Log all incoming requests
app.use((req, res, next) => {
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
app.use(express.urlencoded({ extended: true }));

// Setup security (includes CORS)
setupSecurity(app);

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Refrr API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      auth: '/api/auth',
      business: '/api/business',
      campaign: '/api/campaign',
      customer: '/api/customer',
      dashboard: '/api/dashboard',
      referral: '/api/referral',
      health: '/api/health'
    }
  });
});

// Health check route (with /api prefix to match Render's expectations)
app.use('/api/health', healthRoutes);

// API Routes (with /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/referral', referralRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler - must be after all routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'Route not found',
    requestedUrl: req.url,
    method: req.method,
    availableEndpoints: {
      root: '/',
      health: '/api/health',
      auth: '/api/auth',
      business: '/api/business',
      campaign: '/api/campaign',
      customer: '/api/customer',
      dashboard: '/api/dashboard',
      referral: '/api/referral'
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/refrr')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Only start the server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  console.log('Starting server on port:', port);
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (error: NodeJS.ErrnoException) => {
    console.error('Error starting server:', error);
    process.exit(1);
  });
}

export default app;