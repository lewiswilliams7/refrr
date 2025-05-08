import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';

// Generate JWT token
const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '24h' }
  );
};

export const authController = {
  // Register new user
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: role || 'customer'
      });

      // Save user
      const savedUser = await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: savedUser._id.toString(),
          email: savedUser.email,
          role: savedUser.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          _id: savedUser._id.toString(),
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user', error });
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
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'customer' // Explicitly set role as customer
      });

      // Save the user
      const savedUser = await user.save();
      console.log('Customer user saved:', savedUser);

      // Generate JWT token
      const token = jwt.sign(
        { userId: savedUser._id.toString(), email: savedUser.email, role: savedUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Customer registered successfully',
        token,
        user: {
          id: savedUser._id.toString(),
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role
        },
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
  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        businessDescription: user.businessDescription
      }
    });
  }),

  // Get current user
  getCurrentUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          _id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Error getting current user', error });
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
  }
};