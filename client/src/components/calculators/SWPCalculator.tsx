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
import { getLatestNAVBeforeDate, getYearsBetween, getToday } from '../../utils/dateUtils';
import { simulateSWP, SWPStrategy } from '../../utils/swpSimulation';

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

const DEFAULT_RISK_ORDER = [
  'LIQUID',
  'DEBT',
  'HYBRID',
  'EQUITY_L',
  'EQUITY_M',
  'EQUITY_S',
] as const;

const RISK_BUCKET_LABELS: Record<string, string> = {
  LIQUID: 'Liquid / Overnight',
  DEBT: 'Debt / Income',
  HYBRID: 'Hybrid / Balanced',
  EQUITY_L: 'Equity - Large',
  EQUITY_M: 'Equity - Mid',
  EQUITY_S: 'Equity - Small',
};

const deriveRiskBucket = (category: string | undefined): string => {
  if (!category) return 'EQUITY_M';
  const normalized = category.toLowerCase();
  if (normalized.includes('liquid') || normalized.includes('overnight')) return 'LIQUID';
  if (normalized.includes('debt') || normalized.includes('income') || normalized.includes('bond')) return 'DEBT';
  if (normalized.includes('hybrid') || normalized.includes('balanced') || normalized.includes('allocation')) return 'HYBRID';
  if (normalized.includes('mid')) return 'EQUITY_M';
  if (normalized.includes('small')) return 'EQUITY_S';
  if (normalized.includes('large')) return 'EQUITY_L';
  return 'EQUITY_M';
};

