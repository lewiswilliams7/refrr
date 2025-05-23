import { Document } from 'mongoose';

declare module 'mongoose' {
  interface Document {
    isVerified: boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date | string;
  }
} 