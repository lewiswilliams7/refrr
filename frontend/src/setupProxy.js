const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      ws: false,
      xfwd: true,
      credentials: true,
      onProxyReq: (proxyReq, req, res) => {
        // Log the original request
        console.log('Original request:', {
          method: req.method,
          url: req.url,
          headers: req.headers
        });

        // Log the proxied request
        console.log('Proxied request:', {
          method: proxyReq.method,
          path: proxyReq.path,
          headers: proxyReq.getHeaders()
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log the proxy response
        console.log('Proxy response:', {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers
        });
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ message: 'Proxy error', error: err.message });
      }
    })
  );
}; 