export function SWPCalculator({ funds }: SWPCalculatorProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10000);
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly' | 'Custom'>('Monthly');
  const [customFrequencyDays, setCustomFrequencyDays] = useState<number>(30);
  const [strategy, setStrategy] = useState<SWPStrategy>('PROPORTIONAL');
  const [fundRisk, setFundRisk] = useState<Record<string, string>>({});
  const [initialHoldings, setInitialHoldings] = useState<Record<string, number>>({});
  const [initialInvestmentValues, setInitialInvestmentValues] = useState<Record<string, number>>({});
  const [inputMethod, setInputMethod] = useState<'value' | 'units'>('value');
  const [initialPortfolioValue, setInitialPortfolioValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SWPCalculationResult | null>(null);

  // Initialize initial holdings when funds change
  useEffect(() => {
    setInitialHoldings(prev => {
      const updated: Record<string, number> = {};
      funds.forEach(fund => {
        updated[fund.id] = prev[fund.id] ?? 0;
      });
      return updated;
    });

    setInitialInvestmentValues(prev => {
      const updated: Record<string, number> = {};
      funds.forEach(fund => {
        updated[fund.id] = prev[fund.id] ?? 0;
      });
      return updated;
    });

    setFundRisk(prev => {
      const updated: Record<string, string> = {};
      funds.forEach(fund => {
        updated[fund.id] = prev[fund.id] ?? deriveRiskBucket(fund.category);
      });
      return updated;
    });
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
    const roundTo2 = (value: number) =>
      Math.round((value + Number.EPSILON) * 100) / 100;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
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

      if (strategy === 'RISK_BUCKET') {
        const missingRisk = funds.filter(fund => !fundRisk[fund.id]);
        if (missingRisk.length > 0) {
          throw new Error('Please assign a risk bucket to every fund for Risk Bucket strategy');
        }
      }

      if (inputMethod === 'value') {
        if (initialPortfolioValue <= 0) {
          throw new Error('Please enter your current portfolio value');
        }
      } else {
        const totalInitialUnits = Object.values(initialHoldings).reduce(
          (sum, units) => sum + (units || 0),
          0
        );
        if (totalInitialUnits === 0) {
          throw new Error('Please enter initial holdings (number of units) for at least one fund');
        }
      }

      const schemeCodes = funds.map(f => f.id);
      const navResponses = await fetchNAVData(schemeCodes, startDate, endDate);

      if (navResponses.length === 0) {
        throw new Error('No NAV data available for the selected funds in the date range');
      }

      const navMap: Record<string, { date: string; nav: number }[]> = {};
      navResponses.forEach(nav => {
        navMap[nav.schemeCode] = nav.navData.map(entry => ({
          date: entry.date,
          nav: Number(entry.nav),
        }));
      });

      const plannedWithdrawalDates = generateWithdrawalDates(startDate, endDate);
      if (plannedWithdrawalDates.length === 0) {
        throw new Error('No withdrawal dates generated for the given range');
      }

      const targetWeightSum = funds.reduce((sum, fund) => sum + fund.weightage, 0);
      if (targetWeightSum <= 0) {
        throw new Error('Invalid fund weightages selected');
      }

      const targetWeights: Record<string, number> = {};
      funds.forEach(fund => {
        targetWeights[fund.id] = (fund.weightage || 0) / targetWeightSum;
      });

      const initialUnits: Record<string, number> = {};
      const initialInvestments: Record<string, number> = {};

      const findNavAroundDate = (series: { date: string; nav: number }[], dateISO: string) => {
        const before = getLatestNAVBeforeDate(series, dateISO);
        if (before) return before;
        const sorted = [...series].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return sorted.find(point => new Date(point.date) >= new Date(dateISO)) || null;
      };

      funds.forEach(fund => {
        const navSeries = navMap[fund.id];
        if (!navSeries || navSeries.length === 0) {
          throw new Error(`No NAV data found for fund: ${fund.name}`);
        }

        const navAtStart = findNavAroundDate(navSeries, startDate);
        if (!navAtStart) {
          throw new Error(`No NAV data available near ${startDate} for ${fund.name}`);
        }

        if (inputMethod === 'value') {
          const fundValue = initialPortfolioValue * (fund.weightage / 100);
          const units = navAtStart.nav > 0 ? fundValue / navAtStart.nav : 0;
          initialUnits[fund.id] = units;

          const manualInvestment = initialInvestmentValues[fund.id] || 0;
          initialInvestments[fund.id] = manualInvestment > 0 ? manualInvestment : fundValue;
        } else {
          const units = initialHoldings[fund.id] || 0;
          initialUnits[fund.id] = units;

          const manualInvestment = initialInvestmentValues[fund.id] || 0;
          initialInvestments[fund.id] =
            manualInvestment > 0 ? manualInvestment : units * navAtStart.nav;
        }
      });

      let estimatedInitialInvestment = Object.values(initialInvestmentValues).reduce(
        (sum, val) => sum + (val || 0),
        0
      );
      if (estimatedInitialInvestment === 0) {
        estimatedInitialInvestment = Object.values(initialInvestments).reduce(
          (sum, val) => sum + (val || 0),
          0
        );
      }

      const simulation = simulateSWP({
        startDate,
        withdrawalAmount,
        withdrawalDates: plannedWithdrawalDates,
        strategy,
        targetWeights,
        initialUnits,
        navSeriesByFund: navMap,
        riskOrder: strategy === 'RISK_BUCKET' ? [...DEFAULT_RISK_ORDER] : undefined,
        fundRisk: strategy === 'RISK_BUCKET' ? fundRisk : undefined,
      });

      const withdrawalDatesProcessed = simulation.timeline
        .filter(entry => entry.action?.type === 'WITHDRAWAL')
        .map(entry => {
          const perFund = entry.action?.perFund ?? [];
          const actualDate =
            perFund.length > 0
              ? perFund.reduce(
                  (max, sale) => (sale.navDate > max ? sale.navDate : max),
                  perFund[0].navDate
                )
              : entry.date;

          return {
            date: entry.date,
            actualDate,
            amount: entry.action?.amount || 0,
          };
        });

      const chartDataPoints: Array<{
        date: string;
        invested: number;
        value: number;
        withdrawn: number;
        [key: string]: any;
      }> = [];

      let cumulativeWithdrawn = 0;
      simulation.timeline.forEach(entry => {
        if (entry.action?.type === 'WITHDRAWAL') {
          cumulativeWithdrawn = roundTo2(
            cumulativeWithdrawn + (entry.action.amount || 0)
          );
        }

        const point: {
          date: string;
          invested: number;
          value: number;
          withdrawn: number;
          [key: string]: any;
        } = {
          date: entry.date,
          invested: estimatedInitialInvestment,
          withdrawn: cumulativeWithdrawn,
          value: 0,
        };

        funds.forEach(fund => {
          const navSeries = navMap[fund.id];
          const navPoint = navSeries
            ? getLatestNAVBeforeDate(navSeries, entry.date) ||
              navSeries[navSeries.length - 1]
            : null;
          const navValue = navPoint?.nav ?? 0;
          const unitsAtDate = entry.totalUnits[fund.id] || 0;
          const fundValue = unitsAtDate * navValue;
          point[fund.name] = fundValue;
          point.value += fundValue;
        });

        chartDataPoints.push(point);
      });

      chartDataPoints.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const years = getYearsBetween(startDate, endDate);

      const fundResults = funds.map(fund => {
        const simFund = simulation.fundResults.find(f => f.fundId === fund.id);
        const remainingUnits = simFund?.remainingUnits ?? 0;
        const totalWithdrawnFund = simFund?.totalWithdrawn ?? 0;
        const navSeries = navMap[fund.id];
        const finalNavEntry =
          navSeries && navSeries.length > 0
            ? getLatestNAVBeforeDate(navSeries, endDate) ||
              navSeries[navSeries.length - 1]
            : null;
        const finalNav = finalNavEntry?.nav ?? 0;
        const currentValue = remainingUnits * finalNav;

        const initialInvested = initialInvestments[fund.id] || 0;

        const fundCashflows = [
          { date: new Date(startDate), amount: -initialInvested },
          ...(simulation.cashflows.perFund[fund.id] || []).map(cf => ({
            date: new Date(cf.date),
            amount: cf.amount,
          })),
        ];

        if (currentValue > 0) {
          fundCashflows.push({ date: new Date(endDate), amount: currentValue });
        }

        const fundXIRR = fundCashflows.length > 1 ? calculateXIRR(fundCashflows) : 0;
        const fundCAGR =
          years > 0 && initialInvested > 0
            ? calculateCAGR(initialInvested, currentValue + totalWithdrawnFund, years)
            : 0;
        const profit = currentValue + totalWithdrawnFund - initialInvested;
        const profitPercentage =
          initialInvested > 0 ? (profit / initialInvested) * 100 : 0;

        return {
          fundId: fund.id,
          fundName: fund.name,
          weightage: fund.weightage,
          initialInvested,
          initialUnits: initialUnits[fund.id] || 0,
          totalWithdrawn: totalWithdrawnFund,
          remainingUnits: parseFloat(remainingUnits.toFixed(4)),
          currentValue,
          profit,
          profitPercentage,
          cagr: fundCAGR,
          xirr: fundXIRR,
        };
      });

      const finalBucketValue = fundResults.reduce(
        (sum, fund) => sum + fund.currentValue,
        0
      );

      const totalWithdrawn = simulation.totals.withdrawn;
      const totalProfit =
        finalBucketValue + totalWithdrawn - estimatedInitialInvestment;
      const profitPercentage =
        estimatedInitialInvestment > 0
          ? (totalProfit / estimatedInitialInvestment) * 100
          : 0;

      const overallCashflows = [
        { date: new Date(startDate), amount: -estimatedInitialInvestment },
        ...simulation.cashflows.overall.map(cf => ({
          date: new Date(cf.date),
          amount: cf.amount,
        })),
      ];

      if (finalBucketValue > 0) {
        overallCashflows.push({ date: new Date(endDate), amount: finalBucketValue });
      }

      const overallXIRR =
        overallCashflows.length > 1 ? calculateXIRR(overallCashflows) : 0;
      const overallCAGR =
        years > 0 && estimatedInitialInvestment > 0
          ? calculateCAGR(estimatedInitialInvestment, finalBucketValue + totalWithdrawn, years)
          : 0;

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
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">SWP Calculator</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
            <Label htmlFor="strategy">Withdrawal Strategy</Label>
            <Select value={strategy} onValueChange={(value) => setStrategy(value as SWPStrategy)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPORTIONAL">Proportional (Sell by target weights)</SelectItem>
                <SelectItem value="OVERWEIGHT_FIRST">Overweight First (Trim profits first)</SelectItem>
                <SelectItem value="RISK_BUCKET">Risk Bucket (Low risk to high risk)</SelectItem>
              </SelectContent>
            </Select>
          </div>
                </div>

        {/* Initial Holdings Section */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold block">Current Portfolio</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={inputMethod === 'value' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('value')}
                className="text-xs"
              >
                By Value (₹)
              </Button>
              <Button
                type="button"
                variant={inputMethod === 'units' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('units')}
                className="text-xs"
              >
                By Units
              </Button>
            </div>
          </div>

          {inputMethod === 'value' ? (
            <>
              <p className="text-sm text-slate-600 mb-4">
                Enter your total current portfolio value. Units will be calculated automatically based on the NAV at start date and your fund weightage.
              </p>
              <div>
                <Label htmlFor="initial-portfolio-value">Total Current Portfolio Value (₹)</Label>
                <Input
                  id="initial-portfolio-value"
                  type="number"
                  value={initialPortfolioValue || ''}
                  onChange={(e) => setInitialPortfolioValue(Number(e.target.value) || 0)}
                  placeholder="1000000"
                  min="0"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 This will be distributed across funds according to their weightage in your bucket
                </p>
              </div>

              {/* Optional: Initial Investment Values for XIRR */}
              <div className="mt-6 p-3 bg-blue-50 rounded border border-blue-200">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-blue-900 flex items-center gap-2">
                    <span>⚙️ Advanced: Initial Investment Amounts (Optional)</span>
                    <span className="text-xs text-blue-700 font-normal">for accurate XIRR calculation</span>
                  </summary>
                  <p className="text-xs text-slate-600 mt-2 mb-3">
                    If you know the original investment amount for each fund (from when you first invested), enter it here for more accurate XIRR. Otherwise, we'll use the calculated value from current portfolio and start date NAV.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {funds.map(fund => (
                      <div key={fund.id}>
                        <Label htmlFor={`initial-investment-${fund.id}`} className="text-xs">
                          {fund.name} - Original Investment (₹)
                        </Label>
                        <Input
                          id={`initial-investment-${fund.id}`}
                          type="number"
                          value={initialInvestmentValues[fund.id] || ''}
                          onChange={(e) => setInitialInvestmentValues({
                            ...initialInvestmentValues,
                            [fund.id]: Number(e.target.value) || 0,
                          })}
                          placeholder="Auto-calculated"
                          min="0"
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </>
          ) : (
            <>
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

              {/* Optional: Initial Investment Values for XIRR */}
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-blue-900 flex items-center gap-2">
                    <span>⚙️ Advanced: Initial Investment Amounts (Optional)</span>
                    <span className="text-xs text-blue-700 font-normal">for accurate XIRR calculation</span>
                  </summary>
                  <p className="text-xs text-slate-600 mt-2 mb-3">
                    If you know the original investment amount for each fund, enter it here for more accurate XIRR. Otherwise, we'll estimate from initial NAV.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {funds.map(fund => (
                      <div key={fund.id}>
                        <Label htmlFor={`initial-investment-${fund.id}`} className="text-xs">
                          {fund.name} - Original Investment (₹)
                        </Label>
                        <Input
                          id={`initial-investment-${fund.id}`}
                          type="number"
                          value={initialInvestmentValues[fund.id] || ''}
                          onChange={(e) => setInitialInvestmentValues({
                            ...initialInvestmentValues,
                            [fund.id]: Number(e.target.value) || 0,
                          })}
                          placeholder="Auto-calculated"
                          min="0"
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </>
          )}
        </div>

        {strategy === 'RISK_BUCKET' && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <Label className="text-base font-semibold block mb-2">Risk Bucket Configuration</Label>
            <p className="text-xs sm:text-sm text-amber-900 mb-4">
              Withdrawals will prioritise lower-risk buckets first in this order:&nbsp;
              <span className="font-semibold">
                {DEFAULT_RISK_ORDER.map(bucket => RISK_BUCKET_LABELS[bucket]).join(' → ')}
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {funds.map(fund => (
                <div key={fund.id}>
                  <Label htmlFor={`risk-bucket-${fund.id}`} className="text-xs font-medium text-amber-900">
                    {fund.name} — Risk Bucket
                  </Label>
                  <Select
                    value={fundRisk[fund.id]}
                    onValueChange={(value) =>
                      setFundRisk(prev => ({ ...prev, [fund.id]: value }))
                    }
                  >
                    <SelectTrigger id={`risk-bucket-${fund.id}`}>
                      <SelectValue placeholder="Select risk bucket" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_RISK_ORDER.map(bucket => (
                        <SelectItem key={bucket} value={bucket}>
                          {RISK_BUCKET_LABELS[bucket]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
            <Card className="p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Total Invested</div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900">{formatCurrency(result.totalInvested)}</div>
            </Card>

            <Card className="p-3 sm:p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Total Withdrawn</div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900">{formatCurrency(result.totalWithdrawn)}</div>
            </Card>

            <Card className="p-3 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Current Value</div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900">{formatCurrency(result.currentValue)}</div>
            </Card>

            <Card className={`p-3 sm:p-5 border-2 shadow-lg hover:shadow-xl transition-shadow ${
              result.profit >= 0
                ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200'
                : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'
            }`}>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                result.profit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>Profit/Loss</div>
              <div className={`text-lg sm:text-2xl font-bold flex items-center gap-2 ${
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
          <Card className="p-4 sm:p-6 border-2 border-slate-200 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Performance Over Time</h3>
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 text-xs sm:text-sm w-fit">
                {result.chartData.length} data points
              </Badge>
            </div>
            <div className="w-full h-[300px] sm:h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </Card>

          {/* Fund Details Table */}
          <Card className="p-4 sm:p-6 border-2 border-slate-200 shadow-xl">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Individual Fund Performance</h3>
              <p className="text-xs sm:text-sm text-slate-600">Detailed breakdown of each fund's performance during SWP</p>
        </div>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Fund Name</TableHead>
                  <TableHead className="text-xs sm:text-sm">Initial Invested</TableHead>
                  <TableHead className="text-xs sm:text-sm">Initial Units</TableHead>
                  <TableHead className="text-xs sm:text-sm">Total Withdrawn</TableHead>
                  <TableHead className="text-xs sm:text-sm">Remaining Units</TableHead>
                  <TableHead className="text-xs sm:text-sm">Current Value</TableHead>
                  <TableHead className="text-xs sm:text-sm">Profit/Loss</TableHead>
                  <TableHead className="text-xs sm:text-sm">% Return</TableHead>
                  <TableHead className="text-xs sm:text-sm">CAGR</TableHead>
                  <TableHead className="text-xs sm:text-sm">XIRR</TableHead>
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
            </div>
    </Card>
        </>
      )}
    </div>
  );
}
