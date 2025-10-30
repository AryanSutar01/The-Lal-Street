import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { SelectedFund } from '../../App';
import { fetchNAVData } from '../../services/navService';
import { calculateXIRR, calculateCAGR } from '../../utils/financialCalculations';
import { getDatesBetween, getNextAvailableNAV, getLatestNAVBeforeDate, getYearsBetween, addMonths } from '../../utils/dateUtils';

interface SIPCalculatorProps {
  funds: SelectedFund[];
}

interface SIPCalculationResult {
  totalInvested: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  cagr: number;
  xirr: number;
  installments: number;
  fundResults: Array<{
    fundId: string;
    fundName: string;
    weightage: number;
    totalInvested: number;
    units: number;
    currentValue: number;
    profit: number;
    profitPercentage: number;
    cagr: number;
    xirr: number;
  }>;
  chartData: Array<{
    date: string;
    invested: number;
    value: number;
    [key: string]: any;
  }>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export function SIPCalculator({ funds }: SIPCalculatorProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [startDate, setStartDate] = useState<string>('2020-01-01');
  const [endDate, setEndDate] = useState<string>(getToday());
  const [result, setResult] = useState<SIPCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [minAvailableDate, setMinAvailableDate] = useState<string | null>(null);

  useEffect(() => {
    if (funds.length > 0) {
      // Find the latest launch date among selected funds
      // This is the earliest date we can start the SIP
      const launchDates = funds
        .map(f => new Date(f.launchDate))
        .filter(date => !isNaN(date.getTime()));
      
      if (launchDates.length > 0) {
        // Get the latest (most recent) launch date
        const latestLaunchDate = new Date(Math.max(...launchDates.map(d => d.getTime())));
        const formattedDate = latestLaunchDate.toISOString().split('T')[0];
        setMinAvailableDate(formattedDate);
        
        // If current start date is before the latest launch date, update it
        if (new Date(startDate) < latestLaunchDate) {
          setStartDate(formattedDate);
        }
      }
    } else {
      setMinAvailableDate(null);
    }
  }, [funds]);

  const calculateSIP = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const fundSchemeCodes = funds.map(f => f.id);
      console.log('Fetching NAV data for funds:', fundSchemeCodes);
      console.log('Date range:', startDate, 'to', endDate);
      
      const navResponses = await fetchNAVData(fundSchemeCodes, startDate, endDate);
      console.log('NAV Responses received:', navResponses);

      if (navResponses.length === 0) {
        throw new Error("No NAV data available for the selected funds in the given period.");
      }

      // Generate SIP dates dynamically based on actual investment dates
      // Start with the initial start date
      const actualSIPDates: Array<{plannedDate: string, actualDate: string}> = [];
      let currentPlannedDate = startDate;
      let lastActualDate: string | null = null;
      const end = new Date(endDate);

      // Keep adding months - we need to continue even if we go slightly past end date
      // because actual investment dates might be delayed by holidays
      let loopCount = 0;
      while (true) {
        loopCount++;
        const plannedDateObj = new Date(currentPlannedDate);
        
        // Stop if planned date is more than 1 month beyond end date
        // This ensures we capture the last investment even if end date is a holiday
        const daysFromEnd = Math.ceil((plannedDateObj.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
        if (plannedDateObj.getTime() > end.getTime() + (32 * 24 * 60 * 60 * 1000)) {
          console.log(`[SIP Loop] STOPPED - Planned date too far: ${currentPlannedDate} (${daysFromEnd} days from end)`);
          break;
        }

        // For each fund, find the actual NAV date (next available after planned)
        const firstFundNav = navResponses[0];
        let navEntry = getNextAvailableNAV(firstFundNav.navData, currentPlannedDate);
        
        // If no NAV found but planned date is in same month/year as end date,
        // try to find ANY NAV in that month
        if (!navEntry) {
          const plannedYear = plannedDateObj.getFullYear();
          const plannedMonth = plannedDateObj.getMonth();
          const endYear = end.getFullYear();
          const endMonth = end.getMonth();
          
          if (plannedYear === endYear && plannedMonth === endMonth) {
            // Look for any NAV in the end month
            const firstDayOfMonth = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;
            navEntry = getNextAvailableNAV(firstFundNav.navData, firstDayOfMonth);
            console.log(`[SIP Loop ${loopCount}] Planned ${currentPlannedDate} in end month, trying ${firstDayOfMonth}, found: ${navEntry?.date}`);
          } else {
            console.log(`[SIP Loop ${loopCount}] No NAV found for planned: ${currentPlannedDate}, trying next month`);
          }
        }
        
        if (navEntry) {
          const actualInvestmentDate = new Date(navEntry.date);
          
          // Allow investment if:
          // 1. Planned date month/year is on or before end date month/year, OR
          // 2. Actual investment is within 7 days after end date (holiday buffer)
          const daysDiff = Math.ceil((actualInvestmentDate.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
          
          // Check month and year comparison
          const plannedYear = plannedDateObj.getFullYear();
          const plannedMonth = plannedDateObj.getMonth();
          const endYear = end.getFullYear();
          const endMonth = end.getMonth();
          
          const isPlannedBeforeOrSameMonth = 
            (plannedYear < endYear) || 
            (plannedYear === endYear && plannedMonth <= endMonth);
          
          // Check if this investment should be included:
          const shouldInclude = 
            isPlannedBeforeOrSameMonth || 
            (daysDiff >= 0 && daysDiff <= 7);
          
          // Log near end date for debugging
          if (plannedDateObj.getTime() > end.getTime() - (60 * 24 * 60 * 60 * 1000)) {
            console.log(`[SIP Date Check] Planned: ${currentPlannedDate} (${plannedYear}-${plannedMonth+1}), Actual: ${navEntry.date}, End: ${endDate} (${endYear}-${endMonth+1}), isPlannedBeforeOrSameMonth: ${isPlannedBeforeOrSameMonth}, Days after end: ${daysDiff}, Include: ${shouldInclude}`);
          }
          
          if (shouldInclude) {
            actualSIPDates.push({
              plannedDate: currentPlannedDate,
              actualDate: navEntry.date
            });
            lastActualDate = navEntry.date;
            
            // Calculate next planned date
            // Use actual date to maintain consistent day-of-month, but check if we've covered end month
            const actualDateObj = new Date(navEntry.date);
            const actualYear = actualDateObj.getFullYear();
            const actualMonth = actualDateObj.getMonth();
            
            // If we just invested in the same month/year as end date, we're done
            if (actualYear === endYear && actualMonth === endMonth) {
              console.log(`[SIP Date Check] Completed - Just invested in end month (${actualYear}-${actualMonth+1})`);
              break;
            }
            
            // IMPORTANT: Next investment should be 1 month from PLANNED date (same day each month)
            // This resets to the original day (e.g., if started on 1st, always try 1st of next month)
            currentPlannedDate = addMonths(currentPlannedDate, 1);
          } else {
            console.log(`[SIP Date Check] STOPPED - Investment not included`);
            // If we shouldn't include, stop the loop
            break;
          }
        } else {
          // If no NAV found, try next month from planned date
          currentPlannedDate = addMonths(currentPlannedDate, 1);
        }
      }

      console.log('=== SIP DATES SUMMARY ===');
      console.log('Actual SIP Dates generated:', actualSIPDates.length, 'months');
      console.log('Start date:', startDate);
      console.log('End date:', endDate);
      console.log('First 5 dates:', actualSIPDates.slice(0, 5));
      console.log('Last 5 dates:', actualSIPDates.slice(-5));
      console.log('========================');
      
      const totalMonths = actualSIPDates.length;
      const totalInvested = monthlyInvestment * totalMonths;

      const fundResults = funds.map(fund => {
        const navData = navResponses.find(nav => nav.schemeCode === fund.id);
        console.log(`Processing fund ${fund.id}:`, navData);
        
        if (!navData) {
          throw new Error(`No NAV data found for fund: ${fund.name} (${fund.id})`);
        }
        
        if (navData.navData.length === 0) {
          throw new Error(`NAV data is empty for fund: ${fund.name}. Try selecting a different date range.`);
        }

        let totalUnits = 0;
        let fundInvested = 0;
        const monthlyData: Array<{plannedDate: string, actualDate: string, invested: number, units: number, nav: number, value: number}> = [];

        actualSIPDates.forEach(({ plannedDate, actualDate }) => {
          // Get NEXT AVAILABLE NAV on or after the planned date
          const navEntry = getNextAvailableNAV(navData.navData, plannedDate);
          
          if (navEntry && navEntry.nav > 0) {
            const monthlyAmount = monthlyInvestment * (fund.weightage / 100);
            const unitsPurchased = monthlyAmount / navEntry.nav;
            totalUnits += unitsPurchased;
            fundInvested += monthlyAmount;
            
            monthlyData.push({
              plannedDate,
              actualDate: navEntry.date, // Track when investment actually happened
              invested: fundInvested,
              units: totalUnits,
              nav: navEntry.nav,
              value: totalUnits * navEntry.nav
            });
          }
        });

        // Get LATEST AVAILABLE NAV on or before end date for final valuation
        const finalNavEntry = getLatestNAVBeforeDate(navData.navData, endDate);
        const currentValue = totalUnits * (finalNavEntry?.nav || 0);
        const profit = currentValue - fundInvested;
        const profitPercentage = fundInvested > 0 ? (profit / fundInvested) * 100 : 0;
        
        // Calculate years using actual dates
        const years = getYearsBetween(startDate, endDate);
        const cagr = calculateCAGR(fundInvested, currentValue, years);
        
        // Calculate XIRR for individual fund
        const fundCashFlows = [
          ...monthlyData.map(data => ({
            date: new Date(data.actualDate),
            amount: -(monthlyInvestment * (fund.weightage / 100))  // Fund's portion
          })),
          {
            date: new Date(endDate),
            amount: currentValue  // Final value of this fund
          }
        ];
        const fundXIRR = calculateXIRR(fundCashFlows);

        return {
          fundId: fund.id,
          fundName: fund.name,
          weightage: fund.weightage,
          totalInvested: fundInvested,
          units: totalUnits,
          currentValue,
          profit,
          profitPercentage,
          cagr,
          xirr: fundXIRR
        };
      });

      // Calculate portfolio-level metrics
      const portfolioInvested = fundResults.reduce((sum, fund) => sum + fund.totalInvested, 0);
      const portfolioValue = fundResults.reduce((sum, fund) => sum + fund.currentValue, 0);
      const portfolioProfit = portfolioValue - portfolioInvested;
      const portfolioProfitPercentage = portfolioInvested > 0 ? (portfolioProfit / portfolioInvested) * 100 : 0;
      
      const years = getYearsBetween(startDate, endDate);
      const portfolioCAGR = calculateCAGR(portfolioInvested, portfolioValue, years);

      // Calculate XIRR using actual investment dates
      const cashFlows = [
        ...actualSIPDates.map(({ actualDate }) => ({
          date: new Date(actualDate),  // Use ACTUAL investment date
          amount: -monthlyInvestment  // Negative = outflow (investment)
        })),
        {
          date: new Date(endDate),
          amount: portfolioValue  // Positive = inflow (final value)
        }
      ];
      const xirr = calculateXIRR(cashFlows);
      
      console.log('Portfolio Metrics:', {
        invested: portfolioInvested,
        value: portfolioValue,
        profit: portfolioProfit,
        cagr: portfolioCAGR,
        xirr: xirr
      });

      // Generate chart data - show portfolio and individual fund performance over time
      // We need to track units accumulated for each fund at each date
      const fundUnitTracking = new Map<string, Array<{date: string, units: number, invested: number, nav: number}>>();
      
      // Initialize tracking for each fund
      funds.forEach(fund => {
        fundUnitTracking.set(fund.id, []);
      });

      // Build cumulative units for each fund at each SIP date
      actualSIPDates.forEach(({ plannedDate, actualDate }, index) => {
        funds.forEach(fund => {
          const navData = navResponses.find(nav => nav.schemeCode === fund.id);
          if (navData) {
            // Use the same NAV lookup logic as main loop
            let navEntry = getNextAvailableNAV(navData.navData, plannedDate);
            
            // If no NAV found for planned date, try using actual date
            if (!navEntry) {
              navEntry = getNextAvailableNAV(navData.navData, actualDate);
              console.log(`[Unit Tracking ${index}] No NAV for planned ${plannedDate}, using actual ${actualDate}, found: ${navEntry?.date}`);
            }
            
            if (navEntry) {
              const fundMonthlyAmount = monthlyInvestment * (fund.weightage / 100);
              const unitsPurchased = fundMonthlyAmount / navEntry.nav;
              
              const prevData = fundUnitTracking.get(fund.id)!;
              const prevUnits = prevData.length > 0 ? prevData[prevData.length - 1].units : 0;
              const prevInvested = prevData.length > 0 ? prevData[prevData.length - 1].invested : 0;
              
              prevData.push({
                date: actualDate,  // Use actual investment date
                units: prevUnits + unitsPurchased,
                invested: prevInvested + fundMonthlyAmount,
                nav: navEntry.nav  // Store the NAV used for this investment
              });
            } else {
              console.log(`[Unit Tracking ${index}] ERROR - No NAV found for planned: ${plannedDate}, actual: ${actualDate}`);
            }
          }
        });
      });

      // Generate chart data with individual fund values
      const chartData = actualSIPDates.map(({ actualDate, plannedDate }, index) => {
        const monthNumber = index + 1;
        const cumulativeInvested = monthlyInvestment * monthNumber;
        
        const dateObj = new Date(actualDate);
        const dataPoint: any = {
          date: dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          fullDate: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          invested: cumulativeInvested,
        };

        let bucketValue = 0;

        // Calculate value for each fund at this date
        // Market value = cumulative units × NAV on that date
        funds.forEach(fund => {
          const navData = navResponses.find(nav => nav.schemeCode === fund.id);
          const unitData = fundUnitTracking.get(fund.id);
          
          if (navData && unitData && unitData[index]) {
            // Use the NAV from this investment date to value all accumulated units
            const currentNav = unitData[index].nav;
            const fundValue = unitData[index].units * currentNav;
            
            // Debug for last point
            if (index === actualSIPDates.length - 1) {
              console.log(`[Chart Last Point] Date: ${actualDate}, Units: ${unitData[index].units}, NAV: ${currentNav}, Value: ${fundValue}`);
            }
            
            dataPoint[fund.name] = fundValue;
            bucketValue += fundValue;
          }
        });

        dataPoint['Bucket Performance'] = bucketValue;

        return dataPoint;
      });
      
      console.log('=== CHART DATA ===');
      console.log('Total chart points:', chartData.length);
      console.log('First chart point:', chartData[0]);
      console.log('Last chart point:', chartData[chartData.length - 1]);
      console.log('==================');

      setResult({
        totalInvested: portfolioInvested,
        currentValue: portfolioValue,
        profit: portfolioProfit,
        profitPercentage: portfolioProfitPercentage,
        cagr: portfolioCAGR,
        xirr,
        installments: actualSIPDates.length,
        fundResults,
        chartData
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during calculation.");
      setIsLoading(false);
    }
  };

  const isValidAllocation = funds.reduce((sum, fund) => sum + fund.weightage, 0) === 100;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">SIP Calculator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="monthly-investment">Monthly Investment (₹)</Label>
            <Input
              id="monthly-investment"
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              placeholder="10000"
              min="100"
            />
          </div>
          
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minAvailableDate || undefined}
            />
            {minAvailableDate && (
              <p className="text-xs text-gray-500 mt-1">
                Earliest available: {new Date(minAvailableDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={getToday()}
            />
          </div>
        </div>

            <Button 
              onClick={calculateSIP}
          disabled={!isValidAllocation || isLoading || funds.length === 0}
          className="w-full"
            >
          {isLoading ? 'Calculating...' : 'Calculate SIP'}
            </Button>

        {!isValidAllocation && (
          <p className="text-red-600 text-sm mt-2">
            Please ensure portfolio allocation totals 100%
          </p>
        )}
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

        {result && (
        <>
            {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Total Invested</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(result.totalInvested)}</div>
              <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {result.installments} installments
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Current Value</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(result.currentValue)}</div>
              <div className="text-xs text-indigo-600 mt-2">Portfolio worth</div>
            </Card>

            <Card className={`p-5 border-2 shadow-lg hover:shadow-xl transition-shadow ${
              result.profit >= 0 
                ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'
            }`}>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                result.profit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>Profit/Loss</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${
                result.profit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.profit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {formatCurrency(result.profit)}
              </div>
              <div className={`text-xs mt-2 ${
                result.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.profitPercentage >= 0 ? '+' : ''}{result.profitPercentage.toFixed(2)}% returns
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">CAGR</div>
              <div className={`text-2xl font-bold ${
                result.cagr >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.cagr >= 0 ? '+' : ''}{result.cagr.toFixed(2)}%
              </div>
              <div className="text-xs text-amber-600 mt-2">Annualized return</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">XIRR</div>
              <div className={`text-2xl font-bold ${
                result.xirr >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.xirr >= 0 ? '+' : ''}{result.xirr.toFixed(2)}%
              </div>
              <div className="text-xs text-purple-600 mt-2">Internal rate</div>
            </Card>
          </div>

            {/* Chart */}
          <Card className="p-6 border-2 border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Performance Over Time</h3>
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                {result.chartData.length} data points
              </Badge>
            </div>
              <ResponsiveContainer width="100%" height={450}>
              <LineChart data={result.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return `Investment Date: ${payload[0].payload.fullDate}`;
                      }
                      return label;
                    }}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  {/* @ts-ignore */}
                  <RechartsLegend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                  
                  {/* Bucket Performance Line (Bold Black) */}
                  <Line 
                    type="monotone" 
                  dataKey="Bucket Performance" 
                  stroke="#1f2937" 
                  strokeWidth={3}
                    name="Bucket Performance"
                  dot={false}
                  />
                  
                  {/* Individual Fund Lines with Different Colors */}
                  {result.fundResults.map((fund, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    return (
                      <Line 
                        key={fund.fundId}
                        type="monotone" 
                        dataKey={fund.fundName} 
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        name={fund.fundName}
                        dot={false}
                      />
                    );
                  })}
                </LineChart>
            </ResponsiveContainer>
            </Card>

          {/* Fund Details Table */}
          <Card className="p-6 border-2 border-slate-200 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Individual Fund Performance</h3>
              <p className="text-sm text-slate-600">Detailed breakdown of each fund's contribution to your portfolio</p>
            </div>
                  <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>Total Invested</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Profit/Loss</TableHead>
                  <TableHead>% Returns</TableHead>
                  <TableHead>CAGR</TableHead>
                  <TableHead>XIRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.fundResults.map((fund, index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  const fundColor = colors[index % colors.length];
                  
                  return (
                    <TableRow key={fund.fundId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: fundColor }}
                          />
                          {fund.fundName}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(fund.totalInvested)}</TableCell>
                      <TableCell>{formatCurrency(fund.currentValue)}</TableCell>
                      <TableCell className={fund.profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {fund.profit >= 0 ? '+' : ''}{formatCurrency(fund.profit)}
                      </TableCell>
                      <TableCell className={fund.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.profitPercentage >= 0 ? '+' : ''}{fund.profitPercentage.toFixed(2)}%
                      </TableCell>
                      <TableCell className={fund.cagr >= 0 ? 'text-black' : 'text-red-600'}>
                        {fund.cagr.toFixed(2)}%
                      </TableCell>
                      <TableCell className={fund.xirr >= 0 ? 'text-black' : 'text-red-600'}>
                        {fund.xirr.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
        )}
      </div>
  );
}