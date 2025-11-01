import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { SelectedFund } from '../../App';
import { fetchNAVData } from '../../services/navService';
import { calculateXIRR, calculateCAGR } from '../../utils/financialCalculations';
import { getNextAvailableNAV, getLatestNAVBeforeDate, getYearsBetween, getToday } from '../../utils/dateUtils';

interface SWPCalculatorProps {
  funds: SelectedFund[];
}

interface SWPCalculationResult {
  totalInvested: number;
  totalWithdrawn: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  cagr: number;
  xirr: number;
  fundResults: Array<{
    fundId: string;
    fundName: string;
    weightage: number;
    initialInvested: number;
    initialUnits: number;
    totalWithdrawn: number;
    remainingUnits: number;
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
    withdrawn: number;
    [key: string]: any;
  }>;
  withdrawalDates: Array<{
    date: string;
    actualDate: string;
    amount: number;
  }>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function SWPCalculator({ funds }: SWPCalculatorProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10000);
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Custom'>('Monthly');
  const [customFrequencyDays, setCustomFrequencyDays] = useState<number>(30);
  const [withdrawalMode, setWithdrawalMode] = useState<'Bucket' | 'Fund'>('Bucket');
  const [selectedFundForWithdrawal, setSelectedFundForWithdrawal] = useState<string>('');
  const [initialHoldings, setInitialHoldings] = useState<Record<string, number>>({});
  const [initialInvestmentValues, setInitialInvestmentValues] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SWPCalculationResult | null>(null);

  // Initialize initial holdings when funds change
  useEffect(() => {
    const holdings: Record<string, number> = {};
    const investments: Record<string, number> = {};
    funds.forEach(fund => {
      holdings[fund.id] = initialHoldings[fund.id] || 0;
      investments[fund.id] = initialInvestmentValues[fund.id] || 0;
    });
    setInitialHoldings(holdings);
    setInitialInvestmentValues(investments);
    
    // Set first fund as default for Fund Mode
    if (funds.length > 0 && !selectedFundForWithdrawal) {
      setSelectedFundForWithdrawal(funds[0].id);
    }
  }, [funds]);

  // Generate withdrawal dates based on frequency
  const generateWithdrawalDates = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    let currentDate = new Date(startDateObj);

