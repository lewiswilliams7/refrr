import { Request } from 'express';
import { Types } from 'mongoose';

interface User {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'business' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  businessName?: string;
  businessType?: string;
  location?: {
    address: string;
    city: string;
    postcode: string;
  };
  businessDescription?: string;
  avatar?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
  body: any;
  params: {
    [key: string]: string;
  };
  headers: {
    [key: string]: string | string[] | undefined;
  };
  query: {
    [key: string]: string | string[] | undefined;
  };
  cookies: {
    [key: string]: string;
  };
} 