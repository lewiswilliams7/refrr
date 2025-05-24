import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;
  businessName: string;
  businessType: string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
  status: 'pending' | 'active' | 'suspended';
  website?: string;
  description?: string;
  logo?: string;
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
  email: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String, required: true }
  },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  website: { type: String },
  description: { type: String },
  logo: { type: String },
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