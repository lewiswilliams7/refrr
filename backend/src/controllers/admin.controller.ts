import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Business, IBusiness } from '../models/business.model';
import { Campaign } from '../models/campaign.model';
import { Referral } from '../models/referral.model';
import mongoose, { Types } from 'mongoose';

interface IUser {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'business' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

interface IReferral {
  _id: Types.ObjectId;
  campaignId: Types.ObjectId;
  businessId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface PopulatedBusiness extends IBusiness {
  _id: Types.ObjectId;
  businessName: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export const adminController = {
  // Get all users
  getAllUsers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const admin = await User.findById(req.user.userId);
      if (!admin || admin.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  },

  // Get user by ID
  getUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const admin = await User.findById(req.user.userId);
      if (!admin || admin.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  },

  // Update user status
  updateUserStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be active, inactive, or suspended' 
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.status = status;
      await user.save();

      res.json({
        message: 'User status updated successfully',
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status
        }
      });
    } catch (error) {
      console.error('User status update error:', error);
      res.status(500).json({ message: 'Error updating user status', error });
    }
  },

  // Get all businesses
  getAllBusinesses: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const businesses = await Business.find()
        .populate<{ businessName: string; businessType: string }>('businessName businessType')
        .lean();
      res.json(businesses);
    } catch (error) {
      console.error('Get all businesses error:', error);
      res.status(500).json({ message: 'Error fetching businesses' });
    }
  },

  // Get business by ID
  getBusiness: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const business = await Business.findById(req.params.id)
        .populate<{ businessName: string; businessType: string }>('businessName businessType')
        .lean();

      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      res.json(business);
    } catch (error) {
      console.error('Get business error:', error);
      res.status(500).json({ message: 'Error fetching business' });
    }
  },

  // Update business status
  updateBusinessStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body;
      const business = await Business.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      res.json(business);
    } catch (error) {
      console.error('Update business status error:', error);
      res.status(500).json({ message: 'Error updating business status' });
    }
  },

  // Get all campaigns
  getCampaigns: async (req: AuthRequest, res: Response) => {
    try {
      const campaigns = await Campaign.find()
        .populate<{ businessId: PopulatedBusiness }>('businessId', 'businessName businessType')
        .sort({ createdAt: -1 });
      
      res.json(campaigns);
    } catch (error) {
      console.error('Campaigns fetch error:', error);
      res.status(500).json({ message: 'Error fetching campaigns', error });
    }
  },

  // Get single campaign
  getCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findById(req.params.id)
        .populate<{ businessId: PopulatedBusiness }>('businessId', 'businessName businessType');
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('Campaign fetch error:', error);
      res.status(500).json({ message: 'Error fetching campaign', error });
    }
  },

  // Update campaign status
  updateCampaignStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      if (!['active', 'inactive', 'completed'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be active, inactive, or completed' 
        });
      }

      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      campaign.status = status;
      await campaign.save();

      res.json({
        message: 'Campaign status updated successfully',
        campaign: {
          _id: campaign._id,
          title: campaign.title,
          status: campaign.status
        }
      });
    } catch (error) {
      console.error('Campaign status update error:', error);
      res.status(500).json({ message: 'Error updating campaign status', error });
    }
  },

  // Get all referrals
  getReferrals: async (req: AuthRequest, res: Response) => {
    try {
      const referrals = await Referral.find()
        .populate('campaignId', 'title rewardType rewardValue')
        .populate('businessId', 'businessName')
        .sort({ createdAt: -1 });
      
      res.json(referrals);
    } catch (error) {
      console.error('Referrals fetch error:', error);
      res.status(500).json({ message: 'Error fetching referrals', error });
    }
  },

  // Get single referral
  getReferral: async (req: AuthRequest, res: Response) => {
    try {
      const referral = await Referral.findById(req.params.id)
        .populate('campaignId', 'title rewardType rewardValue')
        .populate('businessId', 'businessName');
      
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      res.json(referral);
    } catch (error) {
      console.error('Referral fetch error:', error);
      res.status(500).json({ message: 'Error fetching referral', error });
    }
  },

  // Get admin dashboard statistics
  getDashboardStats: async (req: AuthRequest, res: Response) => {
    try {
      const [
        totalUsers,
        activeUsers,
        totalBusinesses,
        activeBusinesses,
        totalCampaigns,
        activeCampaigns,
        totalReferrals,
        completedReferrals
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'active' }),
        Business.countDocuments(),
        Business.countDocuments({ status: 'active' }),
        Campaign.countDocuments(),
        Campaign.countDocuments({ status: 'active' }),
        Referral.countDocuments(),
        Referral.countDocuments({ status: 'completed' })
      ]);

      res.json({
        users: {
          total: totalUsers,
          active: activeUsers
        },
        businesses: {
          total: totalBusinesses,
          active: activeBusinesses
        },
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns
        },
        referrals: {
          total: totalReferrals,
          completed: completedReferrals
        }
      });
    } catch (error) {
      console.error('Dashboard stats fetch error:', error);
      res.status(500).json({ message: 'Error fetching dashboard statistics', error });
    }
  },

  // Delete user
  deleteUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const admin = await User.findById(req.user.userId);
      if (!admin || admin.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }

      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Don't allow deleting admin users
      if (user.role === 'admin') {
        res.status(403).json({ message: 'Cannot delete admin users' });
        return;
      }

      await user.deleteOne();

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  },

  // Delete business
  deleteBusiness: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const business = await Business.findByIdAndDelete(req.params.id);

      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      res.json({ message: 'Business deleted successfully' });
    } catch (error) {
      console.error('Delete business error:', error);
      res.status(500).json({ message: 'Error deleting business' });
    }
  }
}; 