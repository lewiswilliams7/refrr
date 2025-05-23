import mongoose, { Document, Schema, Types } from 'mongoose';
import { IBusiness } from './business.model';

export interface ICampaign extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  businessId: Types.ObjectId;
  business?: IBusiness;
  status: 'draft' | 'active' | 'inactive' | 'completed' | 'paused';
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  showRewardDisclaimer: boolean;
  rewardDisclaimerText?: string;
  tags: string[];
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
    totalReferrals: number;
    successfulReferrals: number;
    rewardRedemptions: number;
    conversionRate: number;
  };
  expirationDate?: Date;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    status: { type: String, enum: ['draft', 'active', 'inactive', 'completed', 'paused'], default: 'draft' },
    rewardType: { type: String, enum: ['percentage', 'fixed'], required: true },
    rewardValue: { type: Number, required: true },
    rewardDescription: { type: String, required: true },
    showRewardDisclaimer: { type: Boolean, default: false },
    rewardDisclaimerText: { type: String },
    tags: [{ type: String }],
    analytics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      totalReferrals: { type: Number, default: 0 },
      successfulReferrals: { type: Number, default: 0 },
      rewardRedemptions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    },
    expirationDate: { type: Date },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
export type CampaignDocument = ICampaign;