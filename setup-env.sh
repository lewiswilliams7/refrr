#!/bin/bash

# Create development environment file
cat > frontend/.env.development << EOL
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
REACT_APP_FEATURE_LEADERBOARD=true
REACT_APP_FEATURE_ANALYTICS=true
REACT_APP_FEATURE_NOTIFICATIONS=true
EOL

# Create staging environment file
cat > frontend/.env.staging << EOL
REACT_APP_API_URL=https://staging-api.refrr.com
REACT_APP_ENVIRONMENT=staging
REACT_APP_FEATURE_LEADERBOARD=true
REACT_APP_FEATURE_ANALYTICS=true
REACT_APP_FEATURE_NOTIFICATIONS=false
EOL

# Create production environment file
cat > frontend/.env.production << EOL
REACT_APP_API_URL=https://api.refrr.com
REACT_APP_ENVIRONMENT=production
REACT_APP_FEATURE_LEADERBOARD=false
REACT_APP_FEATURE_ANALYTICS=true
REACT_APP_FEATURE_NOTIFICATIONS=false
EOL

echo "Environment files created successfully!" 