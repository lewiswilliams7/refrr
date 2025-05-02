import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Campaign, ICampaign } from '../models/campaign';

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
            const reward = {
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
            location: business.location || { city: 'Location not specified' },
            businessDescription: business.businessDescription,
            activeCampaigns: {
              count: campaigns.length,
              rewards: rewards.map(reward => ({
                ...reward,
                campaignId: reward.campaignId // Ensure campaignId is included
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
  }
};
