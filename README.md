# Refrr - Referral Management System

A full-stack application for managing business referrals and campaigns.

## Project Structure

```
.
├── backend/           # Backend API server
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── db/      # Database setup and migrations
│   │   ├── middleware/ # Express middleware
│   │   ├── models/  # Mongoose models
│   │   ├── routes/  # API routes
│   │   ├── types/   # TypeScript type definitions
│   │   └── utils/   # Utility functions
│   └── tests/       # Backend tests
└── frontend/         # Frontend React application
    ├── src/
    │   ├── components/ # React components
    │   ├── pages/    # Page components
    │   ├── services/ # API services
    │   └── utils/    # Utility functions
    └── tests/       # Frontend tests
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/refrr

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin-password
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email Service
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
```

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

### Running Tests

1. Backend tests:
```bash
cd backend
npm test
```

2. Frontend tests:
```bash
cd frontend
npm test
```

## API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password

### Campaign Endpoints

- GET `/api/campaigns` - Get all campaigns
- POST `/api/campaigns` - Create a new campaign
- GET `/api/campaigns/:id` - Get campaign by ID
- PUT `/api/campaigns/:id` - Update campaign
- DELETE `/api/campaigns/:id` - Delete campaign

### Referral Endpoints

- POST `/api/referrals` - Create a new referral
- GET `/api/referrals/:code` - Get referral by code
- POST `/api/referrals/:id/approve` - Approve referral
- POST `/api/referrals/:id/reject` - Reject referral

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Error handling middleware

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 