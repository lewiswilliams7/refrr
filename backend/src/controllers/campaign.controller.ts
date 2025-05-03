import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign } from '../models/campaign';
import { Referral } from '../models/referrals';
import mongoose from 'mongoose';

interface ICampaign {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: Date;
  expirationDate?: Date;
  analytics: {
    totalReferrals: number;
    completedReferrals: number;
    totalRewards: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const campaignController = {
  // Create new campaign
  createCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, rewardType, rewardValue, rewardDescription, expirationDate } = req.body;

      if (!title || !description || !rewardType || !rewardValue || !rewardDescription) {
        return res.status(400).json({ 
          message: 'Required fields missing: title, description, rewardType, rewardValue, rewardDescription' 
        });
      }

      if (!['percentage', 'fixed'].includes(rewardType)) {
        return res.status(400).json({ 
          message: 'Invalid reward type. Must be percentage or fixed' 
        });
      }

      if (rewardType === 'percentage' && (rewardValue < 0 || rewardValue > 100)) {
        return res.status(400).json({ 
          message: 'Percentage reward must be between 0 and 100' 
        });
      }

      if (rewardType === 'fixed' && rewardValue <= 0) {
        return res.status(400).json({ 
          message: 'Fixed reward must be greater than 0' 
        });
      }

      const campaign = new Campaign({
        businessId: req.user?._id,
        title,
        description,
        rewardType,
        rewardValue,
        rewardDescription,
        status: 'active',
        startDate: new Date(),
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        analytics: {
          totalReferrals: 0,
          completedReferrals: 0,
          totalRewards: 0
        }
      });

      await campaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Campaign creation error:', error);
      res.status(500).json({ 
        message: 'Error creating campaign',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Get all campaigns for a business
  getCampaigns: async (req: AuthRequest, res: Response) => {
    try {
      const campaigns = await Campaign.find({ 
        businessId: req.user?._id 
      }).sort({ createdAt: -1 });
      
      res.json(campaigns);
    } catch (error) {
      console.error('Campaign fetch error:', error);
      res.status(500).json({ message: 'Error fetching campaigns', error });
    }
  },

  // Get single campaign
  getCampaignById: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: req.user?._id
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('Campaign fetch error:', error);
      res.status(500).json({ message: 'Error fetching campaign', error });
    }
  },

  // Update campaign
  updateCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, rewardType, rewardValue, rewardDescription, status, expirationDate } = req.body;

      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: req.user?._id
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (title) campaign.title = title;
      if (description) campaign.description = description;
      if (rewardType) {
        if (!['percentage', 'fixed'].includes(rewardType)) {
          return res.status(400).json({ 
            message: 'Invalid reward type. Must be percentage or fixed' 
          });
        }
        campaign.rewardType = rewardType;
      }
      if (rewardValue) {
        if (campaign.rewardType === 'percentage' && (rewardValue < 0 || rewardValue > 100)) {
          return res.status(400).json({ 
            message: 'Percentage reward must be between 0 and 100' 
          });
        }
        if (campaign.rewardType === 'fixed' && rewardValue <= 0) {
          return res.status(400).json({ 
            message: 'Fixed reward must be greater than 0' 
          });
        }
        campaign.rewardValue = rewardValue;
      }
      if (rewardDescription) campaign.rewardDescription = rewardDescription;
      if (status) {
        if (!['active', 'inactive', 'completed'].includes(status)) {
          return res.status(400).json({ 
            message: 'Invalid status. Must be active, inactive, or completed' 
          });
        }
        campaign.status = status;
      }
      if (expirationDate) campaign.expirationDate = new Date(expirationDate);

      await campaign.save();
      res.json(campaign);
    } catch (error) {
      console.error('Campaign update error:', error);
      res.status(500).json({ message: 'Error updating campaign', error });
    }
  },

  // Delete campaign
  deleteCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: req.user?._id
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Check if campaign has any referrals
      const hasReferrals = await Referral.exists({ campaignId: campaign._id });
      if (hasReferrals) {
        return res.status(400).json({ 
          message: 'Cannot delete campaign with existing referrals' 
        });
      }

      await campaign.deleteOne();
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Campaign deletion error:', error);
      res.status(500).json({ message: 'Error deleting campaign', error });
    }
  },

  // Get public campaigns
  getPublicCampaigns: async (req: Request, res: Response) => {
    try {
      const campaigns = await Campaign.find({ 
        status: 'active'
      }).sort({ createdAt: -1 });
      
      res.json(campaigns);
    } catch (error) {
      console.error('Public campaign fetch error:', error);
      res.status(500).json({ message: 'Error fetching public campaigns', error });
    }
  },

  // Get single public campaign
  getPublicCampaign: async (req: Request, res: Response) => {
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        status: 'active'
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('Public campaign fetch error:', error);
      res.status(500).json({ message: 'Error fetching public campaign', error });
    }
  },

  // Get campaign analytics
  getAnalytics: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: req.user?._id
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const referrals = await Referral.find({ campaignId: campaign._id });
      
      const analytics = {
        totalReferrals: referrals.length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length,
        totalRewards: referrals
          .filter(r => r.status === 'completed')
          .reduce((total, referral) => {
            if (campaign.rewardType === 'percentage') {
              return total + (campaign.rewardValue / 100);
            }
            return total + campaign.rewardValue;
          }, 0)
      };

      res.json(analytics);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      res.status(500).json({ message: 'Error fetching analytics', error });
    }
  }
};
