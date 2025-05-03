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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerController = void 0;
const user_model_1 = require("../models/user.model");
const referrals_1 = __importDefault(require("../models/referrals"));
exports.customerController = {
    getAnalytics: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
            if (!userId || !userEmail) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            // Get total referrals count
            const totalReferrals = yield referrals_1.default.countDocuments({
                referrerEmail: userEmail
            });
            // Get successful referrals count
            const successfulReferrals = yield referrals_1.default.countDocuments({
                referrerEmail: userEmail,
                status: 'approved'
            });
            // Get pending referrals count
            const pendingReferrals = yield referrals_1.default.countDocuments({
                referrerEmail: userEmail,
                status: 'pending'
            });
            // Get total rewards earned
            const completedReferrals = yield referrals_1.default.find({
                referrerEmail: userEmail,
                status: 'approved'
            }).populate('campaignId', 'rewardType rewardValue');
            const totalRewards = completedReferrals.reduce((total, referral) => {
                const campaign = referral.campaignId;
                if (campaign.rewardType === 'percentage') {
                    return total + campaign.rewardValue;
                }
                else {
                    return total + campaign.rewardValue;
                }
            }, 0);
            // Get recent activity (last 5 referrals)
            const recentActivity = yield referrals_1.default.find({ referrerEmail: userEmail })
                .populate('campaignId', 'title businessName rewardType rewardValue')
                .sort({ createdAt: -1 })
                .limit(5);
            res.json({
                totalReferrals,
                successfulReferrals,
                pendingReferrals,
                totalRewards,
                recentActivity
            });
        }
        catch (error) {
            console.error('Error fetching customer analytics:', error);
            res.status(500).json({ message: 'Error fetching customer analytics' });
        }
    }),
    getCustomerProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.json(user);
        }
        catch (error) {
            console.error('Error fetching customer profile:', error);
            res.status(500).json({ message: 'Error fetching customer profile' });
        }
    })
};
