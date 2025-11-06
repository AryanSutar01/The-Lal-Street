import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SelectedFund } from '../../App';
import { fetchNAVData } from '../../services/navService';
import { calculateXIRR } from '../../utils/financialCalculations';
import { getNextAvailableNAV, getLatestNAVBeforeDate, addMonths } from '../../utils/dateUtils';

interface RollingCalculatorProps {
  funds: SelectedFund[];
}

interface RollingReturn {
  startDate: string;
  endDate: string;
  xirr: number;
}

interface FundRollingData {
  fundId: string;
  fundName: string;
  rollingReturns: RollingReturn[];
  mean: number;
  median: number;
  max: number;
  min: number;
  stdDev: number;
  positivePercentage: number;
}

interface BucketRollingData {
  rollingReturns: RollingReturn[];
  mean: number;
  median: number;
  max: number;
  min: number;
  stdDev: number;
  positivePercentage: number;
}

// Helper to get today's date in YYYY-MM-DD format
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to add months to a Date object and return a new Date
const addMonthsToDate = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Calculate statistics
const calculateStatistics = (returns: number[]) => {
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
};

export function RollingCalculator({ funds }: RollingCalculatorProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [startDate, setStartDate] = useState<string>('2020-01-01');
  const [endDate, setEndDate] = useState<string>(getToday());
  const [rollingWindowType, setRollingWindowType] = useState<string>('years');
  const [rollingWindowValue, setRollingWindowValue] = useState<number>(1);
  const [investmentStrategy, setInvestmentStrategy] = useState<string>('lumpsum'); // 'lumpsum' or 'sip'
  const [rollingPeriod, setRollingPeriod] = useState<string>('daily'); // 'daily' or 'monthly'
  const [selectedFundView, setSelectedFundView] = useState<string>('bucket');
  const [minAvailableDate, setMinAvailableDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    bucketData: BucketRollingData;
    fundData: FundRollingData[];
  } | null>(null);

  // Update minAvailableDate when funds change
  useEffect(() => {
    if (funds.length > 0) {
      const latestLaunchDate = funds.reduce((latest, fund) => {
        const fundLaunchDate = new Date(fund.launchDate);
        return fundLaunchDate > latest ? fundLaunchDate : latest;
      }, new Date(funds[0].launchDate));
      
      const minDate = latestLaunchDate.toISOString().split('T')[0];
      setMinAvailableDate(minDate);
      
      if (new Date(startDate) < latestLaunchDate) {
        setStartDate(minDate);
      }
    } else {
      setMinAvailableDate(null);
    }
  }, [funds]);

  const calculateRolling = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (investmentStrategy === 'lumpsum') {
        await calculateLumpsumRolling();
      } else {
        await calculateSIPRolling();
      }
    } catch (err: any) {
      console.error('[Rolling] Calculation error:', err);
      setError(err.message || "An unexpected error occurred during calculation.");
      setIsLoading(false);
    }
  };

  const calculateLumpsumRolling = async () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const windowMonths = rollingWindowType === 'years' ? rollingWindowValue * 12 : rollingWindowValue;
      
      // Fetch NAV data
      const extendedStartDate = addMonths(startDate, -windowMonths);
      const fundSchemeCodes = funds.map(f => f.id);
      
      console.log(`[Rolling Lumpsum] Mode: ${rollingPeriod}, Window: ${windowMonths} months`);
      
      const navResponses = await fetchNAVData(fundSchemeCodes, extendedStartDate, endDate);
      
      if (navResponses.length === 0) {
        throw new Error("No NAV data available for the selected funds in the given period.");
      }
      
      
      const initialInvestment = monthlyInvestment; // Use as lumpsum amount
      const fundRollingDataArray: FundRollingData[] = [];
      
      // Calculate for each fund
      funds.forEach(fund => {
        const navResponse = navResponses.find(nav => nav.schemeCode === fund.id);
        if (!navResponse) return;
        
        const fundInvestment = initialInvestment * (fund.weightage / 100);
        const rollingReturns: RollingReturn[] = [];
        const navData = navResponse.navData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
        // Iterate through NAV dates based on rolling period
        for (let i = 0; i < navData.length; i++) {
          const startNavEntry = navData[i];
          const startDate = new Date(startNavEntry.date);
          
          // Calculate window end date
          const windowEnd = addMonthsToDate(startDate, windowMonths);
          
          // Stop if window end exceeds our end date
          if (windowEnd > end) break;
          
          // Find closest NAV at window end
          const endNavEntry = getLatestNAVBeforeDate(navData, windowEnd.toISOString().split('T')[0]);
          
          if (endNavEntry && endNavEntry.nav > 0 && startNavEntry.nav > 0) {
            // Calculate annualized return
            const units = fundInvestment / startNavEntry.nav;
            const finalValue = units * endNavEntry.nav;
            const daysDiff = (new Date(endNavEntry.date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            const annualizedReturn = daysDiff > 0 ? (Math.pow(finalValue / fundInvestment, 365 / daysDiff) - 1) * 100 : 0;
            
            rollingReturns.push({
              startDate: startNavEntry.date,
              endDate: endNavEntry.date,
              xirr: annualizedReturn
            });
          }
          
          // Move to next date based on rolling period
          if (rollingPeriod === 'monthly') {
            // Skip to next month's data
            const nextMonth = addMonthsToDate(startDate, 1);
            while (i < navData.length - 1 && new Date(navData[i].date) < nextMonth) {
              i++;
            }
            i--; // Adjust for loop increment
          }
          // For daily, natural loop increment moves to next available NAV date
        }
      
        // Calculate statistics for this fund
        const xirrValues = rollingReturns.map(r => r.xirr);
        const stats = calculateStatistics(xirrValues);
        
        fundRollingDataArray.push({
          fundId: fund.id,
          fundName: fund.name,
          rollingReturns,
          ...stats
        });
      });
      
      // Calculate bucket rolling returns
      const bucketRollingReturns: RollingReturn[] = [];
      const firstFundNav = navResponses[0].navData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      for (let i = 0; i < firstFundNav.length; i++) {
        const startNavEntry = firstFundNav[i];
        const startDate = new Date(startNavEntry.date);
        const windowEnd = addMonthsToDate(startDate, windowMonths);
        
        if (windowEnd > end) break;
        
        let bucketInitialValue = 0;
        let bucketFinalValue = 0;
        let validFunds = 0;
        
        funds.forEach(fund => {
          const navResponse = navResponses.find(nav => nav.schemeCode === fund.id);
          if (!navResponse) return;
          
          const fundInvestment = initialInvestment * (fund.weightage / 100);
          const fundNavData = navResponse.navData;
          
          const startNav = getNextAvailableNAV(fundNavData, startNavEntry.date);
          const endNav = getLatestNAVBeforeDate(fundNavData, windowEnd.toISOString().split('T')[0]);
          
          if (startNav && endNav && startNav.nav > 0 && endNav.nav > 0) {
            const units = fundInvestment / startNav.nav;
            bucketInitialValue += fundInvestment;
            bucketFinalValue += units * endNav.nav;
            validFunds++;
          }
        });
        
        if (bucketInitialValue > 0 && bucketFinalValue > 0 && validFunds === funds.length) {
          const daysDiff = (windowEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          const annualizedReturn = daysDiff > 0 ? (Math.pow(bucketFinalValue / bucketInitialValue, 365 / daysDiff) - 1) * 100 : 0;
          
          bucketRollingReturns.push({
            startDate: startNavEntry.date,
            endDate: windowEnd.toISOString().split('T')[0],
            xirr: annualizedReturn
          });
        }
        
        if (rollingPeriod === 'monthly') {
          const nextMonth = addMonthsToDate(startDate, 1);
          while (i < firstFundNav.length - 1 && new Date(firstFundNav[i].date) < nextMonth) {
            i++;
          }
          i--;
        }
      }
    
      // Calculate statistics for bucket
      const bucketXirrValues = bucketRollingReturns.map(r => r.xirr);
      const bucketStats = calculateStatistics(bucketXirrValues);
      
      console.log('[Rolling Lumpsum] Complete:', {
        mode: rollingPeriod,
        fundCount: fundRollingDataArray.length,
        windowCount: bucketRollingReturns.length,
        mean: bucketStats.mean.toFixed(2) + '%'
      });
      
      setResult({
        bucketData: {
          rollingReturns: bucketRollingReturns,
          ...bucketStats
        },
        fundData: fundRollingDataArray
      });
      
      setSelectedFundView('bucket');
      setIsLoading(false);
    } catch (err: any) {
      console.error('[Rolling Lumpsum] Error:', err);
      setError(err.message || "An unexpected error occurred during calculation.");
      setIsLoading(false);
    }
  };

  const calculateSIPRolling = async () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const windowMonths = rollingWindowType === 'years' ? rollingWindowValue * 12 : rollingWindowValue;
      
      // Fetch NAV data - need extended period to cover all rolling windows
      const extendedStartDate = addMonths(startDate, -windowMonths);
      const fundSchemeCodes = funds.map(f => f.id);
      
      console.log(`[Rolling SIP] Window: ${windowMonths} months, Period: Monthly rolling`);
      
      const navResponses = await fetchNAVData(fundSchemeCodes, extendedStartDate, endDate);
      
      if (navResponses.length === 0) {
        throw new Error("No NAV data available for the selected funds in the given period.");
      }
      
      const initialInvestment = monthlyInvestment; // Monthly SIP amount
      const fundRollingDataArray: FundRollingData[] = [];
      
      // Generate monthly rolling start dates (SIP always uses monthly rolling)
      const rollingStartDates: string[] = [];
      let currentStart = new Date(start);
      
      while (currentStart <= end) {
        const windowEnd = addMonthsToDate(currentStart, windowMonths);
        if (windowEnd > end) break;
        
        rollingStartDates.push(currentStart.toISOString().split('T')[0]);
        
        // Move to next month for monthly rolling
        currentStart = addMonthsToDate(currentStart, 1);
      }
      
      console.log(`[Rolling SIP] Generated ${rollingStartDates.length} rolling windows`);
      
      // Calculate for each fund
      funds.forEach(fund => {
        const navResponse = navResponses.find(nav => nav.schemeCode === fund.id);
        if (!navResponse) return;
        
        const fundInvestment = initialInvestment * (fund.weightage / 100);
        const rollingReturns: RollingReturn[] = [];
        const navData = navResponse.navData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Process each rolling window
        rollingStartDates.forEach(windowStartDate => {
          const windowStart = new Date(windowStartDate);
          const windowEnd = addMonthsToDate(windowStart, windowMonths);
          
          if (windowEnd > end) return;
          
          // Generate SIP investment dates within this window
          const sipInvestments: Array<{plannedDate: string, actualDate: string, nav: number}> = [];
          let currentSIPDate = windowStartDate;
          let loopCount = 0;
          const maxIterations = windowMonths + 2; // Safety limit
          
          while (loopCount < maxIterations) {
            loopCount++;
            const plannedDateObj = new Date(currentSIPDate);
            
            // Stop if planned date is beyond window end
            if (plannedDateObj >= windowEnd) break;
            
            // Find next available NAV for this SIP date
            const navEntry = getNextAvailableNAV(navData, currentSIPDate);
            
            if (navEntry && navEntry.nav > 0) {
              const actualDate = new Date(navEntry.date);
              
              // Only include if actual investment date is within or very close to window end
              // (within 7 days after window end to handle holidays)
              const daysAfterWindowEnd = (actualDate.getTime() - windowEnd.getTime()) / (1000 * 60 * 60 * 24);
              
              if (actualDate <= windowEnd || (daysAfterWindowEnd >= 0 && daysAfterWindowEnd <= 7)) {
                sipInvestments.push({
                  plannedDate: currentSIPDate,
                  actualDate: navEntry.date,
                  nav: navEntry.nav
                });
                
                // Move to next month
                currentSIPDate = addMonths(currentSIPDate, 1);
              } else {
                // Investment date is too far after window end, stop
                break;
              }
            } else {
              // No NAV found, try next month
              currentSIPDate = addMonths(currentSIPDate, 1);
            }
          }
          
          if (sipInvestments.length === 0) return; // Skip windows with no investments
          
          // Track SIP investments and calculate final value
          let totalUnits = 0;
          const cashFlows: Array<{date: Date, amount: number}> = [];
          
          sipInvestments.forEach(({ actualDate, nav }) => {
            const unitsPurchased = fundInvestment / nav;
            totalUnits += unitsPurchased;
            cashFlows.push({
              date: new Date(actualDate),
              amount: -fundInvestment // Negative = outflow (investment)
            });
          });
          
          // Get final NAV at window end date
          const finalNavEntry = getLatestNAVBeforeDate(navData, windowEnd.toISOString().split('T')[0]);
          
          if (finalNavEntry && finalNavEntry.nav > 0 && totalUnits > 0) {
            const finalValue = totalUnits * finalNavEntry.nav;
            cashFlows.push({
              date: windowEnd,
              amount: finalValue // Positive = inflow (redemption)
            });
            
            // Calculate XIRR for this window
            const xirr = calculateXIRR(cashFlows);
            
            if (!isNaN(xirr) && isFinite(xirr)) {
              rollingReturns.push({
                startDate: windowStartDate,
                endDate: windowEnd.toISOString().split('T')[0],
                xirr: xirr
              });
            }
          }
        });
        
        // Calculate statistics for this fund
        const xirrValues = rollingReturns.map(r => r.xirr);
        const stats = calculateStatistics(xirrValues);
        
        fundRollingDataArray.push({
          fundId: fund.id,
          fundName: fund.name,
          rollingReturns,
          ...stats
        });
      });
      
      // Calculate bucket rolling returns
      const bucketRollingReturns: RollingReturn[] = [];
      
      rollingStartDates.forEach(windowStartDate => {
        const windowStart = new Date(windowStartDate);
        const windowEnd = addMonthsToDate(windowStart, windowMonths);
        
        if (windowEnd > end) return;
        
        // Generate SIP dates for bucket (use first fund's NAV dates as reference)
        const firstFundNav = navResponses[0].navData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const sipDates: Array<{plannedDate: string, actualDate: string}> = [];
        let currentSIPDate = windowStartDate;
        let loopCount = 0;
        const maxIterations = windowMonths + 2;
        
        while (loopCount < maxIterations) {
          loopCount++;
          const plannedDateObj = new Date(currentSIPDate);
          if (plannedDateObj >= windowEnd) break;
          
          const navEntry = getNextAvailableNAV(firstFundNav, currentSIPDate);
          if (navEntry) {
            const actualDate = new Date(navEntry.date);
            const daysAfterWindowEnd = (actualDate.getTime() - windowEnd.getTime()) / (1000 * 60 * 60 * 24);
            
            if (actualDate <= windowEnd || (daysAfterWindowEnd >= 0 && daysAfterWindowEnd <= 7)) {
              sipDates.push({
                plannedDate: currentSIPDate,
                actualDate: navEntry.date
              });
              currentSIPDate = addMonths(currentSIPDate, 1);
            } else {
              break;
            }
          } else {
            currentSIPDate = addMonths(currentSIPDate, 1);
          }
        }
        
        if (sipDates.length === 0) return;
        
        // Track bucket investments across all funds
        const bucketCashFlows: Array<{date: Date, amount: number}> = [];
        let bucketTotalUnits = new Map<string, number>(); // fundId -> units
        
        // Initialize units tracking for each fund
        funds.forEach(fund => {
          bucketTotalUnits.set(fund.id, 0);
        });
        
        sipDates.forEach(({ actualDate }) => {
          let bucketInvestment = 0;
          
          funds.forEach(fund => {
            const navResponse = navResponses.find(nav => nav.schemeCode === fund.id);
            if (!navResponse) return;
            
            const fundInvestment = initialInvestment * (fund.weightage / 100);
            const navEntry = getNextAvailableNAV(navResponse.navData, actualDate);
            
            if (navEntry && navEntry.nav > 0) {
              const unitsPurchased = fundInvestment / navEntry.nav;
              const currentUnits = bucketTotalUnits.get(fund.id) || 0;
              bucketTotalUnits.set(fund.id, currentUnits + unitsPurchased);
              bucketInvestment += fundInvestment;
            }
          });
          
          if (bucketInvestment > 0) {
            bucketCashFlows.push({
              date: new Date(actualDate),
              amount: -bucketInvestment
            });
          }
        });
        
        // Calculate final bucket value
        let bucketFinalValue = 0;
        let allFundsValid = true;
        
        funds.forEach(fund => {
          const navResponse = navResponses.find(nav => nav.schemeCode === fund.id);
          if (!navResponse) {
            allFundsValid = false;
            return;
          }
          
          const finalNavEntry = getLatestNAVBeforeDate(navResponse.navData, windowEnd.toISOString().split('T')[0]);
          const fundUnits = bucketTotalUnits.get(fund.id) || 0;
          
          if (finalNavEntry && finalNavEntry.nav > 0) {
            bucketFinalValue += fundUnits * finalNavEntry.nav;
          } else {
            allFundsValid = false;
          }
        });
        
        if (allFundsValid && bucketFinalValue > 0 && bucketCashFlows.length > 0) {
          bucketCashFlows.push({
            date: windowEnd,
            amount: bucketFinalValue
          });
          
          const xirr = calculateXIRR(bucketCashFlows);
          
          if (!isNaN(xirr) && isFinite(xirr)) {
            bucketRollingReturns.push({
              startDate: windowStartDate,
              endDate: windowEnd.toISOString().split('T')[0],
              xirr: xirr
            });
          }
        }
      });
      
      // Calculate statistics for bucket
      const bucketXirrValues = bucketRollingReturns.map(r => r.xirr);
      const bucketStats = calculateStatistics(bucketXirrValues);
      
      console.log('[Rolling SIP] Complete:', {
        windowCount: bucketRollingReturns.length,
        mean: bucketStats.mean.toFixed(2) + '%'
      });
      
      setResult({
        bucketData: {
          rollingReturns: bucketRollingReturns,
          ...bucketStats
        },
        fundData: fundRollingDataArray
      });
      
      setSelectedFundView('bucket');
      setIsLoading(false);
    } catch (err: any) {
      console.error('[Rolling SIP] Error:', err);
      setError(err.message || "An unexpected error occurred during calculation.");
      setIsLoading(false);
    }
  };

  // Prepare chart data based on selected view
  const getChartData = () => {
    if (!result) return [];
    
    if (selectedFundView === 'bucket') {
      return result.bucketData.rollingReturns.map(r => ({
        startDate: r.startDate,
        return: r.xirr
      }));
    } else {
      const fundData = result.fundData.find(f => f.fundId === selectedFundView);
      if (!fundData) return [];
      
      return fundData.rollingReturns.map(r => ({
        startDate: r.startDate,
        return: r.xirr
      }));
    }
  };

  const chartData = getChartData();
  
  // Get color for selected fund
  const fundColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  const getSelectedColor = () => {
    if (selectedFundView === 'bucket') return '#1e293b';
    const index = result?.fundData.findIndex(f => f.fundId === selectedFundView) || 0;
    return fundColors[index % fundColors.length];
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 mb-1">Rolling Returns Calculator</h2>
            <p className="text-sm text-slate-600">Analyze performance consistency across rolling time periods</p>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            {funds.length} {funds.length === 1 ? 'Fund' : 'Funds'} Selected
          </Badge>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="monthly-investment">Monthly Investment (₹)</Label>
            <Input
              id="monthly-investment"
              type="number"
              min="500"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(parseFloat(e.target.value) || 0)}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minAvailableDate || undefined}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
            {minAvailableDate && (
              <p className="text-xs text-gray-500 mt-1">
                Earliest available: {new Date(minAvailableDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              max={getToday()}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rolling-window">Rolling Window</Label>
            <div className="flex gap-2">
              <Input
                id="rolling-window"
                type="number"
                min="1"
                max={rollingWindowType === 'years' ? 20 : 240}
                value={rollingWindowValue}
                onChange={(e) => setRollingWindowValue(parseFloat(e.target.value) || 1)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 w-20"
              />
              <Select value={rollingWindowType} onValueChange={setRollingWindowType}>
                <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={calculateRolling}
              disabled={isLoading || funds.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Calculating...' : 'Calculate'}
            </Button>
          </div>
        </div>

        {/* Strategy and Period Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="investment-strategy">Investment Strategy</Label>
            <Select value={investmentStrategy} onValueChange={setInvestmentStrategy}>
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lumpsum">
                  <div className="flex flex-col">
                    <span className="font-medium">Lumpsum</span>
                    <span className="text-xs text-slate-500">Single investment per window</span>
                  </div>
                </SelectItem>
                <SelectItem value="sip">
                  <div className="flex flex-col">
                    <span className="font-medium">SIP</span>
                    <span className="text-xs text-slate-500">Monthly investments per window</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rolling-period">Rolling Period</Label>
            <Select 
              value={rollingPeriod} 
              onValueChange={setRollingPeriod}
              disabled={investmentStrategy === 'sip'}
            >
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  <div className="flex flex-col">
                    <span className="font-medium">Daily Rolling</span>
                    <span className="text-xs text-slate-500">Window moves by next NAV date</span>
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex flex-col">
                    <span className="font-medium">Monthly Rolling</span>
                    <span className="text-xs text-slate-500">Window moves by 1 month</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {investmentStrategy === 'sip' && (
              <p className="text-xs text-slate-500">
                SIP mode uses monthly rolling only
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Fund Selector for Chart */}
            <Card className="p-4 border-slate-200 bg-slate-50">
              <Label className="text-sm text-slate-700 mb-2 block">Select Fund to View</Label>
              <Select value={selectedFundView} onValueChange={setSelectedFundView}>
                <SelectTrigger className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bucket">
                    <span className="font-medium">Bucket Performance (All Funds)</span>
                  </SelectItem>
                  {result.fundData.map((fund) => (
                    <SelectItem key={fund.fundId} value={fund.fundId}>
                      {fund.fundName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Rolling Returns Chart */}
            <Card className="p-6 border-2 border-slate-200 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Rolling Returns - {selectedFundView === 'bucket' ? 'Bucket' : result.fundData.find(f => f.fundId === selectedFundView)?.fundName}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {investmentStrategy === 'lumpsum' ? 'Lumpsum' : 'SIP'} • {rollingPeriod === 'daily' ? 'Daily' : 'Monthly'} Rolling
                  </p>
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 text-sm px-3 py-1.5">
                  {rollingWindowValue} {rollingWindowType === 'years' ? 'Year' : 'Month'} Window
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="startDate" 
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}`;
                    }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}
                    formatter={(value: any) => [`${value.toFixed(2)}%`, 'XIRR Return']}
                    labelFormatter={(label) => {
                      // Find the corresponding rolling return data
                      const returnData = selectedFundView === 'bucket' 
                        ? result.bucketData.rollingReturns.find(r => r.startDate === label)
                        : result.fundData.find(f => f.fundId === selectedFundView)?.rollingReturns.find(r => r.startDate === label);
                      
                      if (returnData) {
                        const startDate = new Date(returnData.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        const endDate = new Date(returnData.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        const windowMonths = rollingWindowType === 'years' ? rollingWindowValue * 12 : rollingWindowValue;
                        return `Window: ${startDate} → ${endDate}\nInvestments: ${windowMonths} months × ₹${monthlyInvestment.toLocaleString('en-IN')}`;
                      }
                      return `Period starting: ${new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                    }}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="return" 
                    stroke={getSelectedColor()}
                    strokeWidth={2.5}
                    dot={{ fill: getSelectedColor(), r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    name="Rolling Return (XIRR)"
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Statistics Table */}
            <Card className="border-2 border-slate-200 shadow-xl">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Rolling Returns Statistics</h3>
                  <p className="text-sm text-slate-600">Statistical analysis of rolling window performance metrics</p>
                </div>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-slate-700">Fund Name</TableHead>
                        <TableHead className="text-slate-700 text-right">Mean %</TableHead>
                        <TableHead className="text-slate-700 text-right">Median %</TableHead>
                        <TableHead className="text-slate-700 text-right">Max %</TableHead>
                        <TableHead className="text-slate-700 text-right">Min %</TableHead>
                        <TableHead className="text-slate-700 text-right">Std Deviation %</TableHead>
                        <TableHead className="text-slate-700 text-right">Positive Periods %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Bucket Row */}
                      <TableRow className="bg-blue-50 hover:bg-blue-100 font-medium">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-900" />
                            <span className="text-slate-900">Bucket (All Funds)</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-slate-900">
                          {result.bucketData.mean.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-slate-900">
                          {result.bucketData.median.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-green-700">
                          {result.bucketData.max.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-red-700">
                          {result.bucketData.min.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-slate-900">
                          {result.bucketData.stdDev.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-slate-900">
                          {result.bucketData.positivePercentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      
                      {/* Individual Fund Rows */}
                      {result.fundData.map((fund, index) => (
                        <TableRow key={fund.fundId} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: fundColors[index % fundColors.length] }}
                              />
                              <span className="text-slate-900">{fund.fundName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            {fund.mean.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            {fund.median.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-green-700">
                            {fund.max.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-red-700">
                            {fund.min.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            {fund.stdDev.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            {fund.positivePercentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-slate-900 mb-2">Ready to Calculate</h3>
            <p className="text-slate-600">Configure rolling window parameters and click Calculate</p>
          </div>
        )}
      </div>
    </Card>
  );
}
