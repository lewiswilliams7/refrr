import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Campaign, ICampaign } from '../models/campaign.model';
import { Business, IBusiness } from '../models/business.model';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

// Define the type for populated business data
interface PopulatedBusiness extends IBusiness {
  _id: Types.ObjectId;
  businessName: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Define the type for campaign with populated business
interface CampaignWithBusiness {
  _id: Types.ObjectId;
  businessId: Types.ObjectId;
  title: string;
  description: string;
  rewardType: string;
  rewardValue: number;
  rewardDescription: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'inactive' | 'completed';
  business: {
    _id: Types.ObjectId;
    businessName: string;
    businessType: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const campaignController = {
  createCampaign: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Creating campaign for user:', req.user?.userId);
      const business = await Business.findOne({ userId: req.user?.userId });
      
      if (!business) {
        console.log('No business profile found for user:', req.user?.userId);
        res.status(404).json({ message: 'Business profile not found. Please complete your business profile first.' });
        return;
      }

      console.log('Found business:', business._id);
      const campaign = new Campaign({
        ...req.body,
        businessId: business._id
      });

      await campaign.save();
      console.log('Campaign created:', campaign._id);
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Create campaign error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getBusinessCampaigns: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('Getting campaigns for user:', req.user?.userId);
      const business = await Business.findOne({ userId: req.user?.userId });
      
      if (!business) {
        console.log('No business profile found for user:', req.user?.userId);
        // Return empty array instead of 404
        res.json([]);
        return;
      }

      console.log('Found business:', business._id);
      const campaigns = await Campaign.find({ businessId: business._id });
      console.log('Found campaigns:', campaigns.length);
      res.json(campaigns);
    } catch (error) {
      console.error('Get campaigns error:', error);
      res.status(500).json({ message: 'Server error' });
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
      console.error('Get campaign error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateCampaign: async (req: AuthRequest, res: Response): Promise<void> => {
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

      const updatedCampaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.json(updatedCampaign);
    } catch (error) {
      console.error('Update campaign error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteCampaign: async (req: AuthRequest, res: Response): Promise<void> => {
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

      await campaign.deleteOne();
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Delete campaign error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

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

      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: business._id
      });
      
      if (!campaign) {
        res.status(404).json({ message: 'Campaign not found' });
        return;
      }

      campaign.status = campaign.status === 'active' ? 'inactive' : 'active';
      await campaign.save();

      res.json({
        message: `Campaign ${campaign.status === 'active' ? 'activated' : 'deactivated'} successfully`,
        campaign
      });
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      res.status(500).json({ message: 'Error toggling campaign status' });
    }
  },

  getPublicCampaign: async (req: Request, res: Response): Promise<void> => {
    try {
      const campaignId = req.params.id;
      console.log('Fetching public campaign with ID:', campaignId);
      
      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        res.status(400).json({ message: 'Invalid campaign ID' });
        return;
      }

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

      const businessData = campaign.businessId as any;
      if (!businessData) {
        console.error('Business data not found for campaign:', campaignId);
        res.status(500).json({ message: 'Business data not found' });
        return;
      }

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
        endDate: campaign.endDate,
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

  getPublicCampaigns: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Fetching all public campaigns...');
      
      const campaigns = await Campaign.find({ status: 'active' })
        .populate('businessId', 'businessName businessType location')
        .lean()
        .exec();

      console.log(`Found ${campaigns.length} active campaigns`);

      const responseData = campaigns.map((campaign: any) => {
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
          endDate: campaign.endDate,
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
