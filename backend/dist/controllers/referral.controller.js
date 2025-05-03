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
exports.referralController = void 0;
const referrals_1 = require("../models/referrals");
const campaign_1 = require("../models/campaign");
const codeGenerator_1 = require("../utils/codeGenerator");
const validators_1 = require("../utils/validators");
exports.referralController = {
    // Create new referral
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log('Received referral creation request:', req.body); // Debug log
            const { campaignId, referrerEmail } = req.body;
            // Validate required fields
            if (!campaignId || !referrerEmail) {
                console.log('Missing required fields:', { campaignId, referrerEmail }); // Debug log
                return res.status(400).json({
                    message: 'Required fields missing: campaignId, referrerEmail'
                });
            }
            // Validate email format
            if (!(0, validators_1.validateEmail)(referrerEmail)) {
                return res.status(400).json({
                    message: 'Invalid email format'
                });
            }
            // Check if campaign exists and belongs to the business
            const campaign = yield campaign_1.Campaign.findOne({
                _id: campaignId,
                businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            });
            if (!campaign) {
                return res.status(404).json({
                    message: 'Campaign not found or not authorized'
                });
            }
            // Generate unique referral code
            const code = yield (0, codeGenerator_1.generateReferralCode)();
            const referral = new referrals_1.Referral({
                campaignId,
                businessId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                referrerEmail,
                code,
                status: 'pending'
            });
            yield referral.save();
            res.status(201).json({
                code,
                referrerEmail,
                campaignId
            });
        }
        catch (error) {
            console.error('Referral creation error:', error);
            res.status(500).json({
                message: 'Error creating referral',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }),
    // Get all referrals for a business
    getBusinessReferrals: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const referrals = yield referrals_1.Referral.find({
                businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            })
                .populate('customerId', 'firstName lastName email')
                .populate('campaignId', 'title rewardType rewardValue')
                .sort({ createdAt: -1 });
            res.json(referrals);
        }
        catch (error) {
            console.error('Referral fetch error:', error);
            res.status(500).json({ message: 'Error fetching referrals', error });
        }
    }),
    // Get single referral
    getReferral: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const referral = yield referrals_1.Referral.findOne({
                _id: req.params.id,
                businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            })
                .populate('customerId', 'firstName lastName email')
                .populate('campaignId', 'title rewardType rewardValue');
            if (!referral) {
                return res.status(404).json({ message: 'Referral not found' });
            }
            // Check if user owns this referral
            if (referral.businessId.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
                return res.status(403).json({ message: 'Not authorized to view this referral' });
            }
            res.json(referral);
        }
        catch (error) {
            console.error('Referral fetch error:', error);
            res.status(500).json({ message: 'Error fetching referral', error });
        }
    }),
    // Update referral status
    updateStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { status } = req.body;
            if (!['pending', 'approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    message: 'Invalid status. Must be pending, approved, or rejected'
                });
            }
            const referral = yield referrals_1.Referral.findOne({
                _id: req.params.id,
                businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            });
            if (!referral) {
                return res.status(404).json({ message: 'Referral not found' });
            }
            // Check if user owns this referral
            if (referral.businessId.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
                return res.status(403).json({ message: 'Not authorized to update this referral' });
            }
            referral.status = status;
            yield referral.save();
            // TODO: Send status update email notifications
            res.json(referral);
        }
        catch (error) {
            console.error('Referral status update error:', error);
            res.status(500).json({ message: 'Error updating referral status', error });
        }
    }),
    // Public endpoints
    getReferralByCode: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { code } = req.params;
            console.log('Fetching referral for code:', code);
            const referral = yield referrals_1.Referral.findOne({ code })
                .populate('customerId', 'firstName lastName email')
                .populate('campaignId', 'title description rewardType rewardValue rewardDescription')
                .populate('businessId', 'firstName lastName email');
            if (!referral) {
                return res.status(404).json({ message: 'Referral not found' });
            }
            if (referral.referredEmail) {
                return res.status(400).json({ message: 'This referral has already been used' });
            }
            res.json({
                campaignDetails: {
                    title: referral.campaignId.title,
                    description: referral.campaignId.description,
                    rewardType: referral.campaignId.rewardType,
                    rewardValue: referral.campaignId.rewardValue,
                    rewardDescription: referral.campaignId.rewardDescription
                },
                businessDetails: {
                    firstName: referral.businessId.firstName,
                    lastName: referral.businessId.lastName,
                    email: referral.businessId.email
                }
            });
        }
        catch (error) {
            console.error('Error fetching referral:', error);
            res.status(500).json({ message: 'Error fetching referral details' });
        }
    }),
    completeReferral: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const referral = yield referrals_1.Referral.findOne({
                _id: req.params.id,
                businessId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
            });
            if (!referral) {
                return res.status(404).json({ message: 'Referral not found' });
            }
            referral.status = 'completed';
            referral.completedAt = new Date();
            yield referral.save();
            res.json(referral);
        }
        catch (error) {
            console.error('Error completing referral:', error);
            res.status(500).json({ message: 'Error completing referral' });
        }
    }),
    // Generate referral link for a campaign
    generateReferralLink: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const { campaignId } = req.body;
            console.log('Generating referral link for campaign:', {
                campaignId,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                headers: req.headers,
                body: req.body
            });
            if (!campaignId) {
                console.log('Missing campaignId');
                return res.status(400).json({
                    message: 'Campaign ID is required'
                });
            }
            // Check if campaign exists and is active
            const campaign = yield campaign_1.Campaign.findOne({
                _id: campaignId,
                status: 'active'
            });
            if (!campaign) {
                console.log('Campaign not found or not active:', campaignId);
                return res.status(404).json({
                    message: 'Campaign not found or not active'
                });
            }
            if (campaign.businessId.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
                return res.status(403).json({ message: 'Not authorized to generate referral link for this campaign' });
            }
            // Generate unique referral code
            const code = yield (0, codeGenerator_1.generateReferralCode)();
            // Create referral record
            const referral = new referrals_1.Referral({
                campaignId,
                businessId: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
                status: 'pending'
            });
            yield referral.save();
            console.log('Referral created successfully:', {
                code,
                campaignId,
                businessId: (_d = req.user) === null || _d === void 0 ? void 0 : _d._id
            });
            const referralLink = `${process.env.FRONTEND_URL}/referral/${referral.code}`;
            res.status(201).json({
                referralLink,
                code: referral.code
            });
        }
        catch (error) {
            console.error('Error generating referral link:', error);
            res.status(500).json({ message: 'Error generating referral link' });
        }
    }),
    getReferralById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const referral = yield referrals_1.Referral.findById(req.params.id)
                .populate('campaignId', 'title description rewardType rewardValue rewardDescription')
                .populate('businessId', 'firstName lastName email')
                .lean();
            if (!referral) {
                return res.status(404).json({ message: 'Referral not found' });
            }
            const response = {
                id: referral._id,
                campaign: {
                    title: referral.campaignId.title,
                    description: referral.campaignId.description,
                    rewardType: referral.campaignId.rewardType,
                    rewardValue: referral.campaignId.rewardValue,
                    rewardDescription: referral.campaignId.rewardDescription
                },
                business: {
                    firstName: referral.businessId.firstName,
                    lastName: referral.businessId.lastName,
                    email: referral.businessId.email
                },
                customerName: referral.customerName,
                customerEmail: referral.customerEmail,
                customerPhone: referral.customerPhone,
                status: referral.status,
                createdAt: referral.createdAt,
                updatedAt: referral.updatedAt,
                completedAt: referral.completedAt
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching referral:', error);
            res.status(500).json({ message: 'Error fetching referral' });
        }
    })
};
