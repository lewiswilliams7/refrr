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

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something broke!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files from the build directory
const buildPath = path.join(__dirname, 'build');
console.log('Serving static files from:', buildPath);

// Ensure the build directory exists
if (!require('fs').existsSync(buildPath)) {
  console.error('Build directory does not exist! Please run npm run build first.');
  process.exit(1);
}

app.use(express.static(buildPath));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  console.log('Serving index.html for route:', req.url);
  res.sendFile(path.join(buildPath, 'index.html'));
});

const port = process.env.PORT || 3000;
console.log(`Attempting to start server on port ${port}`);

// Start the server
const server = app.listen(port, '0.0.0.0', (error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  const address = server.address();
  console.log(`Server is running on port ${port}`);
  console.log('Server address:', address);
  console.log('Server is listening on:', `http://0.0.0.0:${port}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  }
}); 