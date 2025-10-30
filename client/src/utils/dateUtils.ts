/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generates an array of SIP investment dates (1st of each month)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of dates in YYYY-MM-DD format
 */
export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Start from the first day of the start month
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    // Move to first day of next month
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }
  
  return dates;
}

/**
 * Adds specified number of months to a date
 * Properly handles month-end edge cases (e.g., Jan 31 + 1 month = Feb 28/29)
 * @param dateStr - Date in YYYY-MM-DD format
 * @param months - Number of months to add
 * @returns Date in YYYY-MM-DD format
 */
export function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Finds the NEXT AVAILABLE NAV on or after the target date
 * If target date NAV doesn't exist (weekend/holiday), returns the next available date's NAV
 * This simulates real-world SIP behavior where investment happens on next working day
 * 
 * @param navData - Array of {date, nav} sorted in descending order (newest first) or ascending order
 * @param targetDate - Target date in YYYY-MM-DD format
 * @returns Object with {date, nav} of the next available NAV, or null if no data available
 */
export function getNextAvailableNAV(
  navData: Array<{date: string, nav: number}>, 
  targetDate: string
): { date: string, nav: number } | null {
  if (!navData || navData.length === 0) return null;
  
  const target = new Date(targetDate);
  
  // Sort data in ascending order (oldest first) for easier processing
  const sortedData = [...navData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Find the first NAV on or after the target date
  for (const nav of sortedData) {
    const navDate = new Date(nav.date);
    if (navDate >= target) {
      return nav;
    }
  }
  
  // If no date found on or after target, return null
  // (target date is after all available data)
  return null;
}

/**
 * Finds the NEAREST NAV to the target date (can be before or after)
 * Used for finding final NAV at end date
 * 
 * @param navData - Array of {date, nav}
 * @param targetDate - Target date in YYYY-MM-DD format
 * @returns NAV value closest to the target date, or null if no data
 */
export function getNearestNAV(
  navData: Array<{date: string, nav: number}>, 
  targetDate: string
): number | null {
  if (!navData || navData.length === 0) return null;
  
  const target = new Date(targetDate);
  let nearest = navData[0];
  let minDiff = Math.abs(new Date(nearest.date).getTime() - target.getTime());
  
  for (const nav of navData) {
    const diff = Math.abs(new Date(nav.date).getTime() - target.getTime());
    if (diff < minDiff) {
      minDiff = diff;
      nearest = nav;
    }
  }
  
  return nearest.nav;
}

/**
 * Gets the latest available NAV on or before the target date
 * Used for getting final portfolio value at end date
 * 
 * @param navData - Array of {date, nav}
 * @param targetDate - Target date in YYYY-MM-DD format
 * @returns Object with {date, nav} or null if no data available
 */
export function getLatestNAVBeforeDate(
  navData: Array<{date: string, nav: number}>, 
  targetDate: string
): { date: string, nav: number } | null {
  if (!navData || navData.length === 0) return null;
  
  const target = new Date(targetDate);
  
  // Sort data in descending order (newest first)
  const sortedData = [...navData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the first NAV on or before the target date
  for (const nav of sortedData) {
    const navDate = new Date(nav.date);
    if (navDate <= target) {
      return nav;
    }
  }
  
  // If no date found on or before target, return null
  return null;
}

/**
 * Calculates the number of days between two dates
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Number of days
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the number of years between two dates (with decimals)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Number of years (e.g., 2.5 for 2 years and 6 months)
 */
export function getYearsBetween(startDate: string, endDate: string): number {
  const days = getDaysBetween(startDate, endDate);
  return days / 365.25; // Account for leap years
}