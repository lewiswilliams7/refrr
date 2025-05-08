import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';
import { Business } from '../models/business.model';
import { validateEmail } from '../utils/validators';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
const generateToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const authController = {
  // Register new user
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, businessName, businessType } = req.body;

      // Validate email format
      if (!validateEmail(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Create new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'business'
      });

      // Save user
      const savedUser = await user.save();

      // Create business profile
      const business = new Business({
        userId: savedUser._id as Types.ObjectId,
        businessName,
        businessType,
        status: 'pending'
      });

      await business.save();

      // Generate JWT token
      const token = generateToken(savedUser._id as Types.ObjectId);

      res.status(201).json({
        token,
        user: { ...savedUser.toObject(), password: undefined },
        business: {
          businessName,
          businessType,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Register new customer
  registerCustomer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName
      } = req.body;

      // Debug log
      console.log('Customer registration attempt:', { 
        email, 
        firstName, 
        lastName
      });

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        console.log('Missing fields:', { 
          email: !!email, 
          password: !!password,
          firstName: !!firstName, 
          lastName: !!lastName
        });
        res.status(400).json({ 
          message: 'All fields are required: email, password, firstName, lastName' 
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Validate password length
      if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long' });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Create new customer user with explicit role
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'customer' // Explicitly set role as customer
      });

      // Save the user
      const savedUser = await user.save();
      console.log('Customer user saved:', savedUser);

      // Generate JWT token
      const token = generateToken(savedUser._id as Types.ObjectId);

      res.status(201).json({
        message: 'Customer registered successfully',
        token,
        user: { ...savedUser.toObject(), password: undefined },
      });
    } catch (error: unknown) {
      console.error('Customer registration error:', error);
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      res.status(500).json({ 
        message: 'Error creating customer', 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Login user
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate email format
      if (!validateEmail(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = generateToken(user._id as Types.ObjectId);

      res.json({
        token,
        user: { ...user.toObject(), password: undefined }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get current user
  getCurrentUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // If user is a business, get business details
      let businessDetails = null;
      if (user.role === 'business') {
        businessDetails = await Business.findOne({ userId: user._id });
      }

      res.json({
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        business: businessDetails
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  },

  forgotPassword: async (req: AuthRequest, res: Response): Promise<void> => {
    // ... existing code ...
  },

  resetPassword: async (req: AuthRequest, res: Response): Promise<void> => {
    // ... existing code ...
  },

  verifyEmail: async (req: AuthRequest, res: Response): Promise<void> => {
    // ... existing code ...
  },

  resendVerificationEmail: async (req: AuthRequest, res: Response): Promise<void> => {
    // ... existing code ...
  },

  // Initialize admin account on startup
  initializeAdmin: async () => {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
      const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

      if (!adminEmail || !adminPassword) {
        console.log('Admin credentials not provided in environment variables. Skipping admin initialization.');
        return;
      }

      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (existingAdmin) {
        console.log('Admin account already exists.');
        return;
      }

      // Create admin user
      const admin = new User({
        email: adminEmail,
        password: adminPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'admin'
      });

      await admin.save();
      console.log('Admin account created successfully');
    } catch (error: unknown) {
      console.error('Error initializing admin account:', error);
    }
  },

  // Register new business
  registerBusiness: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, businessName, businessType, industry } = req.body;

      // Validate email format
      if (!validateEmail(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Create new user with business role
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'business'
      });

      // Save user
      const savedUser = await user.save();

      // Create business profile
      const business = new Business({
        userId: savedUser._id as Types.ObjectId,
        businessName,
        businessType,
        industry
      });

      // Save business
      await business.save();

      // Generate JWT token
      const token = generateToken(savedUser._id as Types.ObjectId);

      res.status(201).json({
        token,
        user: { ...savedUser.toObject(), password: undefined },
        business: {
          businessName,
          businessType,
          industry
        }
      });
    } catch (error) {
      console.error('Business registration error:', error);
      res.status(500).json({ message: 'Error registering business' });
    }
  },

  // Update user profile
  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const { firstName, lastName, email } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) {
        // Validate new email format
        if (!validateEmail(email)) {
          res.status(400).json({ message: 'Invalid email format' });
          return;
        }
        user.email = email;
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: { ...user.toObject(), password: undefined }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  },

  logout: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};