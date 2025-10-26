// server/controllers/funds.controller.js
const { searchFunds } = require('../services/fundList.service.js');
const { getHistoricalNav } = require('../services/navApi.service.js'); // We need this!

/**
 * Handles the fund search request.
 */
const handleFundSearch = async (req, res) => {
  try {
    const { q } = req.query; 
    if (!q) {
      return res.status(400).json({ message: 'Search query "q" is required.' });
    }
    const results = await searchFunds(q);
    res.json(results);
  } catch (error) {
    console.error('[Fund Controller] Error in fund search:', error.message);
    res.status(500).json({ message: 'Error searching funds.' });
  }
};

/**
 * --- NEW ---
 * Handles the request for a "bucket" of NAV data.
 */
const handleNavBucket = async (req, res) => {
  try {
    // 1. Get the array of codes from the request body
    const { schemeCodes } = req.body;
    if (!schemeCodes || !Array.isArray(schemeCodes) || schemeCodes.length === 0) {
      return res.status(400).json({ message: 'schemeCodes array is required.' });
    }

    console.log(`[Fund Controller] Received NAV bucket request for:`, schemeCodes);

    // 2. Create an array of promises
    // We call getHistoricalNav for each code.
    const navPromises = schemeCodes.map(code => getHistoricalNav(code));
    
    // 3. Run all promises in parallel
    const allNavData = await Promise.all(navPromises);

    // 4. Filter out any nulls (failed requests)
    const successfulNavs = allNavData.filter(data => data !== null);

    // 5. Format response to match frontend expectations
    const formattedResponse = successfulNavs.map(fund => ({
      schemeCode: fund.meta?.scheme_code?.toString() || '',
      schemeName: fund.meta?.scheme_name || '',
      navData: fund.data || [], // Already normalized in navApi.service
      meta: {
        scheme_start_date: fund.data && fund.data.length > 0 
          ? fund.data[fund.data.length - 1].date  // Oldest date (data is newest-first)
          : null,
        scheme_end_date: fund.data && fund.data.length > 0 
          ? fund.data[0].date  // Newest date
          : null,
      }
    }));

    console.log(`[Fund Controller] Returning ${formattedResponse.length} funds with NAV data`);
    formattedResponse.forEach(fund => {
      console.log(`  - ${fund.schemeCode}: ${fund.navData.length} NAV entries (${fund.meta.scheme_start_date} to ${fund.meta.scheme_end_date})`);
    });
    
    res.json(formattedResponse);

  } catch (error) {
    console.error('[Fund Controller] Error in NAV bucket:', error.message);
    res.status(500).json({ message: 'Error fetching NAV bucket.' });
  }
};

module.exports = {
  handleFundSearch,
  handleNavBucket, // Export the new handler
};