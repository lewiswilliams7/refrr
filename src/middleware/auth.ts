import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/user.model';
import mongoose from 'mongoose';

// Debug logging utility
const debug = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔍 ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Error logging utility
const error = (message: string, err: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`, {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
    raw: err
  });
};

// Simple request interface
export interface AuthRequest extends Request {
  user?: UserDocument;
}

// JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';
debug('Using JWT secret:', { hasEnvSecret: !!process.env.JWT_SECRET });

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    // Get the authorization header as a string
    let authToken: string;
    if (typeof authHeader === 'string') {
      authToken = authHeader;
    } else if (Array.isArray(authHeader)) {
      authToken = authHeader[0] || '';
    } else {
      return res.status(401).json({ message: 'Invalid authorization header' });
    }

    if (!authToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    // Split the token and validate format
    const [bearer, token] = authToken.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    
    if (!decoded._id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};