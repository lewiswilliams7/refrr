import express from 'express';
import cors from 'cors';
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Setup security
setupSecurity(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/refrr')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/referrals', referralRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 