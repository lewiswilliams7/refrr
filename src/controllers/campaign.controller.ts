import { Request, Response } from 'express';
import { AuthRequest } from '../types/types';
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
  create: async (req: AuthRequest, res: Response) => {
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
        businessId: req.user?.userId,
        title,
        description,
        rewardType,
        rewardValue,
        rewardDescription,
        status: 'active'
      });

      await campaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Campaign creation error:', error);
      res.status(500).json({ message: 'Error creating campaign', error });
    }
  },

  // Get all campaigns for a business
  getBusinessCampaigns: async (req: AuthRequest, res: Response) => {
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
  getCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Check if user owns this campaign
      if (campaign.businessId.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this campaign' });
      }

      res.json(campaign);
    } catch (error) {
      console.error('Campaign fetch error:', error);
      res.status(500).json({ message: 'Error fetching campaign', error });
    }
  },

  // Update campaign
  update: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Check if user owns this campaign
      if (campaign.businessId.toString() !== req.user?.userId) {
        return res.status(403).json({ message: 'Not authorized to update this campaign' });
      }

      const { title, description, rewardType, rewardValue, rewardDescription } = req.body;

      // Validate required fields if they're being updated
      if ((rewardType && !['percentage', 'fixed'].includes(rewardType)) ||
          (rewardValue !== undefined && (typeof rewardValue !== 'number' || rewardValue <= 0)) ||
          (rewardType === 'percentage' && rewardValue > 100)) {
        return res.status(400).json({ 
          message: 'Invalid reward configuration' 
        });
      }

      const updatedCampaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          rewardType,
          rewardValue,
          rewardDescription,
          businessId: campaign.businessId // Ensure businessId can't be changed
        },
        { new: true, runValidators: true }
      );

      res.json(updatedCampaign);
    } catch (error) {
      console.error('Campaign update error:', error);
      res.status(500).json({ message: 'Error updating campaign', error });
    }
  },

  // Delete campaign
  delete: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Check if user owns this campaign
      if (campaign.businessId.toString() !== req.user?.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this campaign' });
      }

      await Campaign.findByIdAndDelete(req.params.id);
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Campaign deletion error:', error);
      res.status(500).json({ message: 'Error deleting campaign', error });
    }
  },

  // Toggle campaign active status
  toggleActive: async (req: AuthRequest, res: Response) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Check if user owns this campaign
      if (campaign.businessId.toString() !== req.user?.userId) {
        return res.status(403).json({ message: 'Not authorized to modify this campaign' });
      }

      // Toggle between active and paused
      campaign.status = campaign.status === 'active' ? 'paused' : 'active';
      await campaign.save();

      res.json(campaign);
    } catch (error) {
      console.error('Campaign toggle error:', error);
      res.status(500).json({ message: 'Error toggling campaign status', error });
    }
  },

  // Get public campaign details
  getPublicCampaign: async (req: Request, res: Response) => {
    try {
      const campaignId = req.params.id;
      console.log('Fetching public campaign with ID:', campaignId);
      
      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        return res.status(400).json({ message: 'Invalid campaign ID' });
      }

      // Find campaign and populate business data
      const campaign = await Campaign.findById(campaignId)
        .populate<{ businessId: PopulatedBusiness }>('businessId', 'businessName businessType location')
        .lean()
        .exec();

      if (!campaign) {
        console.log('Campaign not found in database:', campaignId);
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.status !== 'active') {
        console.log('Campaign is not active:', campaignId);
        return res.status(404).json({ message: 'Campaign is not active' });
      }

      // Ensure business data exists
      const businessData = campaign.businessId as PopulatedBusiness;
      if (!businessData) {
        console.error('Business data not found for campaign:', campaignId);
        return res.status(500).json({ message: 'Business data not found' });
      }

      // Prepare response data
      const responseData = {
        id: campaign._id,
        title: campaign.title,
        description: campaign.description || '',
        rewardType: campaign.rewardType,
        rewardValue: campaign.rewardValue,
        rewardDescription: campaign.rewardDescription,
        showRewardDisclaimer: campaign.showRewardDisclaimer,
        rewardDisclaimerText: campaign.rewardDisclaimerText,
        businessName: businessData.businessName,
        businessType: businessData.businessType,
        location: businessData.location,
        status: campaign.status,
        tags: campaign.tags,
        referralCount: campaign.analytics?.totalReferrals,
        expirationDate: campaign.expirationDate,
        popularity: campaign.analytics?.conversionRate
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching public campaign:', error);
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: 'Invalid campaign ID format' });
      }
      res.status(500).json({ 
        message: 'Error fetching campaign details',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Get all public campaigns
  getPublicCampaigns: async (req: Request, res: Response) => {
    try {
      console.log('Fetching all public campaigns...');
      
      // Find all active campaigns and populate business data
      const campaigns = await Campaign.find({ status: 'active' })
        .populate<{ businessId: PopulatedBusiness }>('businessId', 'businessName businessType location')
        .lean()
        .exec();

      console.log(`Found ${campaigns.length} active campaigns`);

      // Prepare response data
      const responseData = campaigns.map(campaign => {
        const businessData = campaign.businessId as PopulatedBusiness;
        return {
          id: campaign._id,
          title: campaign.title,
          description: campaign.description || '',
          rewardType: campaign.rewardType,
          rewardValue: campaign.rewardValue,
          rewardDescription: campaign.rewardDescription,
          showRewardDisclaimer: campaign.showRewardDisclaimer,
          rewardDisclaimerText: campaign.rewardDisclaimerText,
          businessName: businessData.businessName,
          businessType: businessData.businessType,
          location: businessData.location,
          status: campaign.status,
          tags: campaign.tags,
          referralCount: campaign.analytics?.totalReferrals,
          expirationDate: campaign.expirationDate,
          popularity: campaign.analytics?.conversionRate
        };
      });

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching public campaigns:', error);
      res.status(500).json({ 
        message: 'Error fetching campaigns',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
};
