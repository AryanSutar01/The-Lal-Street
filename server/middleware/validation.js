// server/middleware/validation.js

/**
 * Input validation middleware for API endpoints
 */

/**
 * Validates SIP calculation input
 */
const validateSIPInput = (req, res, next) => {
  const { totalInvestment, startDate, endDate, funds } = req.body;

  // Check required fields
  if (!totalInvestment || !startDate || !endDate || !funds) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: totalInvestment, startDate, endDate, funds'
    });
  }

  // Validate investment amount
  if (typeof totalInvestment !== 'number' || totalInvestment <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Investment amount must be a positive number'
    });
  }

  if (totalInvestment > 10000000) {
    return res.status(400).json({
      success: false,
      message: 'Investment amount cannot exceed ₹1 crore'
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Please use YYYY-MM-DD format.'
    });
  }

  if (start >= end) {
    return res.status(400).json({
      success: false,
      message: 'Start date must be before end date'
    });
  }

  const yearsDiff = (end - start) / (1000 * 60 * 60 * 24 * 365);
  if (yearsDiff > 30) {
    return res.status(400).json({
      success: false,
      message: 'Date range cannot exceed 30 years'
    });
  }

  // Validate funds array
  if (!Array.isArray(funds) || funds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Funds must be a non-empty array'
    });
  }

  if (funds.length > 10) {
    return res.status(400).json({
      success: false,
      message: 'Cannot compare more than 10 funds at once'
    });
  }

  // Validate fund weights
  const totalWeight = funds.reduce((sum, f) => sum + (f.weight || 0), 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    return res.status(400).json({
      success: false,
      message: `Fund weights must sum to 100% (current: ${totalWeight.toFixed(2)}%)`
    });
  }

  // Validate scheme codes
  for (const fund of funds) {
    if (!fund.schemeCode) {
      return res.status(400).json({
        success: false,
        message: 'Each fund must have a valid schemeCode'
      });
    }
  }

  next();
};

/**
 * Validates rolling returns input
 */
const validateRollingReturnsInput = (req, res, next) => {
  const { schemeCodes, windowDays } = req.body;

  if (!schemeCodes || !Array.isArray(schemeCodes) || schemeCodes.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'schemeCodes array is required and must not be empty'
    });
  }

  if (schemeCodes.length > 10) {
    return res.status(400).json({
      success: false,
      message: 'Cannot process more than 10 schemes at once'
    });
  }

  if (!windowDays || typeof windowDays !== 'number' || windowDays <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid windowDays (positive number) is required'
    });
  }

  if (windowDays > 3650) {
    return res.status(400).json({
      success: false,
      message: 'Window days cannot exceed 10 years (3650 days)'
    });
  }

  next();
};

module.exports = {
  validateSIPInput,
  validateRollingReturnsInput
};





