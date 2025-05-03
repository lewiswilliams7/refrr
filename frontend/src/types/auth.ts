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
    id: string;
    email: string;
    businessName?: string;
    firstName: string;
    lastName: string;
    businessType?: string;
    location?: {
      address: string;
      city: string;
      postcode: string;
    };
    businessDescription?: string;
  };
} 