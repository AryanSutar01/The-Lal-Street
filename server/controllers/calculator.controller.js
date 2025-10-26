// server/controllers/calculator.controller.js
const { getHistoricalNav } = require('../services/navApi.service.js');
const { runPortfolioSipSimulation } = require('../logic/sipSimulator.js');
const { calculateRollingReturns } = require('../logic/financialCalculations.js');

/**
 * Handles the main Portfolio SIP Simulation request.
 */
const handleSipCalculation = async (req, res) => {
  try {
    const inputs = req.body;

    // Basic validation
    if (!inputs.funds || inputs.funds.length === 0) {
      return res.status(400).json({ message: 'Funds array is required.' });
    }

    console.log('[Calc.controller] Received simulation request:', inputs);

    // 1. Get all scheme codes from the input
    const schemeCodes = inputs.funds.map(f => f.schemeCode);

    // 2. Fetch NAV data for all funds in parallel (uses our cache!)
    const navPromises = schemeCodes.map(code => getHistoricalNav(code));
    const allNavData = await Promise.all(navPromises);

    // 3. Check for failures
    if (allNavData.some(data => data === null)) {
      return res.status(404).json({ message: 'NAV data not found for one or more schemes.' });
    }
    
    // 4. Run the main simulation
    const result = runPortfolioSipSimulation(inputs, allNavData);
    
    // 5. Send the complete result back
    res.json(result);

  } catch (error) {
    console.error('[Calc.controller] Error in SIP calculation:', error.message);
    res.status(500).json({ message: 'An error occurred during calculation.' });
  }
};

/**
 * Handles rolling returns calculation request.
 */
const handleRollingReturns = async (req, res) => {
  try {
    const { schemeCodes, windowDays } = req.body;

    if (!schemeCodes || !Array.isArray(schemeCodes) || schemeCodes.length === 0) {
      return res.status(400).json({ message: 'schemeCodes array is required.' });
    }

    if (!windowDays || windowDays <= 0) {
      return res.status(400).json({ message: 'Valid windowDays is required.' });
    }

    console.log('[Rolling Returns] Processing:', { schemeCodes, windowDays });

    // Fetch NAV data for all schemes
    const navPromises = schemeCodes.map(code => getHistoricalNav(code));
    const allNavData = await Promise.all(navPromises);

    // Filter out failed requests
    const validNavData = allNavData.filter(data => data !== null);

    if (validNavData.length === 0) {
      return res.status(404).json({ message: 'No valid NAV data found for the requested schemes.' });
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
    console.error('[Rolling Returns] Error:', error.message);
    res.status(500).json({ message: 'An error occurred during rolling returns calculation.' });
  }
};

module.exports = {
  handleSipCalculation,
  handleRollingReturns,
};