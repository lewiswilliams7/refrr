import { Request } from 'express';
import { ParsedQs } from 'qs';
import { Types } from 'mongoose';

export interface AuthRequest extends Omit<Request, 'query'> {
  user?: {
    userId: Types.ObjectId;
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