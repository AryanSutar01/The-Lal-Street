// server/services/fundList.service.js
const axios = require('axios');
const { getHistoricalNav } = require('./navApi.service');
const API_BASE_URL = 'https://api.mfapi.in/mf';

// --- Our In-Memory Cache ---
let cachedFundList = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cache for fund metadata (launch date, category)
const fundMetadataCache = new Map();
const METADATA_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Fetches and caches the master list of all funds.
 * This is called by our search function if the cache is stale.
 */
const refreshFundCache = async () => {
  try {
    console.log('[FundList Service] Refreshing fund list cache...');
    const response = await axios.get(API_BASE_URL);
    // The data is an array of { schemeCode, schemeName }
    cachedFundList = response.data.map(fund => ({
      schemeCode: fund.schemeCode.toString(), // Ensure string
      schemeName: fund.schemeName,
    }));
    
    cacheTimestamp = Date.now();
    console.log(`[FundList Service] Cache refreshed. ${cachedFundList.length} funds loaded.`);
  } catch (error) {
    console.error('[FundList Service] Failed to refresh fund cache:', error.message);
  }
};

/**
 * Fetches metadata (launch date, category) for a fund
 * @param {string} schemeCode - The fund scheme code
 * @returns {Promise<object>} Metadata object with launchDate and category
 */
const getFundMetadata = async (schemeCode) => {
  // Check cache first
  const cached = fundMetadataCache.get(schemeCode);
  if (cached && (Date.now() - cached.timestamp < METADATA_CACHE_TTL)) {
    return cached.data;
  }

  try {
    // Fetch NAV data to get metadata
    const navData = await getHistoricalNav(schemeCode);
    if (navData && navData.meta) {
      const metadata = {
        launchDate: navData.data && navData.data.length > 0 
          ? navData.data[navData.data.length - 1].date // Oldest date
          : null,
        category: navData.meta.scheme_category || 'Unknown'
      };

      // Cache it
      fundMetadataCache.set(schemeCode, {
        data: metadata,
        timestamp: Date.now()
      });

      return metadata;
    }
  } catch (error) {
    console.error(`[FundList Service] Error fetching metadata for ${schemeCode}:`, error.message);
  }

  return { launchDate: null, category: 'Unknown' };
};

/**
 * Searches the cached fund list.
 * @param {string} query - The user's search term.
 * @returns {Promise<Array<object>>} A promise that resolves to search results.
 */
const searchFunds = async (query) => {
  const now = Date.now();
  
  // 1. Check if cache is empty or stale
  if (cachedFundList.length === 0 || (now - cacheTimestamp > CACHE_TTL_MS)) {
    await refreshFundCache();
  }

  // 2. Perform the search (case-insensitive)
  const lowerCaseQuery = query.toLowerCase();
  
  // We filter the massive list on the server
  const results = cachedFundList.filter(fund => 
    fund.schemeName.toLowerCase().includes(lowerCaseQuery)
  );

  // 3. Get top results
  const topResults = results.slice(0, 20); // Reduced to 20 for faster metadata fetching

  // 4. Enrich with metadata (launch date, category)
  const enrichedResults = await Promise.all(
    topResults.map(async (fund) => {
      const metadata = await getFundMetadata(fund.schemeCode);
      return {
        ...fund,
        launchDate: metadata.launchDate,
        category: metadata.category
      };
    })
  );

  return enrichedResults;
};

// Initial cache fill when server starts (optional, but good)
refreshFundCache();

module.exports = {
  searchFunds,
};