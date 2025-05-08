import mongoose, { Document, Schema, Types } from 'mongoose';
import { IBusiness } from './business.model';

export interface ICampaign extends Document {
  title: string;
  description: string;
  businessId: Types.ObjectId;
  business?: IBusiness;
  status: 'active' | 'inactive' | 'completed' | 'paused';
  rewardType: string;
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
    conversionRate: number;
  };
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    status: { type: String, enum: ['active', 'inactive', 'completed', 'paused'], default: 'active' },
    rewardType: { type: String, required: true },
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
      conversionRate: { type: Number, default: 0 }
    },
    expirationDate: { type: Date }
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
export type CampaignDocument = ICampaign;