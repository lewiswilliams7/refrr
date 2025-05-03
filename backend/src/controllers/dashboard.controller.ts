import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Business from '../models/business';
import { Campaign } from '../models/campaign';
import { Referral } from '../models/referrals';
import mongoose from 'mongoose';

interface IBusinessAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReferrals: number;
  completedReferrals: number;
  totalRewards: number;
  recentReferrals: Array<{
    id: mongoose.Types.ObjectId;
    customerName: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: Date;
    completedAt?: Date;
  }>;
}

interface ICampaignAnalytics {
  totalReferrals: number;
  completedReferrals: number;
  totalRewards: number;
  recentReferrals: Array<{
    id: mongoose.Types.ObjectId;
    customerName: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: Date;
    completedAt?: Date;
  }>;
}

export const dashboardController = {
  // Get business dashboard analytics
  getBusinessAnalytics: async (req: AuthRequest, res: Response) => {
    try {
      const businessId = req.params.businessId;

      const business = await Business.findOne({
        _id: businessId,
        userId: req.user?._id
      });

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const campaigns = await Campaign.find({ businessId });
      const referrals = await Referral.find({ businessId })
        .sort({ createdAt: -1 })
        .limit(10);

      const totalRewards = referrals
        .filter(r => r.status === 'completed')
        .reduce((total, referral) => {
          const campaign = campaigns.find(c => c._id.equals(referral.campaignId));
          if (campaign) {
            if (campaign.rewardType === 'percentage') {
              return total + (campaign.rewardValue / 100);
            }
            return total + campaign.rewardValue;
          }
          return total;
        }, 0);

      const analytics: IBusinessAnalytics = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalReferrals: referrals.length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length,
        totalRewards,
        recentReferrals: referrals.map(referral => ({
          id: referral._id,
          customerName: referral.customerName,
          status: referral.status,
          createdAt: referral.createdAt,
          completedAt: referral.completedAt
        }))
      };

      res.json(analytics);
    } catch (error) {
      console.error('Business analytics fetch error:', error);
      res.status(500).json({ message: 'Error fetching business analytics', error });
    }
  },

  // Get campaign dashboard analytics
  getCampaignAnalytics: async (req: AuthRequest, res: Response) => {
    try {
      const campaignId = req.params.campaignId;

      const campaign = await Campaign.findOne({
        _id: campaignId,
        businessId: { $in: await Business.find({ userId: req.user?._id }).distinct('_id') }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const referrals = await Referral.find({ campaignId })
        .sort({ createdAt: -1 })
        .limit(10);

      const totalRewards = referrals
        .filter(r => r.status === 'completed')
        .reduce((total, referral) => {
          if (campaign.rewardType === 'percentage') {
            return total + (campaign.rewardValue / 100);
          }
          return total + campaign.rewardValue;
        }, 0);

      const analytics: ICampaignAnalytics = {
        totalReferrals: referrals.length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length,
        totalRewards,
        recentReferrals: referrals.map(referral => ({
          id: referral._id,
          customerName: referral.customerName,
          status: referral.status,
          createdAt: referral.createdAt,
          completedAt: referral.completedAt
        }))
      };

      res.json(analytics);
    } catch (error) {
      console.error('Campaign analytics fetch error:', error);
      res.status(500).json({ message: 'Error fetching campaign analytics', error });
    }
  },

  // Get user dashboard overview
  getUserOverview: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;

      const businesses = await Business.find({ userId });
      const businessIds = businesses.map((b: { _id: mongoose.Types.ObjectId }) => b._id);

      const campaigns = await Campaign.find({ businessId: { $in: businessIds } });
      const referrals = await Referral.find({ businessId: { $in: businessIds } })
        .sort({ createdAt: -1 })
        .limit(10);

      const totalRewards = referrals
        .filter(r => r.status === 'completed')
        .reduce((total, referral) => {
          const campaign = campaigns.find(c => c._id.equals(referral.campaignId));
          if (campaign) {
            if (campaign.rewardType === 'percentage') {
              return total + (campaign.rewardValue / 100);
            }
            return total + campaign.rewardValue;
          }
          return total;
        }, 0);

      res.json({
        businesses: {
          total: businesses.length,
          active: businesses.filter((b: { status: string }) => b.status === 'active').length
        },
        campaigns: {
          total: campaigns.length,
          active: campaigns.filter(c => c.status === 'active').length
        },
        referrals: {
          total: referrals.length,
          completed: referrals.filter(r => r.status === 'completed').length,
          totalRewards
        },
        recentReferrals: referrals.map(referral => ({
          id: referral._id,
          customerName: referral.customerName,
          status: referral.status,
          createdAt: referral.createdAt,
          completedAt: referral.completedAt
        }))
      });
    } catch (error) {
      console.error('User overview fetch error:', error);
      res.status(500).json({ message: 'Error fetching user overview', error });
    }
  }
};
