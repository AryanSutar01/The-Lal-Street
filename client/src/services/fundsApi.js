// client/src/services/fundsApi.js

// --- Our Backend API Base URL ---
const OUR_BACKEND_URL = 'http://localhost:5000/api';

/**
 * Searches for funds by calling our backend.
 * @param {string} query - The user's search term.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of results.
 */
export const searchFunds = async (query) => {
  // Return an empty array immediately if the query is empty
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    // Use URLSearchParams to safely build the query string (e.g., handles spaces)
    const params = new URLSearchParams({ q: query });
    
    // Call our new backend search endpoint
    const response = await fetch(`${OUR_BACKEND_URL}/funds/search?${params}`);
    
    if (!response.ok) {
      throw new Error('Search request failed');
    }
    
    return await response.json();

  } catch (error) {
    console.error('Error searching funds:', error);
    return []; // Return an empty array on failure
  }
};

/**
 * Fetches the historical NAV data for a "bucket" of funds.
 * This calls OUR backend, not the external API.
 * @param {Array<string>} schemeCodes - An array of scheme codes, e.g., ['120549', '100123']
 * @returns {Promise<object>} A promise that resolves to the NAV data.
 */
export const fetchNavsForBucket = async (schemeCodes) => {
  console.log('[API Service] Fetching NAV data for bucket:', schemeCodes);
  
  if (!schemeCodes || schemeCodes.length === 0) {
    return null; // Don't make a request for an empty bucket
  }

  try {
    const response = await fetch(`${OUR_BACKEND_URL}/funds/get-nav-bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schemeCodes: schemeCodes }), // Match backend controller
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch NAV bucket');
    }

    return await response.json();

  } catch (error) {
    console.error('Error fetching NAV bucket:', error);
    return null; // Return null or throw error as needed
  }
};