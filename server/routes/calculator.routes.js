// server/routes/calculator.routes.js
const express = require('express');
const router = express.Router();

const { handleSipCalculation, handleRollingReturns } = require('../controllers/calculator.controller.js');
const { validateSIPInput, validateRollingReturnsInput } = require('../middleware/validation.js');

// This is our main endpoint with validation
router.post('/sip', validateSIPInput, handleSipCalculation);

// Rolling returns endpoint with validation
router.post('/rolling-returns', validateRollingReturnsInput, handleRollingReturns);

module.exports = router;