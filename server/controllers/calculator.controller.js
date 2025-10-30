// server/controllers/calculator.controller.js
const { getHistoricalNav } = require('../services/navApi.service.js');
const { runPortfolioSipSimulation } = require('../logic/sipSimulator.js');
const { calculateRollingReturns } = require('../logic/financialCalculations.js');
const logger = require('../utils/logger');

/**
 * Handles the main Portfolio SIP Simulation request.
 */
const handleSipCalculation = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const inputs = req.body;

    logger.info(`SIP calculation request: ${inputs.funds?.length || 0} funds, ${inputs.startDate} to ${inputs.endDate}`);

    // 1. Get all scheme codes from the input
    const schemeCodes = inputs.funds.map(f => f.schemeCode);

    // 2. Fetch NAV data for all funds in parallel (uses our cache!)
    const navPromises = schemeCodes.map(code => getHistoricalNav(code));
    const allNavData = await Promise.all(navPromises);

    // 3. Check for failures
    const failedFunds = allNavData.filter(data => data === null);
    if (failedFunds.length === allNavData.length) {
      logger.warn('All NAV data requests failed');
      return res.status(503).json({ 
        message: 'Unable to fetch NAV data. External API may be down. Please try again later.' 
      });
    }
    
    if (failedFunds.length > 0) {
      logger.warn(`${failedFunds.length} out of ${allNavData.length} funds failed to fetch`);
    }
    
    // 4. Run the main simulation
    const result = runPortfolioSipSimulation(inputs, allNavData.filter(d => d !== null));
    
    const processingTime = Date.now() - startTime;
    logger.info(`SIP calculation completed in ${processingTime}ms`);
    
    // 5. Send the complete result back (raw result for backward compatibility)
    res.json(result);

  } catch (error) {
    logger.error('Error in SIP calculation:', error.message);
    logger.error(error.stack);
    res.status(500).json({ 
      message: 'An error occurred during calculation. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Handles rolling returns calculation request.
 */
const handleRollingReturns = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { schemeCodes, windowDays } = req.body;

    logger.info(`Rolling returns request: ${schemeCodes.length} schemes, ${windowDays} days window`);

    // Fetch NAV data for all schemes
    const navPromises = schemeCodes.map(code => getHistoricalNav(code));
    const allNavData = await Promise.all(navPromises);

    // Filter out failed requests
    const validNavData = allNavData.filter(data => data !== null);

    if (validNavData.length === 0) {
      logger.warn('No valid NAV data found for rolling returns');
      return res.status(503).json({ 
        message: 'No valid NAV data found. External API may be down.' 
      });
    }

    // Calculate rolling returns for each scheme
    const results = validNavData.map(navData => {
      const rollingData = calculateRollingReturns(navData.data, windowDays);
      
      if (!rollingData) {
        return {
          schemeCode: navData.meta.scheme_code,
          schemeName: navData.meta.scheme_name,
          error: 'Insufficient data for rolling returns calculation'
        };
      }

      return {
        schemeCode: navData.meta.scheme_code,
        schemeName: navData.meta.scheme_name,
        rollingReturns: rollingData.data,
        statistics: rollingData.statistics
      };
    });

    const processingTime = Date.now() - startTime;
    logger.info(`Rolling returns completed in ${processingTime}ms`);

    // Return result for backward compatibility
    res.json({
      windowDays,
      results,
      summary: {
        totalSchemes: results.length,
        successfulSchemes: results.filter(r => !r.error).length,
        failedSchemes: results.filter(r => r.error).length
      }
    });

  } catch (error) {
    logger.error('Error in rolling returns calculation:', error.message);
    logger.error(error.stack);
    res.status(500).json({ 
      message: 'An error occurred during rolling returns calculation.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleSipCalculation,
  handleRollingReturns,
};