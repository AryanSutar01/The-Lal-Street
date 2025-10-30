// server/controllers/funds.controller.js
const { searchFunds } = require('../services/fundList.service.js');
const { getHistoricalNav } = require('../services/navApi.service.js');
const logger = require('../utils/logger');

/**
 * Handles the fund search request.
 */
const handleFundSearch = async (req, res) => {
  try {
    const { q } = req.query; 
    if (!q) {
      return res.status(400).json({ 
        message: 'Search query "q" is required.' 
      });
    }
    
    logger.debug(`Fund search: "${q}"`);
    const results = await searchFunds(q);
    logger.debug(`Found ${results.length} results for "${q}"`);
    
    // Return raw array for backward compatibility with frontend
    res.json(results);
  } catch (error) {
    logger.error('Error in fund search:', error.message);
    res.status(500).json({ 
      message: 'Error searching funds.' 
    });
  }
};

/**
 * Handles the request for a "bucket" of NAV data.
 */
const handleNavBucket = async (req, res) => {
  try {
    // 1. Get the array of codes from the request body
    const { schemeCodes } = req.body;
    if (!schemeCodes || !Array.isArray(schemeCodes) || schemeCodes.length === 0) {
      return res.status(400).json({ 
        message: 'schemeCodes array is required.' 
      });
    }

    if (schemeCodes.length > 20) {
      return res.status(400).json({ 
        message: 'Cannot fetch more than 20 funds at once.' 
      });
    }

    logger.info(`NAV bucket request for ${schemeCodes.length} funds`);
    logger.debug(`Scheme codes: ${schemeCodes.join(', ')}`);

    // 2. Create an array of promises
    const navPromises = schemeCodes.map(code => getHistoricalNav(code));
    
    // 3. Run all promises in parallel
    const allNavData = await Promise.all(navPromises);

    // 4. Filter out any nulls (failed requests)
    const successfulNavs = allNavData.filter(data => data !== null);

    if (successfulNavs.length === 0) {
      logger.warn('All NAV bucket requests failed');
      return res.status(503).json({ 
        message: 'Unable to fetch NAV data. External API may be down.' 
      });
    }

    // 5. Format response to match frontend expectations
    const formattedResponse = successfulNavs.map(fund => ({
      schemeCode: fund.meta?.scheme_code?.toString() || '',
      schemeName: fund.meta?.scheme_name || '',
      navData: fund.data || [],
      meta: {
        scheme_start_date: fund.data && fund.data.length > 0 
          ? fund.data[fund.data.length - 1].date
          : null,
        scheme_end_date: fund.data && fund.data.length > 0 
          ? fund.data[0].date
          : null,
      }
    }));

    logger.info(`Returning ${formattedResponse.length} funds with NAV data`);
    
    // Return raw array for backward compatibility with frontend
    res.json(formattedResponse);

  } catch (error) {
    logger.error('Error in NAV bucket:', error.message);
    logger.error(error.stack);
    res.status(500).json({ 
      message: 'Error fetching NAV bucket.' 
    });
  }
};

module.exports = {
  handleFundSearch,
  handleNavBucket, // Export the new handler
};