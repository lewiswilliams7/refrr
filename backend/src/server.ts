import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaign';
import referralRoutes from './routes/referral';
import dashboardRoutes from './routes/dashboard';
import businessRoutes from './routes/business';
import customerRoutes from './routes/customer';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';
import { corsOptions, helmetConfig } from './config/security';

// Load environment variables
dotenv.config();

// Check if we have a MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

export const app = express();

// Middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}) as unknown as express.RequestHandler;

// Create API router with rate limiting
const apiRouter = express.Router();
apiRouter.use(apiLimiter);

// Apply routes to API router
apiRouter.use('/auth', authRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/referrals', referralRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/businesses', businessRoutes);
apiRouter.use('/customer', customerRoutes);
apiRouter.use('/admin', adminRoutes);

// Mount API router and health routes
app.use('/api', apiRouter);
app.use('/api', healthRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;