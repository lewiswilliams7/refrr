import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign, ICampaign } from '../models/campaign.model';
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
  createCampaign: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const campaign = new Campaign({
        ...req.body,
        businessId: business._id.toString()
      });

      await campaign.save();

      res.status(201).json({
        message: 'Campaign created successfully',
        campaign
      });
    } catch (error) {
      console.error('Campaign creation error:', error);
      res.status(500).json({ message: 'Error creating campaign', error });
    }
  },

  getCampaigns: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const business = await Business.findOne({ userId: req.user?.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const campaigns = await Campaign.find({ businessId: business._id });
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Error fetching campaigns' });
    }
  },

  getCampaignById: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const business = await Business.findOne({ userId: req.user?.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: business._id
      });

      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
      }
      res.json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ message: 'Error fetching campaign' });
    }
  },

  updateCampaign: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: business._id.toString()
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      Object.assign(campaign, req.body);
      // Verify ownership
      if (campaign.businessId.toString() !== business._id.toString()) {
        res.status(403).json({ message: 'Not authorized to update this campaign' });
        return;
      }

      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaignId,
        {
          title,
          description,
          rewardType,
          rewardValue,
          rewardDescription,
          startDate,
          endDate,
          status
        },
        { new: true }
      );

      res.json(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ message: 'Error updating campaign' });
    }
  },

  deleteCampaign: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const business = await Business.findOne({ userId: req.user?.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const campaign = await Campaign.findOneAndDelete({
        _id: req.params.id,
        businessId: business._id
      });

      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
      }
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ message: 'Error deleting campaign' });
    }
  },

  // Toggle campaign active status
  toggleActive: async (req: AuthRequest, res: Response): Promise<void> => {
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

      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
      }

      // Check if user owns this campaign
      if (campaign.businessId.toString() !== business._id.toString()) {
        res.status(403).json({ message: 'Not authorized to modify this campaign' });
        return;
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
  getPublicCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      const campaignId = req.params.id;
      console.log('Fetching public campaign with ID:', campaignId);
      
      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        res.status(400).json({ message: 'Invalid campaign ID' });
        return;
      }

      // Find campaign and populate business data
      const campaign = await Campaign.findById(campaignId)
        .populate('businessId', 'businessName businessType location')
        .lean()
        .exec();

      if (!campaign) {
        console.log('Campaign not found in database:', campaignId);
        res.status(404).json({ message: 'Campaign not found' });
        return;
      }

      if (campaign.status !== 'active') {
        console.log('Campaign is not active:', campaignId);
        res.status(404).json({ message: 'Campaign is not active' });
        return;
      }

      // Ensure business data exists
      const businessData = campaign.businessId as any;
      if (!businessData) {
        console.error('Business data not found for campaign:', campaignId);
        res.status(500).json({ message: 'Business data not found' });
        return;
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
        res.status(400).json({ message: 'Invalid campaign ID format' });
        return;
      }
      res.status(500).json({ 
        message: 'Error fetching campaign details',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },

  // Get all public campaigns
  getPublicCampaigns: async (req: Request, res: Response): Promise<void> => {
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
        const businessData = campaign.businessId as any;
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
