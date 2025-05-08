import mongoose, { Document, Schema, Types } from 'mongoose';
import { IBusiness } from './business.model';
import { ICampaign } from './campaign.model';

export interface IReferral extends Document {
  businessId: Types.ObjectId;
  campaignId: Types.ObjectId;
  referrerEmail: string;
  referredEmail?: string;
  code: string;
  status: 'pending' | 'approved' | 'rejected';
  trackingData?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    referrerEmail: { type: String, required: true },
    referredEmail: { type: String },
    code: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    trackingData: {
      ip: String,
      userAgent: String,
      referrer: String,
      timestamp: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

export const Referral = mongoose.model<IReferral>('Referral', referralSchema); 