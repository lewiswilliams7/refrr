interface FeatureFlags {
  [key: string]: boolean;
}

const features: FeatureFlags = {
  // Enable/disable features based on environment
  leaderboard: process.env.REACT_APP_FEATURE_LEADERBOARD === 'true',
  analytics: process.env.REACT_APP_FEATURE_ANALYTICS === 'true',
  notifications: process.env.REACT_APP_FEATURE_NOTIFICATIONS === 'true',
  // Add more features as needed
};

export const isFeatureEnabled = (featureName: string): boolean => {
  return features[featureName] || false;
};

export default features; 