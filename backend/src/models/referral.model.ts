import mongoose, { Document, Schema } from 'mongoose';
import { Business } from './business.model';
import { Campaign } from './campaign.model';

export interface IReferral extends Document {
  businessId: mongoose.Types.ObjectId;
  business?: Business;
  campaignId: mongoose.Types.ObjectId;
  campaign?: Campaign;
  referrerEmail: string;
  referredEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  code: string;
  trackingData?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  referrerEmail: { type: String, required: true },
  referredEmail: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  code: { type: String, required: true, unique: true },
  trackingData: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    timestamp: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

export const Referral = mongoose.model<IReferral>('Referral', referralSchema); 