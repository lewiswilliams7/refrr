import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

interface JwtPayload {
  id: Types.ObjectId;
  role: string;
}

export const generateToken = (
  userId: Types.ObjectId,
  role: string,
  expiresIn: string | number = JWT_EXPIRES_IN
): string => {
  const payload: JwtPayload = { id: userId, role };
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}; 