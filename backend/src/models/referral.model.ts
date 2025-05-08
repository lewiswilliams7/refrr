import mongoose, { Document } from 'mongoose';

export interface IReferral {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  referrerEmail: string;
  referredEmail?: string;
  code: string;
  status: 'pending' | 'approved' | 'rejected';
  trackingData?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralDocument extends Omit<IReferral, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const referralSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  referrerEmail: {
    type: String,
    required: true
  },
  referredEmail: String,
  code: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  trackingData: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, { timestamps: true });

const Referral = mongoose.models.Referral || mongoose.model<ReferralDocument>('Referral', referralSchema);

export default Referral; 