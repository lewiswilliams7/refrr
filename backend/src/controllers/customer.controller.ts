import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Campaign } from '../models/campaign.model';
import { Referral } from '../models/referral.model';
import { Document, Types } from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';
import mongoose from 'mongoose';

interface CampaignReward {
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
}

interface IReferral {
  campaignId: Types.ObjectId | CampaignReward;
  status: string;
  referrerEmail: string;
}

interface ReferralDocument extends IReferral, Document {}

export const customerController = {
  getDashboard: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Get all referrals for this customer (as referrer)
      const referrals = await Referral.find({ referrerEmail: user.email })
        .populate('campaignId', 'title rewardType rewardValue')
        .populate('businessId', 'businessName')
        .sort({ createdAt: -1 })
        .limit(10);

      // Get available campaigns count
      const availableCampaigns = await Campaign.countDocuments({ status: 'active' });

      // Calculate stats
      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter(ref => ref.status === 'completed').length;
      const pendingReferrals = referrals.filter(ref => ref.status === 'pending').length;

      // Format recent referrals
      const recentReferrals = referrals.map(referral => ({
        _id: referral._id,
        campaignId: {
          title: referral.campaignId.title,
          rewardType: referral.campaignId.rewardType,
          rewardValue: referral.campaignId.rewardValue,
          businessName: referral.businessId?.businessName || 'Unknown Business'
        },
        status: referral.status,
        createdAt: referral.createdAt
      }));

      const dashboardStats = {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        availableCampaigns,
        recentReferrals
      };

      res.json(dashboardStats);
    } catch (error) {
      console.error('Error getting customer dashboard:', error);
      res.status(500).json({ message: 'Error getting dashboard stats' });
    }
  },

  getAnalytics: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const userId = req.user.userId;

      // Get all referrals for this customer
      const referrals = await Referral.find({
        $or: [
          { referrerEmail: userId },
          { referredEmail: userId }
        ]
      }).populate('campaignId');

      // Calculate analytics
      const analytics = {
        totalReferrals: referrals.length,
        successfulReferrals: referrals.filter(ref => ref.status === 'approved').length,
        pendingReferrals: referrals.filter(ref => ref.status === 'pending').length,
        totalRewards: 0,
        recentActivity: referrals.slice(0, 5)
      };

      // Calculate total rewards
      referrals.forEach(referral => {
        if (referral.status === 'approved') {
          const campaign = referral.campaignId as unknown as { rewardValue: number };
          if (campaign && campaign.rewardValue) {
            analytics.totalRewards += campaign.rewardValue;
          }
        }
      });

      res.json(analytics);
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      res.status(500).json({ message: 'Error getting analytics' });
    }
  },

  getProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const customer = await User.findById(req.user.userId).select('-password');
      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
        return;
      }

      res.json(customer);
    } catch (error) {
      console.error('Error getting customer profile:', error);
      res.status(500).json({ message: 'Error getting profile' });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const { firstName, lastName, email } = req.body;

      const customer = await User.findByIdAndUpdate(
        req.user.userId,
        { firstName, lastName, email },
        { new: true }
      ).select('-password');

      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
        return;
      }

      res.json(customer);
    } catch (error) {
      console.error('Error updating customer profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
}; 