    if (frequency === 'Monthly') {
      while (currentDate <= endDateObj) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else if (frequency === 'Quarterly') {
      while (currentDate <= endDateObj) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setMonth(currentDate.getMonth() + 3);
      }
    } else if (frequency === 'Custom') {
      while (currentDate <= endDateObj) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + customFrequencyDays);
      }
    }

    return dates;
  };

  const calculateSWP = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validation
      if (!startDate || !endDate) {
        throw new Error('Please select both start and end dates');
      }

      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('End date must be after start date');
      }

      if (withdrawalAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than 0');
      }

      if (funds.length === 0) {
        throw new Error('Please select at least one fund');
      }

      if (withdrawalMode === 'Fund' && !selectedFundForWithdrawal) {
        throw new Error('Please select a fund for Fund Mode withdrawal');
      }

      // Check if initial holdings are provided
      const totalInitialUnits = Object.values(initialHoldings).reduce((sum, units) => sum + (units || 0), 0);
      if (totalInitialUnits === 0) {
        throw new Error('Please enter initial holdings (number of units) for at least one fund');
      }

      // Fetch NAV data for all funds
      const schemeCodes = funds.map(f => f.id);
      const navResponses = await fetchNAVData(schemeCodes, startDate, endDate);

      if (navResponses.length === 0) {
        throw new Error('No NAV data available for the selected funds in the date range');
      }

      // Generate withdrawal dates
      const plannedWithdrawalDates = generateWithdrawalDates(startDate, endDate);

      // Initialize fund state
      const fundStates = funds.map(fund => {
        const navData = navResponses.find(nav => nav.schemeCode === fund.id);
        if (!navData) {
          throw new Error(`No NAV data found for fund: ${fund.name}`);
        }

        const initialUnits = initialHoldings[fund.id] || 0;
        const initialInvested = initialInvestmentValues[fund.id] || 0;

        return {
          fundId: fund.id,
          fundName: fund.name,
          weightage: fund.weightage,
          navData: navData.navData,
          currentUnits: initialUnits,
          initialUnits,
          initialInvested,
          totalWithdrawn: 0,
          cashflows: [] as Array<{ date: Date; amount: number }>,
          withdrawalHistory: [] as Array<{ date: string; amount: number; units: number; nav: number }>,
        };
      });

      // Calculate initial total investment value (for XIRR base)
      const initialTotalInvestment = Object.values(initialInvestmentValues).reduce((sum, val) => sum + (val || 0), 0);
      
      // If initial investment values are not provided, estimate from initial NAV
      let estimatedInitialInvestment = initialTotalInvestment;
      if (estimatedInitialInvestment === 0) {
        // Try to estimate from initial NAV on start date
        let totalEstimated = 0;
        fundStates.forEach(state => {
          const startNav = getNextAvailableNAV(state.navData, startDate);
          if (startNav && state.initialUnits > 0) {
            totalEstimated += state.initialUnits * startNav.nav;
          }
        });
        estimatedInitialInvestment = totalEstimated;
      }

      // Track overall cashflows for XIRR (initial investment as negative)
      const overallCashflows: Array<{ date: Date; amount: number }> = [];
      
      // Add initial investment as negative cashflow (at start date)
      if (estimatedInitialInvestment > 0) {
        overallCashflows.push({ date: new Date(startDate), amount: -estimatedInitialInvestment });
      }

      // Process each withdrawal date
      const withdrawalDatesProcessed: Array<{ date: string; actualDate: string; amount: number }> = [];
      const chartDataPoints: Array<{
        date: string;
        invested: number;
        value: number;
        withdrawn: number;
        [key: string]: any;
      }> = [];

      let totalWithdrawn = 0;
      let stoppedEarly = false;

      for (const plannedDate of plannedWithdrawalDates) {
        // Check if we've exhausted NAV data
        const hasAvailableNAV = fundStates.some(state => {
          const navEntry = getNextAvailableNAV(state.navData, plannedDate);
          return navEntry !== null;
        });

        if (!hasAvailableNAV) {
          console.log(`No NAV data available after ${plannedDate}, stopping SWP`);
          stoppedEarly = true;
          break;
        }

        // Get actual withdrawal date (next available NAV date)
        let actualWithdrawalDate = plannedDate;
        let totalBucketValue = 0;
        let totalRemainingUnits = 0;

        // Calculate current bucket value before withdrawal
        fundStates.forEach(state => {
          const navEntry = getNextAvailableNAV(state.navData, plannedDate);
          if (navEntry) {
            actualWithdrawalDate = navEntry.date > actualWithdrawalDate ? navEntry.date : actualWithdrawalDate;
            const fundValue = state.currentUnits * navEntry.nav;
            totalBucketValue += fundValue;
          }
        });

        // Check if we have enough value to withdraw
        if (totalBucketValue < withdrawalAmount) {
          console.log(`Insufficient portfolio value (${totalBucketValue}) for withdrawal (${withdrawalAmount}) on ${actualWithdrawalDate}`);
          stoppedEarly = true;
          break;
        }

        let totalUnitsSold = 0;
        let remainingWithdrawal = withdrawalAmount;

        if (withdrawalMode === 'Bucket') {
          // Distribute withdrawal across all funds by weightage
          fundStates.forEach(state => {
            const navEntry = getNextAvailableNAV(state.navData, plannedDate);
            if (!navEntry) return;

            const withdrawalShare = withdrawalAmount * (state.weightage / 100);
            const navOnDate = navEntry.nav;

            // Calculate how many units can be sold from this fund
            const maxUnitsAvailable = state.currentUnits;
            const unitsToSellForShare = withdrawalShare / navOnDate;
            const unitsToSell = Math.min(unitsToSellForShare, maxUnitsAvailable);

            if (unitsToSell > 0 && state.currentUnits >= unitsToSell) {
              const actualWithdrawnAmount = unitsToSell * navOnDate;
              state.currentUnits = Math.max(0, state.currentUnits - unitsToSell);
              state.totalWithdrawn += actualWithdrawnAmount;
              totalUnitsSold += unitsToSell;
              remainingWithdrawal -= actualWithdrawnAmount;

              state.withdrawalHistory.push({
                date: navEntry.date,
                amount: actualWithdrawnAmount,
                units: unitsToSell,
                nav: navOnDate,
              });

              state.cashflows.push({
                date: new Date(navEntry.date),
                amount: actualWithdrawnAmount,
              });

              overallCashflows.push({
                date: new Date(navEntry.date),
                amount: actualWithdrawnAmount,
              });
            }
          });

          // If there's remaining withdrawal due to insufficient units, try to distribute proportionally
          if (remainingWithdrawal > 0.01 && totalUnitsSold > 0) {
            // Distribute remaining proportionally across funds that still have units
            fundStates.forEach(state => {
              if (remainingWithdrawal <= 0.01 || state.currentUnits <= 0) return;

              const navEntry = getNextAvailableNAV(state.navData, plannedDate);
              if (!navEntry) return;

              const proportion = state.currentUnits / fundStates.reduce((sum, s) => {
                const sNav = getNextAvailableNAV(s.navData, plannedDate);
                return sum + (sNav && s.currentUnits > 0 ? s.currentUnits : 0);
              }, 0);

              const additionalWithdrawal = remainingWithdrawal * proportion;
              const additionalUnits = Math.min(additionalWithdrawal / navEntry.nav, state.currentUnits);

              if (additionalUnits > 0) {
                const actualWithdrawnAmount = additionalUnits * navEntry.nav;
                state.currentUnits = Math.max(0, state.currentUnits - additionalUnits);
                state.totalWithdrawn += actualWithdrawnAmount;
                remainingWithdrawal -= actualWithdrawnAmount;

                const existingHistory = state.withdrawalHistory.find(w => w.date === navEntry.date);
                if (existingHistory) {
                  existingHistory.amount += actualWithdrawnAmount;
                  existingHistory.units += additionalUnits;
                } else {
                  state.withdrawalHistory.push({
                    date: navEntry.date,
                    amount: actualWithdrawnAmount,
                    units: additionalUnits,
                    nav: navEntry.nav,
                  });
                }

                state.cashflows.push({
                  date: new Date(navEntry.date),
                  amount: actualWithdrawnAmount,
                });

                overallCashflows.push({
                  date: new Date(navEntry.date),
                  amount: actualWithdrawnAmount,
                });
              }
            });
          }

        } else {
          // Fund Mode: Withdraw only from selected fund
          const selectedState = fundStates.find(s => s.fundId === selectedFundForWithdrawal);
          if (!selectedState) {
            throw new Error('Selected fund not found');
          }

          const navEntry = getNextAvailableNAV(selectedState.navData, plannedDate);
          if (!navEntry) {
            console.log(`No NAV data for selected fund on ${plannedDate}`);
            continue;
          }

          const navOnDate = navEntry.nav;
          const unitsToSell = Math.min(withdrawalAmount / navOnDate, selectedState.currentUnits);

          if (unitsToSell > 0 && selectedState.currentUnits >= unitsToSell) {
            const actualWithdrawnAmount = unitsToSell * navOnDate;
            selectedState.currentUnits = Math.max(0, selectedState.currentUnits - unitsToSell);
            selectedState.totalWithdrawn += actualWithdrawnAmount;
            totalUnitsSold = unitsToSell;
            remainingWithdrawal = withdrawalAmount - actualWithdrawnAmount;

            selectedState.withdrawalHistory.push({
              date: navEntry.date,
              amount: actualWithdrawnAmount,
              units: unitsToSell,
              nav: navOnDate,
            });

            selectedState.cashflows.push({
              date: new Date(navEntry.date),
              amount: actualWithdrawnAmount,
            });

            overallCashflows.push({
              date: new Date(navEntry.date),
              amount: actualWithdrawnAmount,
            });

            actualWithdrawalDate = navEntry.date;
          } else {
            console.log(`Insufficient units in selected fund for withdrawal on ${plannedDate}`);
            stoppedEarly = true;
            break;
          }
        }

        const actualWithdrawnAmount = withdrawalAmount - remainingWithdrawal;
        totalWithdrawn += actualWithdrawnAmount;
        withdrawalDatesProcessed.push({
          date: plannedDate,
          actualDate: actualWithdrawalDate,
          amount: actualWithdrawnAmount,
        });

        // Calculate portfolio value after this withdrawal for chart
        let currentBucketValue = 0;
        const chartPoint: any = {
          date: actualWithdrawalDate,
          invested: estimatedInitialInvestment,
          value: 0,
          withdrawn: totalWithdrawn,
        };

        fundStates.forEach(state => {
          const navEntry = getLatestNAVBeforeDate(state.navData, actualWithdrawalDate);
          if (navEntry) {
            const fundValue = state.currentUnits * navEntry.nav;
            currentBucketValue += fundValue;
            chartPoint[state.fundName] = fundValue;
          }
        });

        chartPoint.value = currentBucketValue;
        chartDataPoints.push(chartPoint);
      }

      // Calculate final values and metrics
      const finalNavDate = endDate;
      let finalBucketValue = 0;
      const fundResults = fundStates.map(state => {
        const finalNavEntry = getLatestNAVBeforeDate(state.navData, finalNavDate);
        const finalNav = finalNavEntry?.nav || 0;
        const currentValue = state.currentUnits * finalNav;
        finalBucketValue += currentValue;

        // Calculate individual fund cashflows (initial investment as negative)
        const fundCashflows = [...state.cashflows];
        if (state.initialInvested > 0) {
          fundCashflows.unshift({ date: new Date(startDate), amount: -state.initialInvested });
        } else {
          // Estimate from initial NAV
          const startNavEntry = getNextAvailableNAV(state.navData, startDate);
          if (startNavEntry && state.initialUnits > 0) {
            const estimatedInvestment = state.initialUnits * startNavEntry.nav;
            fundCashflows.unshift({ date: new Date(startDate), amount: -estimatedInvestment });
          }
        }

        const years = getYearsBetween(startDate, endDate);
        const fundXIRR = fundCashflows.length > 1 ? calculateXIRR(fundCashflows) : 0;
        const fundCAGR = years > 0 && state.initialInvested > 0
          ? calculateCAGR(state.initialInvested, currentValue + state.totalWithdrawn, years)
          : 0;

        const profit = (currentValue + state.totalWithdrawn) - (state.initialInvested || (state.initialUnits * (getNextAvailableNAV(state.navData, startDate)?.nav || 0)));
        const profitPercentage = state.initialInvested > 0 ? (profit / state.initialInvested) * 100 : 0;

        return {
          fundId: state.fundId,
          fundName: state.fundName,
          weightage: state.weightage,
          initialInvested: state.initialInvested || (state.initialUnits * (getNextAvailableNAV(state.navData, startDate)?.nav || 0)),
          initialUnits: state.initialUnits,
          totalWithdrawn: state.totalWithdrawn,
          remainingUnits: parseFloat(state.currentUnits.toFixed(4)),
          currentValue,
          profit,
          profitPercentage,
          cagr: fundCAGR,
          xirr: fundXIRR,
        };
      });

      // Calculate overall metrics
      const years = getYearsBetween(startDate, endDate);
      const overallCAGR = years > 0 && estimatedInitialInvestment > 0
        ? calculateCAGR(estimatedInitialInvestment, finalBucketValue + totalWithdrawn, years)
        : 0;
      const overallXIRR = overallCashflows.length > 1 ? calculateXIRR(overallCashflows) : 0;

      const totalProfit = (finalBucketValue + totalWithdrawn) - estimatedInitialInvestment;
      const profitPercentage = estimatedInitialInvestment > 0 ? (totalProfit / estimatedInitialInvestment) * 100 : 0;

      // Add initial point to chart
      if (chartDataPoints.length > 0) {
        const initialPoint: any = {
          date: startDate,
          invested: estimatedInitialInvestment,
          value: estimatedInitialInvestment,
          withdrawn: 0,
        };

        fundStates.forEach(state => {
          const navEntry = getNextAvailableNAV(state.navData, startDate);
          if (navEntry) {
            initialPoint[state.fundName] = state.initialUnits * navEntry.nav;
          }
        });

        chartDataPoints.unshift(initialPoint);
      }

      // Add final point to chart
      const finalPoint: any = {
        date: finalNavDate,
        invested: estimatedInitialInvestment,
        value: finalBucketValue,
        withdrawn: totalWithdrawn,
      };

      fundStates.forEach(state => {
        const navEntry = getLatestNAVBeforeDate(state.navData, finalNavDate);
        if (navEntry) {
          finalPoint[state.fundName] = state.currentUnits * navEntry.nav;
        }
      });

      chartDataPoints.push(finalPoint);

      // Sort chart data by date
      chartDataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setResult({
        totalInvested: estimatedInitialInvestment,
        totalWithdrawn,
        currentValue: finalBucketValue,
        profit: totalProfit,
        profitPercentage,
        cagr: overallCAGR,
        xirr: overallXIRR,
        fundResults,
        chartData: chartDataPoints,
        withdrawalDates: withdrawalDatesProcessed,
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during calculation.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">SWP Calculator</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={getToday()}
            />
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

          <div>
            <Label htmlFor="withdrawal-amount">Withdrawal Amount (₹)</Label>
            <Input
              id="withdrawal-amount"
              type="number"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
              placeholder="10000"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Withdrawal Frequency</Label>
            <Select value={frequency} onValueChange={(value: 'Monthly' | 'Quarterly' | 'Custom') => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'Custom' && (
            <div>
              <Label htmlFor="custom-frequency">Custom Frequency (Days)</Label>
              <Input
                id="custom-frequency"
                type="number"
                value={customFrequencyDays}
                onChange={(e) => setCustomFrequencyDays(Number(e.target.value))}
                min="1"
                placeholder="30"
              />
            </div>
          )}

          <div>
            <Label htmlFor="withdrawal-mode">Withdrawal Mode</Label>
            <Select value={withdrawalMode} onValueChange={(value: 'Bucket' | 'Fund') => setWithdrawalMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bucket">Bucket Mode (Distribute by Weightage)</SelectItem>
                <SelectItem value="Fund">Fund Mode (Single Fund)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {withdrawalMode === 'Fund' && (
            <div>
              <Label htmlFor="selected-fund">Select Fund for Withdrawal</Label>
              <Select value={selectedFundForWithdrawal} onValueChange={setSelectedFundForWithdrawal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a fund" />
                </SelectTrigger>
                <SelectContent>
                  {funds.map(fund => (
                    <SelectItem key={fund.id} value={fund.id}>
                      {fund.name} ({fund.weightage}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Initial Holdings Section */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Label className="text-base font-semibold mb-3 block">Initial Holdings</Label>
          <p className="text-sm text-slate-600 mb-4">
            Enter the number of units you currently hold in each fund (before SWP withdrawals begin)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funds.map(fund => (
              <div key={fund.id}>
                <Label htmlFor={`initial-units-${fund.id}`}>
                  {fund.name} - Units
                </Label>
                <Input
                  id={`initial-units-${fund.id}`}
                  type="number"
                  value={initialHoldings[fund.id] || ''}
                  onChange={(e) => setInitialHoldings({
                    ...initialHoldings,
                    [fund.id]: Number(e.target.value) || 0,
                  })}
                  placeholder="0.0000"
                  step="0.0001"
                  min="0"
                />
              </div>
            ))}
          </div>

          {/* Optional: Initial Investment Values */}
          <div className="mt-4">
            <Label className="text-sm font-medium mb-2 block">Initial Investment Values (Optional - for accurate XIRR)</Label>
            <p className="text-xs text-slate-500 mb-2">
              If you know the initial investment amount for each fund, enter it here. Otherwise, it will be estimated from initial NAV.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funds.map(fund => (
                <div key={fund.id}>
                  <Label htmlFor={`initial-investment-${fund.id}`}>
                    {fund.name} - Initial Investment (₹)
                  </Label>
                  <Input
                    id={`initial-investment-${fund.id}`}
                    type="number"
                    value={initialInvestmentValues[fund.id] || ''}
                    onChange={(e) => setInitialInvestmentValues({
                      ...initialInvestmentValues,
                      [fund.id]: Number(e.target.value) || 0,
                    })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={calculateSWP}
          disabled={isLoading || funds.length === 0 || !startDate || !endDate}
          className="w-full mt-6"
        >
          {isLoading ? 'Calculating...' : 'Calculate SWP'}
        </Button>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {result && (
        <>
          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Total Invested</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(result.totalInvested)}</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Total Withdrawn</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(result.totalWithdrawn)}</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Current Value</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(result.currentValue)}</div>
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
                {result.profitPercentage >= 0 ? '+' : ''}{result.profitPercentage.toFixed(2)}%
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">CAGR</div>
              <div className={`text-2xl font-bold ${
                result.cagr >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.cagr >= 0 ? '+' : ''}{result.cagr.toFixed(2)}%
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-violet-50 to-fuchsia-100 border-2 border-violet-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">XIRR</div>
              <div className={`text-2xl font-bold ${
                result.xirr >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.xirr >= 0 ? '+' : ''}{result.xirr.toFixed(2)}%
              </div>
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
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  }}
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
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <RechartsLegend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />

                {/* Invested Amount Line (Dotted) */}
                <Line
                  type="monotone"
                  dataKey="invested"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Total Invested"
                  dot={false}
                />

                {/* Bucket Performance Line (Solid Black) */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1f2937"
                  strokeWidth={3}
                  name="Bucket Value"
                  dot={false}
                />

                {/* Individual Fund Lines */}
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
              <p className="text-sm text-slate-600">Detailed breakdown of each fund's performance during SWP</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>Initial Invested</TableHead>
                  <TableHead>Initial Units</TableHead>
                  <TableHead>Total Withdrawn</TableHead>
                  <TableHead>Remaining Units</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Profit/Loss</TableHead>
                  <TableHead>% Return</TableHead>
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
                      <TableCell>{formatCurrency(fund.initialInvested)}</TableCell>
                      <TableCell>{fund.initialUnits.toFixed(4)}</TableCell>
                      <TableCell>{formatCurrency(fund.totalWithdrawn)}</TableCell>
                      <TableCell>{fund.remainingUnits.toFixed(4)}</TableCell>
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
