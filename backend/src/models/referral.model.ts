import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  referrerEmail: string;
  referredEmail?: string;
  code: string;
  status: 'pending' | 'approved' | 'rejected';
  trackingData?: {
    lastViewed: Date;
    viewCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  referrerEmail: { type: String, required: true },
  referredEmail: { type: String },
  code: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  trackingData: {
    lastViewed: { type: Date, default: Date.now },
    viewCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Check if model exists before creating
export const Referral = mongoose.models.Referral || mongoose.model<IReferral>('Referral', referralSchema); 