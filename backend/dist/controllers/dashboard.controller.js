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
exports.dashboardController = void 0;
const user_model_1 = require("../models/user.model");
const campaign_1 = require("../models/campaign");
const referrals_1 = require("../models/referrals");
const mongoose_1 = __importDefault(require("mongoose"));
exports.dashboardController = {
    getBusinessDashboard: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const business = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
            if (!business) {
                return res.status(404).json({ message: 'Business not found' });
            }
            const campaigns = yield campaign_1.Campaign.find({ businessId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id });
            const referrals = yield referrals_1.Referral.find({ businessId: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id })
                .populate('customerId', 'firstName lastName email')
                .populate('campaignId', 'title rewardType rewardValue');
            const dashboardData = {
                business,
                campaigns,
                referrals
            };
            res.json(dashboardData);
        }
        catch (error) {
            console.error('Error fetching business dashboard:', error);
            res.status(500).json({ message: 'Error fetching business dashboard' });
        }
    }),
    getStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const businessId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            // Get active campaigns count
            const activeCampaigns = yield campaign_1.Campaign.countDocuments({
                businessId,
                isActive: true
            });
            // Get total referrals count
            const totalReferrals = yield referrals_1.Referral.countDocuments({
                businessId
            });
            // Get pending approvals count
            const pendingApprovals = yield referrals_1.Referral.countDocuments({
                businessId,
                status: 'pending'
            });
            // Get referral statistics
            const referralStats = {
                total: totalReferrals,
                approved: yield referrals_1.Referral.countDocuments({ businessId, status: 'approved' }),
                pending: pendingApprovals,
                rejected: yield referrals_1.Referral.countDocuments({ businessId, status: 'rejected' })
            };
            // Get campaign statistics
            const campaignStats = {
                total: yield campaign_1.Campaign.countDocuments({ businessId }),
                active: activeCampaigns,
                completed: yield campaign_1.Campaign.countDocuments({ businessId, isActive: false })
            };
            // Get monthly referrals data
            const monthlyReferrals = yield referrals_1.Referral.aggregate([
                {
                    $match: { businessId: new mongoose_1.default.Types.ObjectId(businessId) }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id": 1 }
                },
                {
                    $project: {
                        month: "$_id",
                        count: 1,
                        _id: 0
                    }
                }
            ]);
            // Get status distribution
            const statusDistribution = yield referrals_1.Referral.aggregate([
                {
                    $match: { businessId: new mongoose_1.default.Types.ObjectId(businessId) }
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        status: "$_id",
                        count: 1,
                        _id: 0
                    }
                }
            ]);
            // Get recent activity (last 5 referrals)
            const recentActivity = yield referrals_1.Referral.find({ businessId })
                .populate('campaignId', 'title')
                .sort({ createdAt: -1 })
                .limit(5);
            res.json({
                activeCampaigns,
                totalReferrals,
                pendingApprovals,
                recentActivity,
                referralStats,
                campaignStats,
                monthlyReferrals,
                statusDistribution
            });
        }
        catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ message: 'Error fetching dashboard statistics' });
        }
    })
};
