import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
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