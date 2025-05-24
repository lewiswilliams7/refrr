import axios from 'axios';
import config from '../config';
import { RegisterData, LoginData, AuthResponse } from '../types/auth';
import { getToken } from '../utils/auth';

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure baseURL is used
    if (config.baseURL && !config.url?.startsWith('http')) {
      config.url = `${config.baseURL}${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export interface RegisterCustomerData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Campaign {
  _id: string;
  businessId: string;
  title: string;
  description?: string;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  rewardDescription: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  showRewardDisclaimer: boolean;
  rewardDisclaimerText: string;
  requireBookingConfirmation: boolean;
  expirationDate?: string;
  startDate?: string;
  endDate: string;
  maxReferrals?: number;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  termsAndConditions?: string;
  targetAudience?: {
    ageRange?: [number, number];
    gender?: string[];
    location?: string[];
  };
  analytics: {
    totalReferrals: number;
    successfulReferrals: number;
    conversionRate: number;
    rewardRedemptions: number;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login: async (data: LoginData) => {
    console.log('Making login API call with data:', { email: data.email });
    try {
      const response = await api.post(`${config.apiUrl}/auth/customer/login`, data);
      console.log('Login API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('Registering user with data:', data);
      const response = await api.post(`${config.apiUrl}/auth/register`, data);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  registerBusiness: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('Registering business with data:', data);
      const response = await api.post(`${config.apiUrl}/auth/register/business`, data);
      console.log('Business registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Business registration error:', error);
      throw error;
    }
  },

  registerCustomer: async (data: RegisterCustomerData) => {
    try {
      console.log('Registering customer with data:', data);
      const response = await api.post(`${config.apiUrl}/auth/customer/register`, data);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get(`${config.apiUrl}/auth/me`);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.get(`${config.apiUrl}/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await api.post(`${config.apiUrl}/auth/resend-verification`, { email });
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  deleteUser: async (email: string) => {
    try {
      console.log('Deleting user with email:', email);
      const response = await api.post(`${config.apiUrl}/auth/delete-user`, { email });
      console.log('Delete user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },
};

export const businessApi = {
  getPublicBusinesses: async () => {
    const response = await api.get('/business/public');
    return response.data;
  },

  getPublicBusiness: async (id: string) => {
    const response = await api.get(`/business/public/${id}`);
    return response.data;
  },

  getBusinessProfile: async () => {
    const response = await api.get('/business/profile');
    return response.data;
  },

  updateBusinessProfile: async (data: any) => {
    const response = await api.put('/business/profile', data);
    return response.data;
  },

  getBusinessCampaigns: async () => {
    const response = await api.get('/business/campaigns');
    return response.data;
  },

  getBusinessAnalytics: async () => {
    const response = await api.get('/business/analytics');
    return response.data;
  }
};

export const campaignApi = {
  create: async (data: Partial<Campaign>) => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/campaigns/business');
    return response.data;
  },

  listPublic: async () => {
    const response = await api.get('/campaigns/public');
    return response.data;
  },

  getPublic: async (id: string) => {
    const response = await api.get(`/campaigns/public/${id}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Campaign>) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await api.put(`/campaigns/${id}/toggle`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/customer/analytics');
    return response.data;
  },

  generateReferralLink: async (campaignId: string, data: { referrerEmail: string }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Generating referral link:', {
      campaignId,
      referrerEmail: data.referrerEmail
    });

    try {
      const response = await api.post(`/referrals/generate/${campaignId}`, {
        referrerEmail: data.referrerEmail
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Referral link generated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error generating referral link:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};

export default api;