import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Campaign, ICampaign } from '../models/campaign.model';
import { Business, IBusiness } from '../models/business.model';
import { asyncHandler } from '../middleware/asyncHandler';
import mongoose from 'mongoose';

interface IReward {
  type: string;
  value: number;
  description: string;
  campaignId: string;
}

export const businessController = {
  // Get public business list
  getPublicBusinesses: async (req: Request, res: Response) => {
    try {
      console.log('Fetching public businesses...');
      const businesses = await Business.find(
        { 
          status: 'active'
        }
      ).populate('userId', 'email firstName lastName');

      console.log(`Found ${businesses.length} businesses`);

      // Get active campaign counts for each business
      const businessesWithCampaigns = await Promise.all(
        businesses.map(async (business) => {
          console.log(`Fetching campaigns for business: ${business.businessName}`);
          const campaigns = await Campaign.find({
            businessId: business._id,
            status: 'active'
          }).lean();

          console.log(`Found ${campaigns.length} active campaigns for ${business.businessName}`);

          const rewards = campaigns.map((campaign) => {
            console.log(`Processing campaign: ${campaign._id}`);
            const reward: IReward = {
              type: campaign.rewardType,
              value: campaign.rewardValue,
              description: campaign.rewardDescription,
              campaignId: campaign._id.toString()
            };
            console.log('Created reward object:', JSON.stringify(reward, null, 2));
            return reward;
          });

          const businessWithCampaigns = {
            _id: business._id,
            businessName: business.businessName,
            businessType: business.businessType,
            address: business.address,
            description: business.description,
            activeCampaigns: {
              count: campaigns.length,
              rewards: rewards.map(reward => ({
                ...reward,
                campaignId: reward.campaignId
              }))
            }
          };
          console.log('Created business with campaigns:', JSON.stringify(businessWithCampaigns, null, 2));
          return businessWithCampaigns;
        })
      );

      console.log('Returning businesses with campaigns:', businessesWithCampaigns);
      res.json(businessesWithCampaigns);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      res.status(500).json({ message: 'Error fetching businesses' });
    }
  },

  // Get all campaigns for a business
  getCampaigns: async (req: AuthRequest, res: Response) => {
    try {
      const business = await Business.findOne({ userId: req.user?.userId });
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const campaigns = await Campaign.find({
        businessId: business._id
      }).sort({ createdAt: -1 });

      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Error fetching campaigns' });
    }
  },

  // Get single campaign
  getCampaign: async (req: AuthRequest, res: Response) => {
    try {
      const business = await Business.findOne({ userId: req.user?.userId });
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: business._id
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

  // Process campaigns
  processCampaigns: async (campaigns: ICampaign[]) => {
    try {
      for (const campaign of campaigns) {
        console.log(`Processing campaign: ${campaign._id}`);
        // Process campaign logic here
        return {
          success: true,
          campaignId: campaign._id.toString()
        };
      }
    } catch (error) {
      console.error('Error processing campaigns:', error);
      throw error;
    }
  },

  // Get business profile
  getBusinessProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      res.json({
        _id: business._id,
        businessName: business.businessName,
        businessType: business.businessType,
        industry: business.industry,
        website: business.website,
        description: business.description,
        logo: business.logo,
        address: business.address,
        contactInfo: business.contactInfo,
        socialMedia: business.socialMedia,
        settings: business.settings
      });
    } catch (error) {
      console.error('Get business profile error:', error);
      res.status(500).json({ message: 'Error fetching business profile' });
    }
  },

  // Update business profile
  updateBusinessProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const business = await Business.findOne({ userId: req.user.userId });
      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const {
        businessName,
        businessType,
        industry,
        website,
        description,
        logo,
        address,
        contactInfo,
        socialMedia,
        settings
      } = req.body;

      // Update business fields
      if (businessName) business.businessName = businessName;
      if (businessType) business.businessType = businessType;
      if (industry) business.industry = industry;
      if (website) business.website = website;
      if (description) business.description = description;
      if (logo) business.logo = logo;
      if (address) business.address = address;
      if (contactInfo) business.contactInfo = contactInfo;
      if (socialMedia) business.socialMedia = socialMedia;
      if (settings) business.settings = settings;

      await business.save();

      res.json({
        message: 'Business profile updated successfully',
        business: {
          _id: business._id,
          businessName: business.businessName,
          businessType: business.businessType,
          industry: business.industry,
          website: business.website,
          description: business.description,
          logo: business.logo,
          address: business.address,
          contactInfo: business.contactInfo,
          socialMedia: business.socialMedia,
          settings: business.settings
        }
      });
    } catch (error) {
      console.error('Update business profile error:', error);
      res.status(500).json({ message: 'Error updating business profile' });
    }
  }
};
