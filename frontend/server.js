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

// Serve static files with explicit MIME types and caching headers
app.use(express.static(buildPath, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    console.log('Serving static file:', filePath);
    
    // Set explicit content types
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      console.log('Set JS content type for:', filePath);
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      console.log('Set CSS content type for:', filePath);
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      console.log('Set JSON content type for:', filePath);
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      console.log('Set HTML content type for:', filePath);
    }
    
    // Set CORS headers for all static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000,
    buildPath: buildPath,
    buildExists: fs.existsSync(buildPath),
    nodeEnv: process.env.NODE_ENV
  });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  console.log('Serving index.html for route:', req.path);
  const indexPath = path.join(buildPath, 'index.html');
  console.log('Index file path:', indexPath);
  console.log('Index file exists:', fs.existsSync(indexPath));
  
  if (!fs.existsSync(indexPath)) {
    console.error('Index.html not found!');
    res.status(404).send('Index.html not found');
    return;
  }
  
  res.sendFile(indexPath);
});

// Enhanced port handling
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Attempting to start server on port ${port}`);

// Start the server with enhanced error handling
const server = app.listen(port, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server is running and bound to ${address.address}:${address.port}`);
  console.log('Server is ready to accept connections');
});

// Handle server errors with more detailed logging
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
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