"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessController = void 0;
const user_model_1 = require("../models/user.model");
const campaign_1 = require("../models/campaign");
exports.businessController = {
    // Get public business list
    getPublicBusinesses: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('Fetching public businesses...');
            const businesses = yield user_model_1.User.find({
                businessName: { $exists: true },
                'location.city': { $exists: true } // Only get businesses with location data
            }, 'businessName businessType location businessDescription');
            console.log(`Found ${businesses.length} businesses`);
            // Get active campaign counts for each business
            const businessesWithCampaigns = yield Promise.all(businesses.map((business) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(`Fetching campaigns for business: ${business.businessName}`);
                const campaigns = yield campaign_1.Campaign.find({
                    businessId: business._id,
                    isActive: true
                });
                console.log(`Found ${campaigns.length} active campaigns for ${business.businessName}`);
                const rewards = campaigns.map((campaign) => {
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
                        rewards: rewards.map(reward => (Object.assign(Object.assign({}, reward), { campaignId: reward.campaignId // Ensure campaignId is included
                         })))
                    }
                };
                console.log('Created business with campaigns:', JSON.stringify(businessWithCampaigns, null, 2));
                return businessWithCampaigns;
            })));
            console.log('Returning businesses with campaigns:', businessesWithCampaigns);
            res.json(businessesWithCampaigns);
        }
        catch (error) {
            console.error('Error fetching businesses:', error);
            res.status(500).json({ message: 'Error fetching businesses' });
        }
    })
};
