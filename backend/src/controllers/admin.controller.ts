import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import Business from '../models/business';
import Campaign, { ICampaign } from '../models/campaign.model';
import { Referral } from '../models/referrals';
import mongoose from 'mongoose';

interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

interface IBusiness {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

interface ICampaign {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  title: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface IReferral {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const adminController = {
  // Get all users
  getUsers: async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.json(users);
    } catch (error) {
      console.error('Users fetch error:', error);
      res.status(500).json({ message: 'Error fetching users', error });
    }
  },

  // Get single user
  getUser: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('User fetch error:', error);
      res.status(500).json({ message: 'Error fetching user', error });
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
          id: user._id,
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
  getBusinesses: async (req: AuthRequest, res: Response) => {
    try {
      const businesses = await Business.find()
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 });
      
      res.json(businesses);
    } catch (error) {
      console.error('Businesses fetch error:', error);
      res.status(500).json({ message: 'Error fetching businesses', error });
    }
  },

  // Get single business
  getBusiness: async (req: AuthRequest, res: Response) => {
    try {
      const business = await Business.findById(req.params.id)
        .populate('userId', 'email firstName lastName');
      
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      res.json(business);
    } catch (error) {
      console.error('Business fetch error:', error);
      res.status(500).json({ message: 'Error fetching business', error });
    }
  },

  // Update business status
  updateBusinessStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be active, inactive, or suspended' 
        });
      }

      const business = await Business.findById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      business.status = status;
      await business.save();

      res.json({
        message: 'Business status updated successfully',
        business: {
          id: business._id,
          name: business.businessName,
          type: business.businessType,
          status: business.status
        }
      });
    } catch (error) {
      console.error('Business status update error:', error);
      res.status(500).json({ message: 'Error updating business status', error });
    }
  },

  // Get all campaigns
  getCampaigns: async (req: AuthRequest, res: Response) => {
    try {
      const campaigns = await Campaign.find()
        .populate('businessId', 'businessName businessType')
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
        .populate('businessId', 'businessName businessType');
      
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
          id: campaign._id,
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
  }
}; 