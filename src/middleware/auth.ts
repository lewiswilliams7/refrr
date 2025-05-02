import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'YS9XaEpwNtaGJ5rl';

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

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.toString().split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string; email: string; role?: string };
    // Create a partial user object that matches the User type
    const user: Partial<User> = {
      _id: new mongoose.Types.ObjectId(decoded._id),
      email: decoded.email,
      role: decoded.role as 'business' | 'customer' | 'admin'
    };
    req.user = user as User;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
};