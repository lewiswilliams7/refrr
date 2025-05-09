interface Config {
  apiUrl: string;
  environment: 'development' | 'production';
}

const config: Config = {
  apiUrl: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://refrr-backend.onrender.com' : 'http://localhost:5000'),
  environment: process.env.NODE_ENV as 'development' | 'production'
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    apiUrl: config.apiUrl,
    environment: config.environment,
    env: process.env.REACT_APP_API_URL
  });
}

export default config; 