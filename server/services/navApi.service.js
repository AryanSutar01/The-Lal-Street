// server/services/navApi.service.js
const axios = require('axios');
const API_BASE_URL = 'https://api.mfapi.in/mf/';

// --- Our new in-memory cache ---
const navCache = new Map();
// We'll set a 2-hour Time-To-Live (TTL) for our cache
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; 

/**
 * Converts date from DD-MM-YYYY to YYYY-MM-DD format
 * @param {string} dateStr - Date in DD-MM-YYYY format (e.g., "26-10-2025")
 * @returns {string} Date in YYYY-MM-DD format (e.g., "2025-10-26")
 */
const normalizeDateFormat = (dateStr) => {
  try {
    // Handle DD-MM-YYYY format from mfapi.in
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  } catch (error) {
    console.error(`[navApi.service] Error normalizing date: ${dateStr}`, error);
    return dateStr;
  }
};

/**
 * Fetches the complete historical NAV data for a given mutual fund scheme.
 * This function now uses an in-memory cache and normalizes date formats.
 * @param {string | number} schemeCode - The unique code for the mutual fund scheme.
 * @returns {Promise<object>} A promise that resolves to the API's response object (navData).
 */
const getHistoricalNav = async (schemeCode) => {
  const now = Date.now();

  // 1. CHECK CACHE
  if (navCache.has(schemeCode)) {
    const cachedItem = navCache.get(schemeCode);
    
    // Check if the cache is still "fresh"
    if (now - cachedItem.timestamp < CACHE_TTL_MS) {
      console.log(`[Cache HIT] Returning cached data for ${schemeCode}`);
      return cachedItem.data; // Return from cache!
    } else {
      console.log(`[Cache STALE] Data for ${schemeCode} expired. Fetching new.`);
    }
  }

  // 2. CACHE MISS (or stale) - Fetch new data
  console.log(`[Cache MISS] Fetching new data for ${schemeCode}`);
  const url = `${API_BASE_URL}${schemeCode}`;
  
  try {
    const response = await axios.get(url);
    const rawData = response.data;

    // 3. NORMALIZE DATE FORMATS AND NAV VALUES
    const normalizedData = {
      ...rawData,
      data: rawData.data ? rawData.data.map(entry => ({
        date: normalizeDateFormat(entry.date),
        nav: parseFloat(entry.nav) // Ensure NAV is a number
      })) : []
    };

    console.log(`[navApi.service] Normalized ${normalizedData.data.length} NAV entries for ${schemeCode}`);
    console.log(`[navApi.service] Date range: ${normalizedData.data[0]?.date} to ${normalizedData.data[normalizedData.data.length - 1]?.date}`);

    // 4. SAVE TO CACHE
    navCache.set(schemeCode, {
      timestamp: now,
      data: normalizedData,
    });
    
    return normalizedData;

  } catch (error) {
    console.error(`[navApi.service] Error fetching NAV data for ${schemeCode}:`, error.message);
    // Don't throw. Return null so Promise.all doesn't fail completely.
    return null; 
  }
};

// We export the function we want other files to be able to use
module.exports = {
  getHistoricalNav,
};