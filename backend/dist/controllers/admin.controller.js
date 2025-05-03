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
exports.adminController = void 0;
const campaign_1 = require("../models/campaign");
const user_model_1 = require("../models/user.model");
const business_1 = __importDefault(require("../models/business"));
exports.adminController = {
    // Campaign management
    getAllCampaigns: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const campaigns = yield campaign_1.Campaign.find()
                .populate('businessId', 'businessName email')
                .sort({ createdAt: -1 });
            res.json(campaigns);
        }
        catch (error) {
            console.error('Error fetching campaigns:', error);
            res.status(500).json({ message: 'Error fetching campaigns' });
        }
    }),
    deleteCampaign: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield campaign_1.Campaign.findByIdAndDelete(id);
            res.json({ message: 'Campaign deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting campaign:', error);
            res.status(500).json({ message: 'Error deleting campaign' });
        }
    }),
    updateCampaignStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const campaign = yield campaign_1.Campaign.findByIdAndUpdate(id, { status }, { new: true });
            res.json(campaign);
        }
        catch (error) {
            console.error('Error updating campaign status:', error);
            res.status(500).json({ message: 'Error updating campaign status' });
        }
    }),
    // Company management
    getAllCompanies: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const companies = yield business_1.default.find()
                .select('businessName email status createdAt')
                .sort({ createdAt: -1 });
            res.json(companies);
        }
        catch (error) {
            console.error('Error fetching companies:', error);
            res.status(500).json({ message: 'Error fetching companies' });
        }
    }),
    deleteCompany: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield business_1.default.findByIdAndDelete(id);
            res.json({ message: 'Company deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting company:', error);
            res.status(500).json({ message: 'Error deleting company' });
        }
    }),
    updateCompanyStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const company = yield business_1.default.findByIdAndUpdate(id, { status }, { new: true });
            res.json(company);
        }
        catch (error) {
            console.error('Error updating company status:', error);
            res.status(500).json({ message: 'Error updating company status' });
        }
    }),
    // User management
    getAllUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield user_model_1.User.find()
                .select('firstName lastName email role status createdAt')
                .sort({ createdAt: -1 });
            res.json(users);
        }
        catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users' });
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield user_model_1.User.findByIdAndDelete(id);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    }),
    updateUserStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const user = yield user_model_1.User.findByIdAndUpdate(id, { status }, { new: true });
            res.json(user);
        }
        catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({ message: 'Error updating user status' });
        }
    })
};
