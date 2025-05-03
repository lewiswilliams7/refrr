import mongoose from 'mongoose';

export interface ICampaign extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  businessId: mongoose.Types.ObjectId;
  showRewardDisclaimer?: boolean;
  rewardDisclaimerText?: string;
  tags?: string[];
  analytics?: {
    totalReferrals: number;
    conversionRate: number;
  };
  expirationDate?: Date;
}

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  rewardType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    required: true 
  },
  rewardValue: { type: Number, required: true },
  rewardDescription: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'completed'], 
    default: 'draft' 
  },
  businessId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  showRewardDisclaimer: { type: Boolean, default: false },
  rewardDisclaimerText: { type: String },
  tags: [{ type: String }],
  analytics: {
    totalReferrals: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  expirationDate: { type: Date }
}, { timestamps: true });

// Check if the model already exists before creating it
const Campaign = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', campaignSchema);

export default Campaign; 