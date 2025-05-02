import { Request } from 'express';

export interface AuthRequest extends Request {
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
  get(name: string): string | undefined;
  header(name: string): string | undefined;
} 