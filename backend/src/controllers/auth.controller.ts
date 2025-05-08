import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/user.model';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';

export const authController = {
  // Register new user
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, businessName, businessType, location } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !businessName || !businessType || !location) {
        res.status(400).json({ message: 'Required fields missing' });
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

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        businessName,
        businessType,
        location
      });

      // Generate token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || 'test-secret'
      );

      res.status(201).json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          businessType: user.businessType
        }
      });
    } catch (error: unknown) {
      console.error('Error in register:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
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
        { _id: savedUser._id.toString(), email: savedUser.email, role: savedUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Customer registered successfully',
        token,
        user: {
          _id: savedUser._id,
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
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
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

      // Generate token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || 'test-secret'
      );

      res.status(200).json({
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          businessType: user.businessType
        }
      });
    } catch (error: unknown) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  },

  // Get current user
  getCurrentUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        businessType: user.businessType
      });
    } catch (error: unknown) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Error getting current user' });
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