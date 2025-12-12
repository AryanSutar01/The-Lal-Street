import type { SelectedFund } from '../App';
import { fetchNAVData } from '../services/navService';
import { getLatestNAVBeforeDate, getNextAvailableNAV, getToday } from './dateUtils';

export interface BucketPerformanceMetrics {
  rollingReturns: {
    bucket: {
      mean: number;
      median: number;
      max: number;
      min: number;
      stdDev: number;
      positivePercentage: number;
    };
    funds: Array<{
      fundId: string;
      fundName: string;
      mean: number;
      median: number;
      max: number;
      min: number;
      stdDev: number;
      positivePercentage: number;
    }>;
  };
  analysisStartDate: string;
  analysisEndDate: string;
  totalPeriods: number;
  windowType: '3Y' | '1Y' | 'insufficient';
  windowDays: number;
  message?: string;
}

const ROLLING_WINDOW_3Y_DAYS = 1095; // 3 years rolling window (365 * 3)
const ROLLING_WINDOW_1Y_DAYS = 365; // 1 year rolling window

function calculateStatistics(returns: number[]) {
  if (returns.length === 0) {
    return { mean: 0, median: 0, max: 0, min: 0, stdDev: 0, positivePercentage: 0 };
  }
  
  const sorted = [...returns].sort((a, b) => a - b);
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const max = Math.max(...returns);
  const min = Math.min(...returns);
  
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  const positiveCount = returns.filter(r => r > 0).length;
  const positivePercentage = (positiveCount / returns.length) * 100;
  
  return { mean, median, max, min, stdDev, positivePercentage };
}

/**
 * Calculate rolling returns for a specific window size
 */
async function calculateRollingReturnsForWindow(
  funds: SelectedFund[],
  navMap: Record<string, { date: string; nav: number }[]>,
  fundSchemeCodes: string[],
  windowDays: number,
  analysisStartDate: string,
  analysisEndDate: string
): Promise<{ bucketReturns: number[]; fundReturns: Record<string, number[]>; totalPeriods: number }> {
  const firstFundNav = navMap[fundSchemeCodes[0]];
  if (!firstFundNav || firstFundNav.length === 0) {
    return { bucketReturns: [], fundReturns: {}, totalPeriods: 0 };
  }

  const bucketRollingReturns: number[] = [];
  const fundRollingReturns: Record<string, number[]> = {};
  
  // Initialize fund rolling returns arrays
  funds.forEach(fund => {
    fundRollingReturns[fund.id] = [];
  });

  const today = new Date(getToday());
  const CHUNK_SIZE = 50;
  const yieldToBrowser = () => new Promise<void>(resolve => setTimeout(resolve, 0));

  // Process calculations in chunks
  for (let i = 0; i <= firstFundNav.length - windowDays; i++) {
    const startDate = firstFundNav[i].date;
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + windowDays - 1);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    // Skip if end date is in the future - we need complete windows only
    if (endDateObj > today) {
      continue;
    }

    const testInvestmentAmount = 100000;
    let bucketInitialValue = 0;
    let bucketFinalValue = 0;
    let allFundsValid = true;

    const fundFinalValues: Record<string, number> = {};
    const fundInitialValues: Record<string, number> = {};

    funds.forEach(fund => {
      const navSeries = navMap[fund.id];
      if (!navSeries || navSeries.length === 0) {
        allFundsValid = false;
        return;
      }

      const fundInvestment = testInvestmentAmount * (fund.weightage / 100);
      const startNav = getLatestNAVBeforeDate(navSeries, startDate);
      const endNav = getLatestNAVBeforeDate(navSeries, endDateStr);

      if (startNav && endNav && startNav.nav > 0 && endNav.nav > 0) {
        const actualDays = (new Date(endNav.date).getTime() - new Date(startNav.date).getTime()) / (1000 * 60 * 60 * 24);
        // Allow tolerance (within 30 days) for missing NAV data on weekends/holidays
        const tolerance = 30;
        if (actualDays >= windowDays - tolerance && actualDays <= windowDays + tolerance) {
          const units = fundInvestment / startNav.nav;
          const finalValue = units * endNav.nav;
          
          fundInitialValues[fund.id] = fundInvestment;
          fundFinalValues[fund.id] = finalValue;
          
          bucketInitialValue += fundInvestment;
          bucketFinalValue += finalValue;
        } else {
          allFundsValid = false;
        }
      } else {
        allFundsValid = false;
      }
    });

    if (allFundsValid && bucketInitialValue > 0 && bucketFinalValue > 0) {
      const daysDiff = (endDateObj.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
      const annualizedReturn = daysDiff > 0
        ? (Math.pow(bucketFinalValue / bucketInitialValue, 365 / daysDiff) - 1) * 100
        : 0;
      
      bucketRollingReturns.push(annualizedReturn);

      funds.forEach(fund => {
        if (fundInitialValues[fund.id] && fundFinalValues[fund.id]) {
          const fundAnnualizedReturn = daysDiff > 0
            ? (Math.pow(fundFinalValues[fund.id] / fundInitialValues[fund.id], 365 / daysDiff) - 1) * 100
            : 0;
          
          fundRollingReturns[fund.id].push(fundAnnualizedReturn);
        }
      });
    }

    if ((i + 1) % CHUNK_SIZE === 0) {
      await yieldToBrowser();
    }
  }

  return {
    bucketReturns: bucketRollingReturns,
    fundReturns: fundRollingReturns,
    totalPeriods: bucketRollingReturns.length
  };
}

