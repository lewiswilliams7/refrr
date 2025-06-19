const express = require('express');
const path = require('path');
const fs = require('fs');
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
if (!fs.existsSync(buildPath)) {
  console.error('Build directory does not exist! Please run npm run build first.');
  process.exit(1);
}

// Log build directory contents
console.log('Build directory contents:');
try {
  const buildContents = fs.readdirSync(buildPath);
  console.log('Files in build directory:', buildContents);
  
  if (fs.existsSync(path.join(buildPath, 'static'))) {
    const staticContents = fs.readdirSync(path.join(buildPath, 'static'));
    console.log('Static directory contents:', staticContents);
    
    if (fs.existsSync(path.join(buildPath, 'static', 'js'))) {
      const jsContents = fs.readdirSync(path.join(buildPath, 'static', 'js'));
      console.log('JS directory contents:', jsContents);
    }
  }
} catch (error) {
  console.error('Error reading build directory:', error);
}

// Serve static files with explicit MIME types
app.use(express.static(buildPath, {
  setHeaders: (res, filePath) => {
    console.log('Serving static file:', filePath);
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      console.log('Set JS content type for:', filePath);
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      console.log('Set CSS content type for:', filePath);
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
      console.log('Set JSON content type for:', filePath);
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000,
    buildPath: buildPath,
    buildExists: fs.existsSync(buildPath)
  });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  console.log('Serving index.html for route:', req.path);
  const indexPath = path.join(buildPath, 'index.html');
  console.log('Index file path:', indexPath);
  console.log('Index file exists:', fs.existsSync(indexPath));
  res.sendFile(indexPath);
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