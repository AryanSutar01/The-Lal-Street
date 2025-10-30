// server/server.js

// Import necessary packages
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Loads .env variables
const calculatorRoutes = require('./routes/calculator.routes.js');
const logger = require('./utils/logger');

// Initialize the express app
const app = express();

// Track server stats
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

// --- Middlewares ---
// CORS Configuration - allows frontend to connect from different domain
// In production, set ALLOWED_ORIGINS env variable
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// This middleware allows our server to understand JSON data sent in request bodies.
// We'll need this for our calculator forms later.
app.use(express.json());

// Request counter middleware
app.use((req, res, next) => {
  requestCount++;
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) errorCount++;
    return originalSend.apply(res, arguments);
  };
  next();
});

// --- Rate Limiting Configuration ---
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs per IP
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Skip rate limiting for health check
  skip: (req) => req.path === '/api/health'
});

// More strict rate limit for expensive calculator operations
const calculatorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Max 20 calculations per 5 minutes
  message: {
    status: 429,
    message: 'Too many calculations, please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Apply stricter limits to calculator routes
app.use('/api/calculator', calculatorLimiter);

app.use('/api/calculator', calculatorRoutes);

// --- Routes ---
const fundsRoutes = require('./routes/funds.routes.js');
app.use('/api/funds', fundsRoutes);

// Enhanced health check route with server statistics
app.get('/api/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  
  res.json({ 
    status: 'ok',
    message: 'Backend server is running successfully!',
    uptime: `${uptime}s`,
    timestamp: new Date().toISOString(),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
    },
    stats: {
      totalRequests: requestCount,
      errorCount: errorCount,
      successRate: requestCount > 0 
        ? ((requestCount - errorCount) / requestCount * 100).toFixed(2) + '%' 
        : '100%'
    }
  });
});




// --- Start the Server ---
// Get the port from the .env file, or default to 5000
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// --- Graceful Shutdown Handlers ---
const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    logger.info('Cleaning up resources...');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle various termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection, just log it
});