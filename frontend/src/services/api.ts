import axios from 'axios';
import config from '../config';
import { RegisterData, LoginData, AuthResponse } from '../types/auth';
import { getToken } from '../utils/auth';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL,
    });

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
      }
    });

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Authentication failed - please login again'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error - please check your connection'));
    }

    // Handle server errors
    if (error.response.status >= 500) {
      return Promise.reject(new Error('Server error - please try again later'));
    }

    // Handle validation errors
    if (error.response.status === 400) {
      const message = error.response.data?.message || 'Invalid request';
      return Promise.reject(new Error(message));
    }

    // Handle other errors
    const message = error.response.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
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
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  registerCustomer: async (data: RegisterCustomerData) => {
    try {
      const response = await api.post('/auth/register/customer', data);
      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error) {
      console.error('Customer registration error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const campaignApi = {
  create: async (data: Partial<Campaign>) => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/campaigns');
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

  update: async (id: string, data: Partial<Campaign>) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`);
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
          Authorization: `Bearer ${token}`
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