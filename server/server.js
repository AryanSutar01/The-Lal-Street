// server/server.js

// Import necessary packages
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads .env variables
const calculatorRoutes = require('./routes/calculator.routes.js');

// Initialize the express app
const app = express();

// --- Middlewares ---
// This is the most important part for connecting client and server.
// It allows our React app (running on a different port) to make requests to this server.
app.use(cors());

// This middleware allows our server to understand JSON data sent in request bodies.
// We'll need this for our calculator forms later.
app.use(express.json());

app.use('/api/calculator', calculatorRoutes);

// --- Routes ---
const fundsRoutes = require('./routes/funds.routes.js');
app.use('/api/funds', fundsRoutes);

// Our first "health check" route
app.get('/api/health', (req, res) => {
  // If this route is hit, send back a simple JSON response
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running successfully!' 
  });
});




// --- Start the Server ---
// Get the port from the .env file, or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});