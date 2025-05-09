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

app.use(express.static(buildPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Enhanced port handling
const port = process.env.PORT || 3000;
console.log(`Attempting to start server on port ${port}`);
console.log('Process environment:', process.env);

// Start the server with enhanced error handling
const server = app.listen(port, () => {
  const address = server.address();
  console.log(`Server is running on port ${port}`);
  console.log('Server address:', address);
  console.log('Server is listening on:', `http://localhost:${port}`);
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