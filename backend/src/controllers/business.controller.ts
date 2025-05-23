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
  getPublicBusinesses: async (req: Request, res: Response): Promise<void> => {
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
            location: business.location,
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

  // Get public business by ID
  getPublicBusiness: async (req: Request, res: Response): Promise<void> => {
    try {
      const business = await Business.findOne({
        _id: req.params.id,
        status: 'active'
      }).populate('userId', 'email firstName lastName');

      if (!business) {
        res.status(404).json({ message: 'Business not found' });
        return;
      }

      const campaigns = await Campaign.find({
        businessId: business._id,
        status: 'active'
      }).lean();

      const rewards = campaigns.map((campaign) => ({
        type: campaign.rewardType,
        value: campaign.rewardValue,
        description: campaign.rewardDescription,
        campaignId: campaign._id.toString()
      }));

      const businessWithCampaigns = {
        _id: business._id,
        businessName: business.businessName,
        businessType: business.businessType,
        location: business.location,
        description: business.description,
        activeCampaigns: {
          count: campaigns.length,
          rewards
        }
      };

      res.json(businessWithCampaigns);
    } catch (error) {
      console.error('Error fetching business:', error);
      res.status(500).json({ message: 'Error fetching business' });
    }
  },

  // Get business campaigns
  getBusinessCampaigns: async (req: AuthRequest, res: Response): Promise<void> => {
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

      const campaigns = await Campaign.find({
        businessId: business._id
      }).sort({ createdAt: -1 });

      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Error fetching campaigns' });
    }
  },

  // Get business analytics
  getBusinessAnalytics: async (req: AuthRequest, res: Response): Promise<void> => {
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

      const campaigns = await Campaign.find({ businessId: business._id });
      const totalReferrals = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.totalReferrals || 0), 0);
      const successfulReferrals = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.successfulReferrals || 0), 0);
      const totalRewards = campaigns.reduce((sum, campaign) => sum + (campaign.analytics?.rewardRedemptions || 0), 0);

      res.json({
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalReferrals,
        successfulReferrals,
        conversionRate: totalReferrals > 0 ? (successfulReferrals / totalReferrals) * 100 : 0,
        totalRewards,
        campaigns: campaigns.map(campaign => ({
          id: campaign._id,
          title: campaign.title,
          status: campaign.status,
          analytics: campaign.analytics
        }))
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Error fetching analytics' });
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
        location: business.location,
        status: business.status,
        website: business.website,
        description: business.description,
        logo: business.logo,
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
        location,
        website,
        description,
        logo,
        contactInfo,
        socialMedia,
        settings
      } = req.body;

      // Update business fields
      if (businessName) business.businessName = businessName;
      if (businessType) business.businessType = businessType;
      if (location) business.location = location;
      if (website) business.website = website;
      if (description) business.description = description;
      if (logo) business.logo = logo;
      if (contactInfo) business.contactInfo = contactInfo;
      if (socialMedia) business.socialMedia = socialMedia;
      if (settings) business.settings = settings;

      await business.save();

      res.json({
        _id: business._id,
        businessName: business.businessName,
        businessType: business.businessType,
        location: business.location,
        status: business.status,
        website: business.website,
        description: business.description,
        logo: business.logo,
        contactInfo: business.contactInfo,
        socialMedia: business.socialMedia,
        settings: business.settings
      });
    } catch (error) {
      console.error('Update business profile error:', error);
      res.status(500).json({ message: 'Error updating business profile' });
    }
  }
};
