const express = require('express');
const path = require('path');
const app = express();

// Log environment variables
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

console.log('Starting server...');
console.log('Current directory:', __dirname);
console.log('Build path:', path.join(__dirname, 'build'));

// Serve static files from the build directory
const buildPath = path.join(__dirname, 'build');
console.log('Serving static files from:', buildPath);

// Ensure the build directory exists
if (!require('fs').existsSync(buildPath)) {
  console.error('Build directory does not exist! Please run npm run build first.');
  process.exit(1);
}

// Serve static files
app.use(express.static(buildPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000
  });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Enhanced port handling
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Attempting to start server on port ${port}`);
console.log('Process environment:', process.env);

// Start the server with enhanced error handling
const server = app.listen(port, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server is running and bound to ${address.address}:${address.port}`);
  console.log('Server address details:', {
    address: address.address,
    port: address.port,
    family: address.family
  });
  
  // Log that we're ready to accept connections
  console.log('Server is ready to accept connections');
});

// Handle server errors with more detailed logging
server.on('error', (error) => {
  console.error('Server error:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  });
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    console.error('Current process:', process.pid);
    process.exit(1);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 