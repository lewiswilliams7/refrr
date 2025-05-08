import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Campaign } from '../models/campaign.model';
import { asyncHandler } from '../middleware/asyncHandler';
import mongoose from 'mongoose';

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
      const businesses = await User.find(
        { 
          businessName: { $exists: true },
          'location.city': { $exists: true } // Only get businesses with location data
        },
        'businessName businessType location businessDescription'
      );

      console.log(`Found ${businesses.length} businesses`);

      // Get active campaign counts for each business
      const businessesWithCampaigns = await Promise.all(
        businesses.map(async (business) => {
          console.log(`Fetching campaigns for business: ${business.businessName}`);
          const campaigns = await Campaign.find({
            businessId: business._id,
            isActive: true
          });

          console.log(`Found ${campaigns.length} active campaigns for ${business.businessName}`);

          const rewards = campaigns.map((campaign: ICampaign) => {
            console.log(`Processing campaign: ${campaign._id}`);
            const reward: IReward = {
              type: campaign.rewardType,
              value: campaign.rewardValue,
              description: campaign.rewardDescription || '',
              campaignId: campaign._id.toString()
            };
            console.log('Created reward object:', JSON.stringify(reward, null, 2));
            return reward;
          });

          const businessWithCampaigns = {
            _id: business._id,
            businessName: business.businessName,
            businessType: business.businessType,
            location: business.location || { city: 'Location not specified' },
            businessDescription: business.businessDescription,
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
      const campaigns = await Campaign.find({
        businessId: req.user?.userId
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
      const campaign = await Campaign.findOne({
        _id: req.params.id,
        businessId: req.user?.userId
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
  }
};
