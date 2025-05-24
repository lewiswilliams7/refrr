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
  expirationDate?: Schema.Types.Date;
  startDate: Schema.Types.Date;
  endDate: Schema.Types.Date;
  createdAt: Schema.Types.Date;
  updatedAt: Schema.Types.Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    status: { type: String, enum: ['draft', 'active', 'inactive', 'completed', 'paused'], default: 'draft' },
    rewardType: { type: String, enum: ['percentage', 'fixed'], required: true },
    rewardValue: { type: Number, required: true, min: 0 },
    rewardDescription: { type: String, trim: true },
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
    expirationDate: { type: Schema.Types.Date },
    startDate: { type: Schema.Types.Date, required: true },
    endDate: { type: Schema.Types.Date, required: true }
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
export type CampaignDocument = ICampaign;