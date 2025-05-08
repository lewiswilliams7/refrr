import mongoose, { Document, Schema } from 'mongoose';
import { Business } from './business.model';

export interface ICampaign extends Document {
  name: string;
  description: string;
  businessId: mongoose.Types.ObjectId;
  business?: Business;
  startDate: Date;
  endDate: Date;
  reward: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  status: 'active' | 'inactive' | 'completed';
  terms: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reward: {
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true }
  },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  terms: { type: String, required: true }
}, {
  timestamps: true
});

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);