import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

const BUSINESS_TYPES = [
  'Barber',
  'Hair Salon',
  'Beauty Salon',
  'Nail Salon',
  'Spa',
  'Tanning Salon',
  'Gym',
  'Personal Trainer',
  'Restaurant',
  'Cafe',
  'Bar',
  'Retail Store',
  'Other'
] as const;

export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'business' | 'customer' | 'admin';
  businessName?: string;
  businessType?: string;
  location?: {
    address: string;
    city: string;
    postcode: string;
  };
  businessDescription?: string;
}

export interface User extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['business', 'customer', 'admin'],
    default: 'business',
  },
  businessName: {
    type: String,
    required: function() { return this.role === 'business'; },
    trim: true,
  },
  businessType: {
    type: String,
    enum: BUSINESS_TYPES,
    required: function() { return this.role === 'business'; },
  },
  location: {
    address: { type: String, required: function() { return this.role === 'business'; } },
    city: { type: String, required: function() { return this.role === 'business'; } },
    postcode: { type: String, required: function() { return this.role === 'business'; } },
  },
  businessDescription: {
    type: String,
    required: false
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<User>('User', userSchema);
export { BUSINESS_TYPES };