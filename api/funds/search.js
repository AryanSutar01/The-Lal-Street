// api/funds/search.js - Serverless function for fund search
const { searchFunds } = require('../../server/services/fundList.service.js');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        message: 'Search query "q" is required.' 
      });
    }
    
    console.log(`[Search] Query: "${q}"`);
    const results = await searchFunds(q);
    console.log(`[Search] Found ${results.length} results`);
    
    res.json(results);
  } catch (error) {
    console.error('[Search] Error:', error.message);
    res.status(500).json({ 
      message: 'Error searching funds.',
      error: error.message
    });
  }
};

