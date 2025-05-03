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
exports.campaignController = void 0;
const campaign_1 = require("../models/campaign");
exports.campaignController = {
    // Create new campaign
    createCampaign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
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
            const campaign = new campaign_1.Campaign(Object.assign(Object.assign({}, req.body), { businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }));
            yield campaign.save();
            res.status(201).json(campaign);
        }
        catch (error) {
            console.error('Error creating campaign:', error);
            res.status(500).json({ message: 'Error creating campaign' });
        }
    }),
    // Get all campaigns for a business
    getCampaigns: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const campaigns = yield campaign_1.Campaign.find({ businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
            res.json(campaigns);
        }
        catch (error) {
            console.error('Error fetching campaigns:', error);
            res.status(500).json({ message: 'Error fetching campaigns' });
        }
    }),
    // Get single campaign
    getCampaignById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const campaign = yield campaign_1.Campaign.findOne({
                _id: req.params.id,
                businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            });
            if (!campaign) {
                return res.status(404).json({ message: 'Campaign not found' });
            }
            res.json(campaign);
        }
        catch (error) {
            console.error('Error fetching campaign:', error);
            res.status(500).json({ message: 'Error fetching campaign' });
        }
    }),
    // Update campaign
    updateCampaign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const campaign = yield campaign_1.Campaign.findOneAndUpdate({ _id: req.params.id, businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }, req.body, { new: true });
            if (!campaign) {
                return res.status(404).json({ message: 'Campaign not found' });
            }
            res.json(campaign);
        }
        catch (error) {
            console.error('Error updating campaign:', error);
            res.status(500).json({ message: 'Error updating campaign' });
        }
    }),
    // Delete campaign
    deleteCampaign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const campaign = yield campaign_1.Campaign.findOneAndDelete({
                _id: req.params.id,
                businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            });
            if (!campaign) {
                return res.status(404).json({ message: 'Campaign not found' });
            }
            res.json({ message: 'Campaign deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting campaign:', error);
            res.status(500).json({ message: 'Error deleting campaign' });
        }
    }),
    // Toggle campaign active status
    toggleActive: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const campaign = yield campaign_1.Campaign.findById(req.params.id);
            if (!campaign) {
                return res.status(404).json({ message: 'Campaign not found' });
            }
            // Check if user owns this campaign
            if (campaign.businessId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
                return res.status(403).json({ message: 'Not authorized to modify this campaign' });
            }
            // Toggle between active and paused
            campaign.status = campaign.status === 'active' ? 'paused' : 'active';
            yield campaign.save();
            res.json(campaign);
        }
        catch (error) {
            console.error('Campaign toggle error:', error);
            res.status(500).json({ message: 'Error toggling campaign status', error });
        }
    }),
    // Get public campaign details
    getPublicCampaign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const campaign = yield campaign_1.Campaign.findById(req.params.id)
                .populate('businessId', 'businessName businessType location');
            if (!campaign) {
                return res.status(404).json({ message: 'Campaign not found' });
            }
            res.json(campaign);
        }
        catch (error) {
            console.error('Error fetching public campaign:', error);
            res.status(500).json({ message: 'Error fetching public campaign' });
        }
    }),
    // Get all public campaigns
    getPublicCampaigns: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const campaigns = yield campaign_1.Campaign.find({ isActive: true })
                .populate('businessId', 'businessName businessType location');
            res.json(campaigns);
        }
        catch (error) {
            console.error('Error fetching public campaigns:', error);
            res.status(500).json({ message: 'Error fetching public campaigns' });
        }
    })
};
