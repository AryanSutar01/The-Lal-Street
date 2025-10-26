import { getToday } from '../utils/dateUtils';
import { API_ENDPOINTS } from '../config/api';

interface NAVData {
  date: string;
  nav: number;
}

interface FundNAVResponse {
  schemeCode: string;
  schemeName: string;
  navData: NAVData[];
  meta: {
    scheme_start_date: string;
    scheme_end_date: string;
  };
}

interface CacheEntry {
  data: FundNAVResponse[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

export async function fetchNAVData(
  schemeCodes: string[],
  startDate: string,
  endDate: string
): Promise<FundNAVResponse[]> {
  const cacheKey = `${schemeCodes.join(',')}-${startDate}-${endDate}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    console.log('[navService] Fetching NAV data for:', schemeCodes);
    const response = await fetch(API_ENDPOINTS.FUNDS_NAV, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schemeCodes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NAV data: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('[navService] Raw data received:', rawData);

    const data: FundNAVResponse[] = rawData.map((item: any) => ({
      schemeCode: item.schemeCode || item.scheme_code,
      schemeName: item.schemeName || item.scheme_name,
      navData: item.navData || item.nav_data || [],
      meta: {
        scheme_start_date: item.meta?.scheme_start_date || item.scheme_start_date,
        scheme_end_date: item.meta?.scheme_end_date || item.scheme_end_date,
      }
    }));

    console.log('[navService] Parsed data before filtering:', data.map(f => ({ 
      code: f.schemeCode, 
      navCount: f.navData.length,
      firstDate: f.navData[0]?.date,
      lastDate: f.navData[f.navData.length - 1]?.date
    })));

    const filteredData = data.map(fund => ({
      ...fund,
      navData: fund.navData.filter(nav => {
        const navDate = new Date(nav.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Add 14 days buffer after end date to capture last investment
        // This handles cases where end date is a holiday
        const endWithBuffer = new Date(end.getTime() + (14 * 24 * 60 * 60 * 1000));
        return navDate >= start && navDate <= endWithBuffer;
      })
    }));

    console.log('[navService] Filtered data:', filteredData.map(f => ({ 
      code: f.schemeCode, 
      navCount: f.navData.length 
    })));

    cache.set(cacheKey, {
      data: filteredData,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL,
    });

    return filteredData;
  } catch (error) {
    console.error('Error fetching NAV data:', error);
    if (cached) {
      console.log('Returning expired cache data');
      return cached.data;
    }
    throw error;
  }
}

export async function searchFunds(query: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_ENDPOINTS.FUNDS_SEARCH}?q=${query}`);
    if (!response.ok) {
      throw new Error(`Failed to search funds: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error searching funds:', error);
    throw error;
  }
}

export function clearCache(): void {
  cache.clear();
}