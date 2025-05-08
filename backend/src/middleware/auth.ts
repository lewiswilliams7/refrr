import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import mongoose from 'mongoose';
import { ParsedQs } from 'qs';

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
  user?: {
    userId: mongoose.Types.ObjectId;
    email: string;
    role?: string;
  };
}

// JWT secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';
debug('Using JWT secret:', { hasEnvSecret: !!process.env.JWT_SECRET });

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: mongoose.Types.ObjectId;
        email: string;
        role?: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Invalid token format' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret') as {
      userId: string;
      email: string;
      role?: string;
    };

    (req as AuthRequest).user = {
      userId: new mongoose.Types.ObjectId(decoded.userId),
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error: unknown) {
    console.error('Error in authenticateToken:', error);
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Access denied' });
    return;
  }
  next();
};