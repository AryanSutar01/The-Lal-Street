// api/index.js - Vercel Serverless Function Entry Point

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import routes
const calculatorRoutes = require('../server/routes/calculator.routes.js');
const fundsRoutes = require('../server/routes/funds.routes.js');

// Initialize the express app
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rate Limiting Configuration ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs per IP
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});

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

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/calculator', calculatorLimiter);

// --- Routes ---
app.use('/api/calculator', calculatorRoutes);
app.use('/api/funds', fundsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Serverless API is running!',
    timestamp: new Date().toISOString()
  });
});

// Export the Express app for Vercel
module.exports = app;

