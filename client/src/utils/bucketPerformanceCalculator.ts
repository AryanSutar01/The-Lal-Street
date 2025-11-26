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
}

const ROLLING_WINDOW_DAYS = 1095; // 3 years rolling window (365 * 3)

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
 * Calculate rolling returns performance for a bucket
 * Uses daily lumpsum strategy from earliest available date
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

  // Get the first fund's NAV dates as reference
  const firstFundNav = navMap[fundSchemeCodes[0]];
  if (!firstFundNav || firstFundNav.length === 0) {
    throw new Error('No NAV data available');
  }

  const bucketRollingReturns: number[] = [];
  const fundRollingReturns: Record<string, number[]> = {};

  // Initialize fund rolling returns arrays
  funds.forEach(fund => {
    fundRollingReturns[fund.id] = [];
  });

  // Calculate rolling returns for each possible start date
  // Daily lumpsum: invest on each day, calculate 3-year return
  // Process in chunks to avoid blocking the UI thread
  const totalIterations = firstFundNav.length - ROLLING_WINDOW_DAYS + 1;
  const CHUNK_SIZE = 50; // Process 50 iterations at a time
  
  // Helper function to yield control back to browser
  const yieldToBrowser = () => new Promise<void>(resolve => setTimeout(resolve, 0));

  // Process calculations in chunks
  for (let i = 0; i <= firstFundNav.length - ROLLING_WINDOW_DAYS; i++) {
    const startDate = firstFundNav[i].date;
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + ROLLING_WINDOW_DAYS - 1);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    // Use a standard investment amount for calculation (will be normalized)
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
        const units = fundInvestment / startNav.nav;
        const finalValue = units * endNav.nav;
        
        fundInitialValues[fund.id] = fundInvestment;
        fundFinalValues[fund.id] = finalValue;
        
        bucketInitialValue += fundInvestment;
        bucketFinalValue += finalValue;
      } else {
        allFundsValid = false;
      }
    });

    if (allFundsValid && bucketInitialValue > 0 && bucketFinalValue > 0) {
      // Calculate annualized return for bucket
      const daysDiff = (endDateObj.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
      const annualizedReturn = daysDiff > 0
        ? (Math.pow(bucketFinalValue / bucketInitialValue, 365 / daysDiff) - 1) * 100
        : 0;
      
      bucketRollingReturns.push(annualizedReturn);

      // Calculate annualized return for each fund
      funds.forEach(fund => {
        if (fundInitialValues[fund.id] && fundFinalValues[fund.id]) {
          const fundAnnualizedReturn = daysDiff > 0
            ? (Math.pow(fundFinalValues[fund.id] / fundInitialValues[fund.id], 365 / daysDiff) - 1) * 100
            : 0;
          
          fundRollingReturns[fund.id].push(fundAnnualizedReturn);
        }
      });
    }

    // Yield control back to browser every CHUNK_SIZE iterations to prevent UI blocking
    if ((i + 1) % CHUNK_SIZE === 0) {
      await yieldToBrowser();
    }
  }

  // Calculate statistics for bucket
  const bucketStats = calculateStatistics(bucketRollingReturns);

  // Calculate statistics for each fund
  const fundStats = funds.map(fund => {
    const returns = fundRollingReturns[fund.id] || [];
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
    totalPeriods: bucketRollingReturns.length,
  };
}

