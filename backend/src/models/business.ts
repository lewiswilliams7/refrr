import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  description: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  analytics: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalReferrals: number;
    completedReferrals: number;
  };
}

const businessSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true,
    enum: ['barber', 'sunbed', 'salon', 'spa', 'other']
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postcode: {
      type: String,
      required: true
    }
  },
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    website: {
      type: String,
      required: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  analytics: {
    totalCampaigns: {
      type: Number,
      default: 0
    },
    activeCampaigns: {
      type: Number,
      default: 0
    },
    totalReferrals: {
      type: Number,
      default: 0
    },
    completedReferrals: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

export default mongoose.model<IBusiness>('Business', businessSchema);