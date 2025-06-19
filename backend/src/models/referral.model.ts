import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReferral {
  businessId: Types.ObjectId;
  campaignId: Types.ObjectId;
  referrerEmail: string;
  code: string;
  referredEmail: string;
  referredName?: string;
  referredPhone?: string;
  status: 'pending' | 'completed' | 'expired';
  trackingData?: {
    lastViewed: Date;
    viewCount: number;
  };
  createdAt: Schema.Types.Date;
  updatedAt: Schema.Types.Date;
}

const referralSchema = new Schema<IReferral>({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  referrerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  referredEmail: {
    type: String,
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
  trackingData: {
    lastViewed: { type: Date, default: Date.now },
    viewCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Check if model exists before creating
export const Referral = mongoose.models.Referral || mongoose.model<IReferral>('Referral', referralSchema); 