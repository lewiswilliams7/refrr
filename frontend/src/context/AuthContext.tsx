import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { getToken, setToken, removeToken } from '../utils/auth';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  businessId?: string;
  businessName?: string;
  businessType?: string;
  businessLocation?: {
    city: string;
    state: string;
    country: string;
  };
  activeCampaigns?: {
    count: number;
    rewards: Array<{
      type: 'percentage' | 'fixed';
      value: number;
      description: string;
    }>;
  };
  avatar?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUser] = useState<User | null>(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Set up axios interceptor for token
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        if (isMounted) {
          setError('Failed to make request. Please try again.');
        }
        return Promise.reject(error);
      }
    );

    // Validate token on mount and periodically
    const validateToken = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (isMounted) {
          setUser(response.data);
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        if (isMounted) {
          logout();
          setError('Your session has expired. Please login again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    validateToken();
    const interval = setInterval(validateToken, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      isMounted = false;
      axios.interceptors.request.eject(interceptor);
      clearInterval(interval);
    };
  }, []);

  const login = (newToken: string, userData: User) => {
    try {
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setTokenState(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to save login information. Please try again.');
    }
  };

  const logout = () => {
    try {
      removeToken();
      localStorage.removeItem('user');
      setTokenState(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout properly. Please try again.');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user, 
        login, 
        logout, 
        isAuthenticated,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};