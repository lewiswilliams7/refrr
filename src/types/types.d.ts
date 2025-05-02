import { Request } from 'express';

interface User {
  id: string;
  email: string;
  role: string;
}

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