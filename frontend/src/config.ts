interface Config {
  apiUrl: string;
  environment: 'development' | 'production';
  isDevelopment: boolean;
}

// Helper to determine if we're in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Get the API URL from environment or use defaults
const getApiUrl = () => {
  // First try environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Then try window.location for production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // If we're on the production domain, use the same domain for API
    return `https://${hostname.replace('www.', '')}`;
  }

  // Fallback to hardcoded production URL
  return 'https://refrr-backend.onrender.com';
};

const config: Config = {
  apiUrl: getApiUrl(),
  environment: process.env.NODE_ENV as 'development' | 'production',
  isDevelopment,
};

// Log configuration in development
if (isDevelopment) {
  console.log('API Configuration:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
    env: process.env.REACT_APP_API_URL,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  });
}

export default config; 