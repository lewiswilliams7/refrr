import { Request } from 'express';
import { Types } from 'mongoose';

interface User {
  _id: Types.ObjectId;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
  location?: {
    address: string;
    city: string;
    postcode: string;
  };
  businessDescription?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
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