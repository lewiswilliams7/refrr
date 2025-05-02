import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';

export const authController = {
  // Register new user
  register: async (req: AuthRequest, res: Response) => {
    try {
      const { 
        email, 
        password, 
        businessName, 
        firstName, 
        lastName,
        businessType,
        location,
        businessDescription 
      } = req.body;

      // Debug log
      console.log('Registration attempt:', { 
        email, 
        businessName, 
        firstName, 
        lastName, 
        businessType,
        location 
      });

      // Validate required fields
      if (!email || !password || !businessName || !firstName || !lastName || !businessType) {
        console.log('Missing fields:', { 
          email: !!email, 
          password: !!password,
          businessName: !!businessName, 
          firstName: !!firstName, 
          lastName: !!lastName,
          businessType: !!businessType
        });
        return res.status(400).json({ 
          message: 'All fields are required: email, password, businessName, firstName, lastName, businessType' 
        });
      }

      // Validate location fields
      if (!location || !location.address || !location.city || !location.postcode) {
        return res.status(400).json({
          message: 'Location fields are required: address, city, postcode'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user with all fields
      const user = new User({
        email,
        password, // Will be hashed by the pre-save hook
        businessName,
        firstName,
        lastName,
        businessType,
        location,
        businessDescription,
        role: 'business' // Explicitly set role as business
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          businessName: user.businessName,
          firstName: user.firstName,
          lastName: user.lastName,
          businessType: user.businessType,
          location: user.location,
          businessDescription: user.businessDescription
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Error creating user', 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Register new customer
  registerCustomer: async (req: Request, res: Response) => {
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
        return res.status(400).json({ 
          message: 'All fields are required: email, password, firstName, lastName' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
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
        { userId: savedUser._id, email: savedUser.email },
        process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Customer registered successfully',
        token,
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role
        },
      });
    } catch (error) {
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
  login: async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl',
        { expiresIn: '7d' }
      );

      // Return user data based on role
      const userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || 'business' // Default to business if role not set
      };

      // Add business-specific fields if user is a business
      if (user.role === 'business') {
        Object.assign(userResponse, {
          businessName: user.businessName,
          businessType: user.businessType,
          location: user.location,
          businessDescription: user.businessDescription
        });
      }

      res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error });
    }
  },

  // Get current user
  getCurrentUser: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.user?.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  },

  forgotPassword: async (req: AuthRequest, res: Response) => {
    // ... existing code ...
  },

  resetPassword: async (req: AuthRequest, res: Response) => {
    // ... existing code ...
  },

  verifyEmail: async (req: AuthRequest, res: Response) => {
    // ... existing code ...
  },

  resendVerificationEmail: async (req: AuthRequest, res: Response) => {
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
    } catch (error) {
      console.error('Error initializing admin account:', error);
    }
  }
};