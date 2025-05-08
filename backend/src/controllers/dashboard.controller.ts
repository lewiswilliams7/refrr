import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Campaign } from '../models/campaign.model';
import Referral from '../models/referrals';
import { Business } from '../models/business.model';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/asyncHandler';

interface ICampaign {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  rewardType: string;
  rewardValue: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export const dashboardController = {
  getStats: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const businessId = business._id;

      // Get active campaigns count
      const activeCampaigns = await Campaign.countDocuments({
        businessId,
        status: 'active'
      });

      // Get total referrals count
      const totalReferrals = await Referral.countDocuments({
        businessId
      });

      // Get pending approvals count
      const pendingApprovals = await Referral.countDocuments({
        businessId,
        status: 'pending'
      });

      // Get referral statistics
      const referralStats = {
        total: totalReferrals,
        approved: await Referral.countDocuments({ businessId, status: 'approved' }),
        pending: pendingApprovals,
        rejected: await Referral.countDocuments({ businessId, status: 'rejected' })
      };

      // Get campaign statistics
      const campaignStats = {
        total: await Campaign.countDocuments({ businessId }),
        active: activeCampaigns,
        completed: await Campaign.countDocuments({ businessId, status: 'completed' })
      };

      // Get monthly referrals data
      const monthlyReferrals = await Referral.aggregate([
        {
          $match: { businessId }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        },
        {
          $project: {
            month: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]);

      // Get status distribution
      const statusDistribution = await Referral.aggregate([
        {
          $match: { businessId }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]);

      // Get recent activity (last 5 referrals)
      const recentActivity = await Referral.find({ businessId })
        .populate('campaignId', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        activeCampaigns,
        totalReferrals,
        pendingApprovals,
        recentActivity,
        referralStats,
        campaignStats,
        monthlyReferrals,
        statusDistribution
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
  },

  getBusinessDashboard: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      // Get active campaigns count
      const activeCampaigns = await Campaign.countDocuments({
        businessId: business._id,
        status: 'active'
      });

      // Get total referrals count
      const totalReferrals = await Referral.countDocuments({
        businessId: business._id
      });

      // Get successful referrals count
      const successfulReferrals = await Referral.countDocuments({
        businessId: business._id,
        status: 'approved'
      });

      // Calculate conversion rate
      const conversionRate = totalReferrals > 0
        ? (successfulReferrals / totalReferrals) * 100
        : 0;

      // Get recent activity
      const recentActivity = await Referral.find({ businessId: business._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('campaignId', 'title');

      // Get campaign performance
      const campaigns = await Campaign.find({ businessId: business._id })
        .sort({ createdAt: -1 })
        .limit(5);

      const campaignPerformance = await Promise.all(
        campaigns.map(async (campaign) => {
          const campaignReferrals = await Referral.countDocuments({
            campaignId: campaign._id
          });

          const campaignSuccessful = await Referral.countDocuments({
            campaignId: campaign._id,
            status: 'approved'
          });

          return {
            campaignId: campaign._id,
            title: campaign.title,
            totalReferrals: campaignReferrals,
            successfulReferrals: campaignSuccessful,
            conversionRate: campaignReferrals > 0
              ? (campaignSuccessful / campaignReferrals) * 100
              : 0
          };
        })
      );

      res.json({
        overview: {
          activeCampaigns,
          totalReferrals,
          successfulReferrals,
          conversionRate
        },
        recentActivity,
        campaignPerformance
      });
    } catch (error) {
      console.error('Error getting business dashboard:', error);
      res.status(500).json({ message: 'Error getting dashboard data' });
    }
  },

  getBusinessProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      const business = await User.findById(req.user.userId).select('-password');
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      res.json(business);
    } catch (error) {
      console.error('Error getting business profile:', error);
      res.status(500).json({ message: 'Error getting profile' });
    }
  }
};
