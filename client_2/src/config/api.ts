// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? '' // Use relative URLs in production (same domain)
    : 'http://localhost:5000');

export const API_ENDPOINTS = {
  FUNDS_SEARCH: `${API_BASE_URL}/api/funds/search`,
  FUNDS_NAV: `${API_BASE_URL}/api/funds/get-nav-bucket`,
} as const;

