import mongoose, { Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IBusiness extends Document {
  _id: Types.ObjectId;
  businessName: string;
  businessType: string;
  email: string;
  password: string;
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
  userId: Types.ObjectId;
  analytics: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalReferrals: number;
    completedReferrals: number;
  };
}

const businessSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true,
    enum: ['barber', 'sunbed', 'salon', 'spa', 'other']
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

businessSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Business = mongoose.model<IBusiness>('Business', businessSchema);
export default Business;