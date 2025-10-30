// server/services/navApi.service.js
const axios = require('axios');
const axiosRetry = require('axios-retry').default || require('axios-retry');
const { LRUCache } = require('lru-cache');
const logger = require('../utils/logger');
const API_BASE_URL = 'https://api.mfapi.in/mf/';

// Configure axios with timeout and retry logic
const axiosInstance = axios.create({
  timeout: 10000,  // 10 second timeout
  headers: {
    'User-Agent': 'TheLalStreet/1.0'
  }
});

// Configure retry logic for failed requests
axiosRetry(axiosInstance, {
  retries: 3,  // Retry 3 times
  retryDelay: (retryCount) => {
    return retryCount * 1000;  // 1s, 2s, 3s delays
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx errors
    return error.code === 'ECONNABORTED' 
      || error.code === 'ETIMEDOUT'
      || !error.response
      || (error.response?.status >= 500 && error.response?.status < 600);
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(`Retry attempt ${retryCount} for ${requestConfig.url}`);
  }
});

// --- LRU Cache with automatic cleanup ---
const navCache = new LRUCache({
  max: 100,  // Maximum 100 cached schemes
  maxSize: 50 * 1024 * 1024,  // 50MB total size limit
  sizeCalculation: (value) => {
    // Estimate size: stringify the data
    return JSON.stringify(value).length;
  },
  ttl: 6 * 60 * 60 * 1000,  // 6 hours (changed from 2 hours)
  updateAgeOnGet: true,  // Refresh TTL on access (LRU behavior)
  dispose: (value, key) => {
    logger.debug(`Cache evicted: ${key}`);
  }
}); 

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
 * This function uses LRU cache with automatic cleanup and timeout handling.
 * @param {string | number} schemeCode - The unique code for the mutual fund scheme.
 * @returns {Promise<object>} A promise that resolves to the API's response object (navData).
 */
const getHistoricalNav = async (schemeCode) => {
  // 1. CHECK CACHE (LRU handles TTL automatically)
  const cached = navCache.get(schemeCode);
  if (cached) {
    logger.debug(`Cache HIT for scheme ${schemeCode}`);
    return cached;
  }

  // 2. CACHE MISS - Fetch new data
  logger.debug(`Cache MISS - Fetching data for scheme ${schemeCode}`);
  const url = `${API_BASE_URL}${schemeCode}`;
  
  try {
    const response = await axiosInstance.get(url);
    const rawData = response.data;

    // 3. NORMALIZE DATE FORMATS AND NAV VALUES
    const normalizedData = {
      ...rawData,
      data: rawData.data ? rawData.data.map(entry => ({
        date: normalizeDateFormat(entry.date),
        nav: parseFloat(entry.nav) // Ensure NAV is a number
      })) : []
    };

    logger.info(`Fetched ${normalizedData.data.length} NAV entries for ${schemeCode}`);
    if (normalizedData.data.length > 0) {
      logger.debug(`Date range: ${normalizedData.data[0]?.date} to ${normalizedData.data[normalizedData.data.length - 1]?.date}`);
    }

    // 4. SAVE TO CACHE (LRU handles eviction automatically)
    navCache.set(schemeCode, normalizedData);
    
    return normalizedData;

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error(`Timeout fetching NAV data for ${schemeCode}`);
    } else if (error.response) {
      logger.error(`API error for ${schemeCode}: ${error.response.status} ${error.response.statusText}`);
    } else {
      logger.error(`Error fetching NAV data for ${schemeCode}: ${error.message}`);
    }
    // Don't throw. Return null so Promise.all doesn't fail completely.
    return null; 
  }
};

// We export the function we want other files to be able to use
module.exports = {
  getHistoricalNav,
};