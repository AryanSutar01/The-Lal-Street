// server/middleware/auth.js
const logger = require('../utils/logger');

/**
 * Middleware to check admin authentication
 * Checks for admin token in Authorization header or query parameter
 */
const checkAdminAuth = (req, res, next) => {
  try {
    // Get token from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const tokenFromQuery = req.query.adminToken;
    
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (tokenFromQuery) {
      token = tokenFromQuery;
    }
    
    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
    
    if (!adminPassword) {
      logger.warn('Admin password not configured in environment variables');
      // In development, allow if NODE_ENV is not production
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Allowing admin access without password in development mode');
        return next();
      }
      return res.status(500).json({
        success: false,
        message: 'Admin authentication not configured. Please set ADMIN_PASSWORD environment variable.',
        error: 'ADMIN_PASSWORD environment variable is missing',
        hint: 'On Render: Dashboard > Your Service > Environment > Add ADMIN_PASSWORD variable. Set the same value in Vercel as VITE_ADMIN_PASSWORD.',
      });
    }
    
    // Simple token check - in production, use JWT or session tokens
    // For now, we'll use the password directly (not recommended for production)
    // In a real app, you'd verify a JWT token here
    
    // Check if token matches admin password
    if (!token || token !== adminPassword) {
      logger.warn(`Unauthorized admin access attempt from ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid admin token',
      });
    }
    
    // Token is valid, proceed
    next();
  } catch (error) {
    logger.error('Error in admin auth middleware:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = {
  checkAdminAuth,
};

