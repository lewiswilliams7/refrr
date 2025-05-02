import { Request } from 'express';

export interface AuthRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  body: any;
  params: any;
  headers: any;
  query: any;
  cookies: any;
  [key: string]: any;
} 