import mongoose, { Document } from 'mongoose';

export interface IBusiness {
  businessName: string;
  businessType: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
}

export interface ICampaign extends Document {
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

const campaignSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rewardType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  rewardValue: {
    type: Number,
    required: true,
    min: 0
  },
  rewardDescription: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  showRewardDisclaimer: {
    type: Boolean,
    default: true
  },
  rewardDisclaimerText: {
    type: String,
    default: 'Reward will be provided after the referred customer books with the business'
  },
  requireBookingConfirmation: {
    type: Boolean,
    default: true
  },
  expirationDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  maxReferrals: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  targetAudience: {
    ageRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 }
    },
    gender: [{
      type: String,
      enum: ['male', 'female', 'other']
    }],
    location: [{
      type: String,
      trim: true
    }]
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
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Add indexes for faster queries
campaignSchema.index({ businessId: 1, status: 1 });
campaignSchema.index({ expirationDate: 1 });
campaignSchema.index({ startDate: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ tags: 1 });

// Pre-save middleware to update analytics
campaignSchema.pre('save', function(next) {
  // Initialize analytics if it doesn't exist
  if (!this.analytics) {
    this.analytics = {
      totalReferrals: 0,
      successfulReferrals: 0,
      conversionRate: 0,
      rewardRedemptions: 0,
      lastUpdated: new Date()
    };
  }

  // Update conversion rate if referral counts have changed
  if (this.isModified('analytics.totalReferrals') || this.isModified('analytics.successfulReferrals')) {
    const totalReferrals = this.analytics.totalReferrals || 0;
    const successfulReferrals = this.analytics.successfulReferrals || 0;
    
    this.analytics.conversionRate = totalReferrals > 0 
      ? (successfulReferrals / totalReferrals) * 100 
      : 0;
    
    this.analytics.lastUpdated = new Date();
  }
  next();
});

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);