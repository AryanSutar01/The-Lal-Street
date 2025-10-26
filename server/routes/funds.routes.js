// server/routes/funds.routes.js
const express = require('express');
const router = express.Router();

// --- IMPORTS ---
const { getHistoricalNav } = require('../services/navApi.service.js');
const { 
  handleFundSearch, 
  handleNavBucket  // Import our new handler
} = require('../controllers/funds.controller.js');

// --- ROUTES ---

// GET /api/funds/search
router.get('/search', handleFundSearch);

// POST /api/funds/get-nav-bucket
// This is our new "bucket" endpoint
router.post('/get-nav-bucket', handleNavBucket);

// Our original test route (can be kept or removed)
router.get('/test-nav', async (req, res) => {
  const TEST_SCHEME_CODE = '120549';
  try {
    const navData = await getHistoricalNav(TEST_SCHEME_CODE);
    res.json(navData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test NAV data.' });
  }
});

module.exports = router;