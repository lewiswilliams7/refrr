import { BusinessType } from './business';

export interface RegisterData {
  email: string;
  password: string;
  businessName: string;
  firstName: string;
  lastName: string;
  businessType: BusinessType | string;
  location: {
    address: string;
    city: string;
    postcode: string;
  };
  businessDescription?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
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
  };
} 