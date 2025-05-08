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
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'business' | 'customer';
  status: 'active' | 'inactive';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  resetToken?: string;
  resetTokenExpires?: Date;
  businessName?: string;
  businessType?: string;
  location?: {
    address: string;
    city: string;
    postcode: string;
  };
  businessDescription?: string;
  avatar?: string;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/';

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
    enum: ['admin', 'business', 'customer'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  lastLogin: {
    type: Date,
  },
  resetToken: String,
  resetTokenExpires: Date,
  businessName: {
    type: String,
    required: function(this: IUser) { return this.role === 'business'; },
    trim: true,
  },
  businessType: {
    type: String,
    enum: BUSINESS_TYPES,
    required: function(this: IUser) { return this.role === 'business'; },
  },
  location: {
    address: { type: String, required: function(this: IUser) { return this.role === 'business'; } },
    city: { type: String, required: function(this: IUser) { return this.role === 'business'; } },
    postcode: { type: String, required: function(this: IUser) { return this.role === 'business'; } },
  },
  businessDescription: {
    type: String,
    required: false
  },
  avatar: {
    type: String,
    default: function(this: IUser) {
      const name = encodeURIComponent(`${this.firstName || ''} ${this.lastName || ''}`.trim());
      return `${DEFAULT_AVATAR}?name=${name}&background=random&size=128`;
    }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
export { BUSINESS_TYPES };