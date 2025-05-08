import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string;
  description?: string;
  industry?: string;
  size?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    website: { type: String },
    logo: { type: String },
    description: { type: String },
    industry: { type: String },
    size: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export const Business = mongoose.model<IBusiness>('Business', businessSchema); 