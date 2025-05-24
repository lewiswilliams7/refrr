import express, { Request, Response, NextFunction } from 'express';
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

// Create Express app
const app = express();

// Security middleware
setupSecurity(app);

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Root route handler
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Refrr API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      auth: '/api/auth',
      business: '/api/business',
      campaign: '/api/campaign',
      customer: '/api/customer',
      admin: '/api/admin',
      dashboard: '/api/dashboard',
      referral: '/api/referral',
      health: '/health'
    }
  });
});

// Health check route
app.use('/health', healthRoutes);

// API Routes - Order matters!
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/referral', referralRoutes);

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