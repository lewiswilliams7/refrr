import mongoose, { Document, Schema, Types, HydratedDocument } from 'mongoose';
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

interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'business' | 'customer';
  status: 'active' | 'inactive';
  isVerified: boolean;
  createdAt: Schema.Types.Date;
  updatedAt: Schema.Types.Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  resetToken?: string;
  verificationToken?: string;
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

type IUserDocument = HydratedDocument<IUser>;

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
  resetToken: {
    type: String,
  },
  verificationToken: {
    type: String,
  },
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
}, { 
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return next();
  }
  
  try {
    console.log('Starting password hash in pre-save hook');
    console.log('Password length:', this.password.length);
    
    // Validate password length
    if (this.password.length < 6) {
      console.error('Password too short:', this.password.length);
      return next(new Error('Password must be at least 6 characters long'));
    }
    
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated');
    
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    
    next();
  } catch (error) {
    console.error('Error in password hashing:', error);
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log('Starting password comparison');
    console.log('Candidate password length:', candidatePassword.length);
    
    if (!candidatePassword || candidatePassword.length < 6) {
      console.error('Invalid candidate password');
      return false;
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

export const User = mongoose.model<IUser>('User', userSchema);
export type { IUser, IUserDocument };
export { BUSINESS_TYPES };