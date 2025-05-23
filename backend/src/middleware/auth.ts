import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Types } from 'mongoose';
import { JwtPayload } from '../utils/jwt';

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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
debug('Using JWT secret:', { hasEnvSecret: !!process.env.JWT_SECRET });

export interface AuthRequest extends Request {
  user?: {
    userId: Types.ObjectId;
    email: string;
    role?: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: Types.ObjectId;
        email: string;
        role?: string;
      };
    }
  }
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    debug('🔐 Authenticating request:', {
      method: req.method,
      url: req.url,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined
      }
    });

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      debug('❌ No token provided');
      res.status(401).json({ message: 'No authentication token, access denied' });
      return;
    }

    debug('🔑 Verifying token');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    debug('✅ Token decoded:', decoded);

    const user = await User.findById(decoded.userId).select('-password');
    debug('👤 User found:', user ? { id: user._id, email: user.email, role: user.role } : null);

    if (!user) {
      debug('❌ User not found');
      res.status(401).json({ message: 'Token is invalid' });
      return;
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    debug('✅ Authentication successful');
    next();
  } catch (err) {
    error('❌ Authentication error', err);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Access denied' });
    return;
  }
  next();
};