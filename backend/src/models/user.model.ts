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

interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'business' | 'customer';
  status: 'active' | 'inactive';
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  resetToken?: string;
  resetTokenExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
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

const userSchema = new Schema<IUserDocument>({
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
    default: 'customer',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpires: {
    type: Date,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  },
  businessName: {
    type: String,
    required: function(this: IUserDocument) { return this.role === 'business'; },
    trim: true,
  },
  businessType: {
    type: String,
    enum: BUSINESS_TYPES,
    required: function(this: IUserDocument) { return this.role === 'business'; },
  },
  location: {
    address: { type: String, required: function(this: IUserDocument) { return this.role === 'business'; } },
    city: { type: String, required: function(this: IUserDocument) { return this.role === 'business'; } },
    postcode: { type: String, required: function(this: IUserDocument) { return this.role === 'business'; } },
  },
  businessDescription: {
    type: String,
    required: false
  },
  avatar: {
    type: String,
    default: function(this: IUserDocument) {
      const name = encodeURIComponent(`${this.firstName || ''} ${this.lastName || ''}`.trim());
      return `${DEFAULT_AVATAR}?name=${name}&background=random&size=128`;
    }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Hashing password in pre-save hook');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  console.log('Comparing passwords in comparePassword method');
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('Password comparison result:', isMatch);
  return isMatch;
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
export type IUser = IUserDocument;
export { BUSINESS_TYPES };