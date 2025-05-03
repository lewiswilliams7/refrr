"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Referral = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const referralSchema = new mongoose_1.default.Schema({
    campaignId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    businessId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });
// Add virtual population for campaign details
referralSchema.virtual('campaign', {
    ref: 'Campaign',
    localField: 'campaignId',
    foreignField: '_id',
    justOne: true
});
const Referral = mongoose_1.default.model('Referral', referralSchema);
exports.Referral = Referral;
exports.default = Referral;
