import mongoose, { Document } from 'mongoose';

export interface ICustomer {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingConsent: boolean;
  };
  referralStats: {
    totalReferrals: number;
    successfulReferrals: number;
    rewardsEarned: number;
    lastReferralDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerDocument extends Omit<ICustomer, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const customerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    postcode: String,
    country: String
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingConsent: {
      type: Boolean,
      default: false
    }
  },
  referralStats: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    successfulReferrals: {
      type: Number,
      default: 0
    },
    rewardsEarned: {
      type: Number,
      default: 0
    },
    lastReferralDate: Date
  }
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model<CustomerDocument>('Customer', customerSchema);

export default Customer; 