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

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  businessName?: string;
  firstName: string;
  lastName: string;
  businessType?: typeof BUSINESS_TYPES[number];
  location?: {
    address: string;
    city: string;
    postcode: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  businessDescription?: string;
  role: 'admin' | 'business' | 'customer';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
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
  businessName: {
    type: String,
    required: function() { return this.role === 'business'; },
    trim: true,
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
  businessType: {
    type: String,
    enum: BUSINESS_TYPES,
    required: function() { return this.role === 'business'; },
  },
  location: {
    address: { type: String, required: function() { return this.role === 'business'; } },
    city: { type: String, required: function() { return this.role === 'business'; } },
    postcode: { type: String, required: function() { return this.role === 'business'; } },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  businessDescription: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['admin', 'business', 'customer'],
    default: 'business',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
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
    return false;
  }
};

export const User = mongoose.model<IUser>('User', userSchema);
export { BUSINESS_TYPES };