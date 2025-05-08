const express = require('express');
const path = require('path');
const app = express();

console.log('Starting server...');
console.log('Current directory:', __dirname);
console.log('Build path:', path.join(__dirname, 'build'));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something broke!');
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  console.log('Serving index.html for route:', req.url);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API URL:', process.env.REACT_APP_API_URL);
}); 