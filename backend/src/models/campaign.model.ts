import mongoose, { Document, Model } from 'mongoose';

export interface IBusiness {
  businessName: string;
  businessType: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
}

export interface ICampaign {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  showRewardDisclaimer: boolean;
  rewardDisclaimerText: string;
  requireBookingConfirmation: boolean;
  expirationDate?: Date;
  startDate?: Date;
  maxReferrals?: number;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  termsAndConditions?: string;
  targetAudience?: {
    ageRange?: [number, number];
    gender?: string[];
    location?: string[];
  };
  analytics: {
    totalReferrals: number;
    successfulReferrals: number;
    conversionRate: number;
    rewardRedemptions: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignDocument extends Omit<ICampaign, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const campaignSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  rewardType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  rewardValue: {
    type: Number,
    required: true
  },
  rewardDescription: {
    type: String,
    default: function(this: any) {
      return `${this.rewardValue}${this.rewardType === 'percentage' ? '% discount' : ' points reward'}`;
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  showRewardDisclaimer: {
    type: Boolean,
    default: false
  },
  rewardDisclaimerText: String,
  requireBookingConfirmation: {
    type: Boolean,
    default: false
  },
  expirationDate: Date,
  startDate: Date,
  maxReferrals: Number,
  category: String,
  tags: [String],
  imageUrl: String,
  termsAndConditions: String,
  targetAudience: {
    ageRange: [Number],
    gender: [String],
    location: [String]
  },
  analytics: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    successfulReferrals: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    rewardRedemptions: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, { timestamps: true });

// Update analytics before saving
campaignSchema.pre('save', function(this: any, next) {
  const totalReferrals = this.analytics?.totalReferrals || 0;
  const successfulReferrals = this.analytics?.successfulReferrals || 0;
  
  if (!this.analytics) {
    this.analytics = {};
  }
  
  this.analytics.conversionRate = totalReferrals > 0 
    ? (successfulReferrals / totalReferrals) * 100 
    : 0;
  
  this.analytics.lastUpdated = new Date();
  next();
});

// Create and export the model
const Campaign = mongoose.models.Campaign || mongoose.model<CampaignDocument>('Campaign', campaignSchema);

export default Campaign;