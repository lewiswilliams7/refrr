import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign } from '../models/campaign';
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
  createCampaign: async (req: AuthRequest, res: Response) => {
    try {
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

  getCampaigns: async (req: AuthRequest, res: Response) => {
    try {
      const campaigns = await Campaign.find({ businessId: req.user?._id });
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Error fetching campaigns' });
    }
  },

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

      // Check if user owns this campaign
      if (campaign.businessId.toString() !== req.user?._id.toString()) {
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
        .populate('businessId', 'businessName businessType location')
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
      const businessData = campaign.businessId;
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
        .populate('businessId', 'businessName businessType location')
        .lean()
        .exec();

      console.log(`Found ${campaigns.length} active campaigns`);

      // Prepare response data
      const responseData = campaigns.map(campaign => {
        const businessData = campaign.businessId;
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
