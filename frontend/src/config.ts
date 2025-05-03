interface Config {
  apiUrl: string;
  environment: 'development' | 'production';
}

const config: Config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  environment: process.env.NODE_ENV as 'development' | 'production'
};

export default config; 