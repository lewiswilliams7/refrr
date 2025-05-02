import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign } from '../models/campaign.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';
import Business from '../models/business';

// Define the type for populated business data
interface PopulatedBusiness {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
}

// Define the type for campaign with populated business
interface CampaignWithBusiness extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  businessId: PopulatedBusiness;
}

export const campaignController = {
  // Create new campaign
  createCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, rewardType, rewardValue, rewardDescription } = req.body;
      
      // Validate required fields
      if (!title || !rewardType || !rewardValue || !rewardDescription) {
        return res.status(400).json({ 
          message: 'Required fields missing: title, rewardType, rewardValue, rewardDescription' 
        });
      }

      // Validate reward type
      if (!['percentage', 'fixed'].includes(rewardType)) {
        return res.status(400).json({ 
          message: 'Invalid reward type. Must be either "percentage" or "fixed"' 
        });
      }

      // Validate reward value
      if (typeof rewardValue !== 'number' || rewardValue <= 0) {
        return res.status(400).json({ 
          message: 'Reward value must be a positive number' 
        });
      }

      // If percentage, validate it's not over 100
      if (rewardType === 'percentage' && rewardValue > 100) {
        return res.status(400).json({ 
          message: 'Percentage reward cannot exceed 100%' 
        });
      }

      const campaign = new Campaign({
        ...req.body,
        businessId: req.user?._id
      });

      await campaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ message: 'Error creating campaign' });
    }
  },

  // Get all campaigns for a business
  getCampaigns: async (req: AuthRequest, res: Response) => {
    try {
      const campaigns = await Campaign.find({ businessId: req.user?._id });
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Error fetching campaigns' });
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
      console.error('Error fetching campaign:', error);
      res.status(500).json({ message: 'Error fetching campaign' });
    }
  },

  // Update campaign
  updateCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findOneAndUpdate(
        { _id: req.params.id, businessId: req.user?._id },
        req.body,
        { new: true }
      );
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ message: 'Error updating campaign' });
    }
  },

  // Delete campaign
  deleteCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findOneAndDelete({
        _id: req.params.id,
        businessId: req.user?._id
      });
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ message: 'Error deleting campaign' });
    }
  },

  // Toggle campaign active status
  toggleActive: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      if (campaign.businessId.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this campaign' });
      }
      campaign.isActive = !campaign.isActive;
      await campaign.save();
      res.json(campaign);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      res.status(500).json({ message: 'Error toggling campaign status' });
    }
  },

  // Get public campaign details
  getPublicCampaign: async (req: Request, res: Response) => {
    try {
      const campaign = await Campaign.findById(req.params.id)
        .populate('businessId', 'businessName businessType location');
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error('Error fetching public campaign:', error);
      res.status(500).json({ message: 'Error fetching public campaign' });
    }
  },

  // Get all public campaigns
  getPublicCampaigns: async (req: Request, res: Response) => {
    try {
      const campaigns = await Campaign.find({ isActive: true })
        .populate('businessId', 'businessName businessType location');
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching public campaigns:', error);
      res.status(500).json({ message: 'Error fetching public campaigns' });
    }
  }
};
