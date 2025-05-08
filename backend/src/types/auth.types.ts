import { Request } from 'express';
import { ParsedQs } from 'qs';

export interface AuthRequest extends Omit<Request, 'query'> {
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
    [key: string]: string | string[] | ParsedQs | ParsedQs[] | undefined;
  };
  cookies: {
    [key: string]: string;
  };
} 