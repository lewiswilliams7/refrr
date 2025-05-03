import { Request, Response } from 'express';
import { User, UserDocument } from '../models/user.model';
import Business, { IBusiness } from '../models/business';
import { generateToken } from '../utils/jwt';
import { validateEmail } from '../utils/validators';
import { hashPassword, comparePasswords } from '../utils/password';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: UserDocument;
}

interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export const authController = {
  // Register new user
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: 'Required fields missing: email, password, firstName, lastName' 
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email already registered' 
        });
      }

      const hashedPassword = await hashPassword(password);

      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user',
        status: 'active'
      });

      await user.save();

      const token = generateToken(user._id, user.role);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Error registering user',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Login user
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Required fields missing: email, password' 
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Invalid credentials' 
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ 
          message: 'Account is not active' 
        });
      }

      const token = generateToken(user._id, user.role);

      // Get user's businesses
      const businesses = await Business.find({ userId: user._id });

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        businesses: businesses.map(business => ({
          id: business._id,
          name: business.businessName,
          type: business.businessType
        })),
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Error logging in',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Get user profile
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ 
          message: 'Not authenticated' 
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Get user's businesses
      const businesses = await Business.find({ userId });

      res.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status
        },
        businesses: businesses.map((business) => ({
          id: business._id,
          name: business.businessName,
          type: business.businessType,
          status: business.status
        }))
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ 
        message: 'Error fetching profile',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Update user profile
  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ 
          message: 'Not authenticated' 
        });
      }

      const { firstName, lastName, currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      if (currentPassword && newPassword) {
        const isPasswordValid = await comparePasswords(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ 
            message: 'Current password is incorrect' 
          });
        }

        user.password = await hashPassword(newPassword);
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ 
        message: 'Error updating profile',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Request password reset
  requestPasswordReset: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          message: 'Email is required' 
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Generate reset token and save to user
      const resetToken = generateToken(user._id, user.role, '1h');
      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // TODO: Send password reset email

      res.json({ 
        message: 'Password reset email sent' 
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ 
        message: 'Error requesting password reset',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Reset password
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ 
          message: 'Token and new password are required' 
        });
      }

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired token' 
        });
      }

      user.password = await hashPassword(newPassword);
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();

      res.json({ 
        message: 'Password reset successfully' 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ 
        message: 'Error resetting password',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Register new customer
  registerCustomer: async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: 'Required fields missing: email, password, firstName, lastName' 
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email already registered' 
        });
      }

      const hashedPassword = await hashPassword(password);

      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user',
        status: 'active'
      });

      await user.save();

      const token = generateToken(user._id, user.role);

      res.status(201).json({
        message: 'Customer registered successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Customer registration error:', error);
      res.status(500).json({ 
        message: 'Error registering customer',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Request password reset
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          message: 'Email is required' 
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // Generate reset token and save to user
      const resetToken = generateToken(user._id, user.role, '1h');
      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // TODO: Send password reset email

      res.json({ 
        message: 'Password reset email sent' 
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ 
        message: 'Error requesting password reset',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Change password
  changePassword: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ 
          message: 'Not authenticated' 
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: 'Current password and new password are required' 
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Current password is incorrect' 
        });
      }

      user.password = await hashPassword(newPassword);
      await user.save();

      res.json({ 
        message: 'Password changed successfully' 
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ 
        message: 'Error changing password',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
};