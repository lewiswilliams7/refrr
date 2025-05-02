import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Campaign } from '../models/campaign';
import Referral from '../models/referrals';
import { Document, Types } from 'mongoose';

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
  getAnalytics: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      const userEmail = req.user?.email;

      if (!userId || !userEmail) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Get total referrals count
      const totalReferrals = await Referral.countDocuments({
        referrerEmail: userEmail
      });

      // Get successful referrals count
      const successfulReferrals = await Referral.countDocuments({
        referrerEmail: userEmail,
        status: 'approved'
      });

      // Get pending referrals count
      const pendingReferrals = await Referral.countDocuments({
        referrerEmail: userEmail,
        status: 'pending'
      });

      // Get total rewards earned
      const completedReferrals = await Referral.find({
        referrerEmail: userEmail,
        status: 'approved'
      }).populate<{ campaignId: CampaignReward }>('campaignId', 'rewardType rewardValue');

      const totalRewards = completedReferrals.reduce((total: number, referral: ReferralDocument) => {
        const campaign = referral.campaignId as CampaignReward;
        if (campaign.rewardType === 'percentage') {
          return total + campaign.rewardValue;
        } else {
          return total + campaign.rewardValue;
        }
      }, 0);

      // Get recent activity (last 5 referrals)
      const recentActivity = await Referral.find({ referrerEmail: userEmail })
        .populate('campaignId', 'title businessName rewardType rewardValue')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        totalRewards,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      res.status(500).json({ message: 'Error fetching customer analytics' });
    }
  },

  getCustomerProfile: async (req: AuthRequest, res: Response) => {
    try {
      const customer = await User.findById(req.user?._id).select('-password');
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      res.status(500).json({ message: 'Error fetching customer profile' });
    }
  }
}; 