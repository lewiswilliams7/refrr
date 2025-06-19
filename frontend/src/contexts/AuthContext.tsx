import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'business' | 'customer') => Promise<User>;
  register: (email: string, password: string, userData: any) => Promise<User>;
  logout: () => void;
  setUserFromResponse: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const user = response.data;
          localStorage.setItem('userEmail', user.email);
          setUser(user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: 'business' | 'customer'): Promise<User> => {
    try {
      const endpoint = role === 'customer' 
        ? '/api/auth/customer/login'
        : '/api/auth/business/login';

      const response = await api.post(endpoint, {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: any): Promise<User> => {
    try {
      const endpoint = userData.role === 'customer' 
        ? '/api/auth/customer/register'
        : '/api/auth/register';

      const response = await api.post(endpoint, {
        email,
        password,
        ...userData
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const setUserFromResponse = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', user.email);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      login, 
      register, 
      logout,
      setUserFromResponse
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 