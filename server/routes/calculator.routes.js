// server/routes/calculator.routes.js
const express = require('express');
const router = express.Router();

const { handleSipCalculation, handleRollingReturns } = require('../controllers/calculator.controller.js');

// This is our main endpoint
router.post('/sip', handleSipCalculation);

// Rolling returns endpoint
router.post('/rolling-returns', handleRollingReturns);

module.exports = router;