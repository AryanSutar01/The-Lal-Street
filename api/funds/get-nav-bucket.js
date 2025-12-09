// api/funds/get-nav-bucket.js - Serverless function for fetching NAV data
const { getHistoricalNav } = require('../../server/services/navApi.service.js');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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

    console.log(`[NAV] Fetching ${schemeCodes.length} funds`);

    // Fetch all NAV data in parallel
    const navPromises = schemeCodes.map(code => 
      getHistoricalNav(code)
        .catch(err => {
          console.error(`[NAV] Error fetching ${code}:`, err.message);
          return null;
        })
    );

    const allNavData = await Promise.all(navPromises);

    // Filter out failed requests
    const successfulResults = allNavData.filter(data => data !== null);

    console.log(`[NAV] Successfully fetched ${successfulResults.length}/${schemeCodes.length} funds`);

    res.json(successfulResults);
  } catch (error) {
    console.error('[NAV] Error:', error.message);
    res.status(500).json({ 
      message: 'Error fetching NAV data.',
      error: error.message
    });
  }
};

