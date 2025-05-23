import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { sendEmail, sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import crypto from 'crypto';
import mongoose, { Types, Schema } from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';
import { Business } from '../models/business.model';
import { validateEmail } from '../utils/validators';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
const generateToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

export const authController = {
  // Register new user (generic)
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;

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
        role: 'user'
      });

      // Save user
      const savedUser = await user.save();

      // Generate JWT token
      const token = generateToken(savedUser._id as Types.ObjectId);

      res.status(201).json({
        token,
        user: { ...savedUser.toObject(), password: undefined }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Register new business
  registerBusiness: async (req: Request, res: Response): Promise<void> => {
    try {
      // Debug log the entire request body
      console.log('Full request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));

      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        businessName, 
        businessType, 
        location 
      } = req.body;

      // Debug log each field
      console.log('Parsed fields:', {
        email: typeof email,
        password: typeof password,
        firstName: typeof firstName,
        lastName: typeof lastName,
        businessName: typeof businessName,
        businessType: typeof businessType,
        location: typeof location,
        locationDetails: location ? {
          address: typeof location.address,
          city: typeof location.city,
          postcode: typeof location.postcode
        } : null
      });

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !businessName || !businessType || !location) {
        console.log('Missing fields:', { 
          email: !!email, 
          password: !!password,
          firstName: !!firstName, 
          lastName: !!lastName,
          businessName: !!businessName,
          businessType: !!businessType,
          location: !!location
        });
        res.status(400).json({ 
          message: 'All fields are required: email, password, firstName, lastName, businessName, businessType, location' 
        });
        return;
      }

      // Validate location structure
      if (!location.address || !location.city || !location.postcode) {
        console.log('Invalid location structure:', location);
        res.status(400).json({ 
          message: 'Location must include address, city, and postcode' 
        });
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
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

      // Create new business user with explicit role
      console.log('Creating new business user...');
      const user = new User({
        email,
        password, // Don't hash here, let the pre-save hook handle it
        firstName,
        lastName,
        role: 'business', // Explicitly set role as business
        businessName,
        businessType,
        location: {
          address: location.address,
          city: location.city,
          postcode: location.postcode
        }
      });

      // Save the user
      const savedUser = await user.save();
      console.log('Business user saved:', savedUser);

      // Create business profile
      const business = new Business({
        userId: savedUser._id as Types.ObjectId,
        email: email,
        businessName,
        businessType,
        location,
        status: 'pending'
      });

      // Save the business profile
      const savedBusiness = await business.save();
      console.log('Business profile saved:', savedBusiness);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Schema.Types.Date(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
      savedUser.resetToken = verificationToken;
      savedUser.resetTokenExpires = expiresAt;
      await savedUser.save();
      console.log('Verification token generated:', verificationToken);

      // Send verification email
      try {
        console.log('Attempting to send verification email to:', email);
        await sendVerificationEmail(email, verificationToken, new Date(expiresAt).toISOString());
        console.log('Verification email sent successfully');
      } catch (error) {
        console.error('Error sending verification email:', error);
        // Don't fail the registration if email fails
      }

      // Generate JWT token
      const token = generateToken(savedUser._id as Types.ObjectId);

      res.status(201).json({
        message: 'Business registered successfully',
        token,
        user: { ...savedUser.toObject(), password: undefined },
        business: {
          businessName,
          businessType,
          location,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Business registration error:', error);
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
      const user = new User({
        email,
        password, // Let the pre-save hook handle hashing
        firstName,
        lastName,
        role: 'customer', // Explicitly set role as customer
        isVerified: false // Explicitly set as unverified
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Schema.Types.Date(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
      user.resetToken = verificationToken;
      user.resetTokenExpires = expiresAt;

      // Save the user
      const savedUser = await user.save();
      console.log('Customer user saved:', savedUser);

      // Send verification email
      try {
        console.log('Attempting to send verification email to:', email);
        await sendVerificationEmail(email, verificationToken, new Date(expiresAt).toISOString());
        console.log('Verification email sent successfully');
      } catch (error) {
        console.error('Error sending verification email:', error);
        // Don't fail the registration if email fails
      }

      // Generate JWT token
      const token = generateToken(savedUser._id as Types.ObjectId);

      res.status(201).json({
        message: 'Customer registered successfully. Please check your email to verify your account.',
        token,
        user: { ...savedUser.toObject(), password: undefined },
        needsVerification: true
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
      console.log('Login attempt for email:', email);

      // Validate email format
      if (!validateEmail(email)) {
        console.log('Invalid email format:', email);
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Find user by email
      const user = await User.findOne({ email });
      console.log('User found:', user ? 'yes' : 'no');
      if (!user) {
        console.log('No user found with email:', email);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check if user is verified
      console.log('User verification status:', user.isVerified);
      if (!user.isVerified) {
        console.log('User not verified:', email);
        res.status(401).json({ 
          message: 'Please verify your email before logging in',
          needsVerification: true,
          email: user.email
        });
        return;
      }

      // Check password using the model's comparePassword method
      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = generateToken(user._id as Types.ObjectId);
      console.log('Login successful for user:', email);

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

  forgotPassword: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      console.log('Forgot password request for email:', email);

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log('No user found with email:', email);
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Schema.Types.Date(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
      user.resetToken = resetToken;
      user.resetTokenExpires = expiresAt;
      await user.save();

      // Send reset email
      try {
        await sendPasswordResetEmail(email, resetToken, new Date(expiresAt).toISOString());
        console.log('Password reset email sent to:', email);
        res.json({ message: 'Password reset instructions sent to your email' });
      } catch (error) {
        console.error('Error sending reset email:', error);
        res.status(500).json({ message: 'Error sending reset email' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;
      console.log('Password reset attempt with token');

      // Find user with valid reset token
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: new Date() }
      });

      if (!user) {
        console.log('Invalid or expired reset token');
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
      }

      // Update password (will be hashed by pre-save hook)
      user.password = password;
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();

      console.log('Password reset successful for user:', user.email);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  },

  // Verify email
  verifyEmail: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Verifying email with token:', req.params.token);
      const user = await User.findOne({ 
        verificationToken: req.params.token,
        verificationTokenExpires: { $gt: new Date() }
      });
      console.log('Found user:', user ? 'yes' : 'no');

      if (!user) {
        console.log('No user found with token:', req.params.token);
        res.status(400).json({ message: 'Invalid or expired verification token' });
        return;
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      console.log('User verified successfully:', user.email);

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Error verifying email' });
    }
  },

  // Resend verification email
  resendVerificationEmail: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (user.isVerified) {
        res.status(400).json({ message: 'Email is already verified' });
        return;
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Schema.Types.Date(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = expiresAt;
      await user.save();

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken, expiresAt.toString());

      res.json({ message: 'Verification email sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Error sending verification email' });
    }
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
  },

  // Login business user
  loginBusiness: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log('Business login attempt for email:', email);

      // Validate email format
      if (!validateEmail(email)) {
        console.log('Invalid email format:', email);
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Find user by email
      const user = await User.findOne({ email, role: 'business' });
      console.log('Business user found:', user ? 'yes' : 'no');
      if (!user) {
        console.log('No business user found with email:', email);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check if user is verified
      console.log('User verification status:', user.isVerified);
      if (!user.isVerified) {
        console.log('User not verified:', email);
        res.status(401).json({ 
          message: 'Please verify your email before logging in',
          needsVerification: true,
          email: user.email
        });
        return;
      }

      // Check password using the model's comparePassword method
      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = generateToken(user._id as Types.ObjectId);
      console.log('Business login successful for user:', email);

      res.json({
        token,
        user: { ...user.toObject(), password: undefined }
      });
    } catch (error) {
      console.error('Business login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Login customer user
  loginCustomer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log('Customer login attempt for email:', email);

      // Validate email format
      if (!validateEmail(email)) {
        console.log('Invalid email format:', email);
        res.status(400).json({ message: 'Invalid email format' });
        return;
      }

      // Find user by email
      const user = await User.findOne({ email, role: 'customer' });
      console.log('Customer user found:', user ? 'yes' : 'no');
      if (!user) {
        console.log('No customer user found with email:', email);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check if user is verified
      console.log('User verification status:', user.isVerified);
      if (!user.isVerified) {
        console.log('User not verified:', email);
        res.status(401).json({ 
          message: 'Please verify your email before logging in',
          needsVerification: true,
          email: user.email
        });
        return;
      }

      // Check password using the model's comparePassword method
      const isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = generateToken(user._id as Types.ObjectId);
      console.log('Customer login successful for user:', email);

      res.json({
        token,
        user: { ...user.toObject(), password: undefined }
      });
    } catch (error) {
      console.error('Customer login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete user by email
  deleteUserByEmail: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      console.log('Attempting to delete user with email:', email);

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log('No user found with email:', email);
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Don't allow deleting admin users
      if (user.role === 'admin') {
        console.log('Attempted to delete admin user:', email);
        res.status(403).json({ message: 'Cannot delete admin users' });
        return;
      }

      // Delete the user
      await user.deleteOne();
      console.log('User deleted successfully:', email);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  }
};