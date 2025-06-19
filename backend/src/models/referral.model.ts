import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReferral {
  campaignId: Types.ObjectId;
  referrerId: Types.ObjectId;
  referrerEmail: string;
  referredEmail: string;
  referredName?: string;
  referredPhone?: string;
  status: 'pending' | 'completed' | 'expired';
  lastViewed: Schema.Types.Date;
  rewardClaimed: boolean;
  createdAt: Schema.Types.Date;
  updatedAt: Schema.Types.Date;
}

const referralSchema = new Schema<IReferral>({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  referrerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referrerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  referredEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  referredName: {
    type: String,
    trim: true
  },
  referredPhone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  lastViewed: { type: Schema.Types.Date, default: Date.now },
  rewardClaimed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Check if model exists before creating
export const Referral = mongoose.models.Referral || mongoose.model<IReferral>('Referral', referralSchema); 