import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  industry: string;
  website?: string;
  description?: string;
  logo?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo?: {
    email: string;
    phone: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  settings?: {
    referralReward: number;
    minimumPayout: number;
    autoApprove: boolean;
    notificationEmail: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  industry: { type: String, required: true },
  website: { type: String },
  description: { type: String },
  logo: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  contactInfo: {
    email: { type: String },
    phone: { type: String }
  },
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    linkedin: { type: String }
  },
  settings: {
    referralReward: { type: Number, default: 10 },
    minimumPayout: { type: Number, default: 50 },
    autoApprove: { type: Boolean, default: false },
    notificationEmail: { type: String }
  }
}, {
  timestamps: true
});

export const Business = mongoose.model<IBusiness>('Business', businessSchema); 