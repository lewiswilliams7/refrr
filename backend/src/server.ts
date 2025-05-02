import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaign';
import referralRoutes from './routes/referral';
import dashboardRoutes from './routes/dashboard';
import businessRoutes from './routes/business';
import customerRoutes from './routes/customer';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';
import { corsOptions, limiter, helmetConfig } from './config/security';

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
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
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