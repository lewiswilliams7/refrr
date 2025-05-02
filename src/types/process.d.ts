declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM?: string;
    FRONTEND_URL: string;
    API_URL: string;
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX_REQUESTS: string;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    ADMIN_FIRST_NAME: string;
    ADMIN_LAST_NAME: string;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
  exit(code?: number): void;
}; 