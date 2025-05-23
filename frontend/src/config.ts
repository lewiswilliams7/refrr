import axios from 'axios';

interface Config {
  apiUrl: string;
  environment: 'development' | 'production';
  isDevelopment: boolean;
}

// Helper to determine if we're in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Force the API URL to be the correct one
const config: Config = {
  apiUrl: isDevelopment 
    ? 'http://localhost:5000'
    : 'https://refrr.onrender.com',
  environment: isDevelopment ? 'development' : 'production',
  isDevelopment,
};

// Log configuration in both development and production
console.log('API Configuration:', {
  apiUrl: config.apiUrl,
  environment: config.environment,
  isDevelopment,
  nodeEnv: process.env.NODE_ENV,
});

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default config; 