/**
 * Calculate rolling returns performance for a bucket
 * 
 * Calculation Parameters:
 * - Rolling Window: Tries 3 years (1095 days) first, falls back to 1 year (365 days) if insufficient data
 * - Method: Daily Lumpsum - calculates return for each possible start date
 * - Date Range: From latest fund launch date (when ALL funds are available) to today
 * - Frequency: Daily - one calculation per day, rolling forward
 * - Investment Strategy: Lumpsum investment at each start date with portfolio weights
 * - Annualization: Returns are annualized using compound annual growth rate formula
 * 
 * How it works:
 * 1. First tries 3-year window
 * 2. If insufficient data, tries 1-year window
 * 3. If still insufficient, returns error message
 */
export async function calculateBucketPerformance(
  funds: SelectedFund[]
): Promise<BucketPerformanceMetrics> {
  if (funds.length === 0) {
    throw new Error('At least one fund is required');
  }

  // Find earliest launch date among all funds (the latest of all earliest dates)
  // We need to start analysis from when ALL funds were available
  const launchDates = funds
    .map(f => new Date(f.launchDate))
    .filter(date => !isNaN(date.getTime()));
  
  if (launchDates.length === 0) {
    throw new Error('Invalid launch dates for funds');
  }

  // Start from the LATEST launch date (when all funds were available)
  const latestLaunchDate = new Date(Math.max(...launchDates.map(d => d.getTime())));
  const analysisStartDate = latestLaunchDate.toISOString().split('T')[0];
  const analysisEndDate = getToday();

  // Fetch NAV data from earliest date
  const fundSchemeCodes = funds.map(f => f.id);
  const navResponses = await fetchNAVData(fundSchemeCodes, analysisStartDate, analysisEndDate);

  if (navResponses.length === 0) {
    throw new Error('No NAV data available for the selected funds');
  }

  // Create NAV map
  const navMap: Record<string, { date: string; nav: number }[]> = {};
  navResponses.forEach(response => {
    navMap[response.schemeCode] = response.navData.map(nav => ({ 
      date: nav.date, 
      nav: nav.nav 
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // Try 3-year window first
  let result = await calculateRollingReturnsForWindow(
    funds,
    navMap,
    fundSchemeCodes,
    ROLLING_WINDOW_3Y_DAYS,
    analysisStartDate,
    analysisEndDate
  );

  let windowType: '3Y' | '1Y' | 'insufficient' = '3Y';
  let windowDays = ROLLING_WINDOW_3Y_DAYS;
  let message: string | undefined;

  // If 3-year window has no valid periods, try 1-year window
  if (result.totalPeriods === 0) {
    result = await calculateRollingReturnsForWindow(
      funds,
      navMap,
      fundSchemeCodes,
      ROLLING_WINDOW_1Y_DAYS,
      analysisStartDate,
      analysisEndDate
    );

    if (result.totalPeriods > 0) {
      windowType = '1Y';
      windowDays = ROLLING_WINDOW_1Y_DAYS;
      message = 'Insufficient data for 3-year rolling returns. Showing 1-year rolling returns instead.';
    } else {
      windowType = 'insufficient';
      windowDays = 0;
      message = 'Not enough historical NAV data available. Need at least 1 year of data for rolling returns calculation.';
    }
  }

  // Calculate statistics for bucket
  const bucketStats = calculateStatistics(result.bucketReturns);

  // Calculate statistics for each fund
  const fundStats = funds.map(fund => {
    const returns = result.fundReturns[fund.id] || [];
    const stats = calculateStatistics(returns);
    return {
      fundId: fund.id,
      fundName: fund.name,
      ...stats,
    };
  });

  return {
    rollingReturns: {
      bucket: bucketStats,
      funds: fundStats,
    },
    analysisStartDate,
    analysisEndDate,
    totalPeriods: result.totalPeriods,
    windowType,
    windowDays,
    message,
  };
}

