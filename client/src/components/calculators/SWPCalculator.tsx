import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { SelectedFund } from '../../App';
import { fetchNAVData } from '../../services/navService';
import { calculateXIRR } from '../../utils/financialCalculations';
import { getLatestNAVBeforeDate, getToday } from '../../utils/dateUtils';
import {
  simulateSWP,
  SWPStrategy,
  TimelineEntry,
} from '../../utils/swpSimulation';

interface SWPCalculatorProps {
  funds: SelectedFund[];
}

type Frequency = 'Monthly' | 'Quarterly' | 'Custom';

interface ChartPoint {
  date: string;
  invested: number;
  withdrawn: number;
  portfolioValue: number;
  [key: string]: string | number;
}

interface FundSummary {
  fundId: string;
  fundName: string;
  weightage: number;
  navAtPurchase: number;
  unitsPurchased: number;
  remainingUnits: number;
  totalWithdrawn: number;
  currentValue: number;
}

interface TableRowData {
  date: string;
  fundId: string;
  fundName: string;
  navDate: string;
  nav: number;
  withdrawalAmount: number;
  unitsRedeemed: number;
  unitsLeft: number;
  fundValue: number;
  portfolioValue: number;
  totalWithdrawal: number;
}

interface SWPCalculationResult {
  totalInvested: number;
  totalWithdrawn: number;
  finalCorpus: number;
  xirr: number | null;
  maxDrawdown: number;
  survivalMonths: number;
  depletedOn?: string | null;
  timeline: TimelineEntry[];
  chartData: ChartPoint[];
  fundSummaries: FundSummary[];
  tableRows: TableRowData[];
}

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

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatNumber = (value: number, digits = 2): string =>
  value.toLocaleString('en-IN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

const deriveRiskBucket = (category: string | undefined): string => {
  if (!category) return 'EQUITY_M';
  const normalized = category.toLowerCase();
  if (normalized.includes('liquid') || normalized.includes('overnight')) return 'LIQUID';
  if (
    normalized.includes('debt') ||
    normalized.includes('income') ||
    normalized.includes('bond')
  )
    return 'DEBT';
  if (
    normalized.includes('hybrid') ||
    normalized.includes('balanced') ||
    normalized.includes('allocation')
  )
    return 'HYBRID';
  if (normalized.includes('mid')) return 'EQUITY_M';
  if (normalized.includes('small')) return 'EQUITY_S';
  if (normalized.includes('large')) return 'EQUITY_L';
  return 'EQUITY_M';
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function SWPCalculator({ funds }: SWPCalculatorProps) {
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [swpStartDate, setSwpStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10000);
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [customFrequencyDays, setCustomFrequencyDays] = useState<number>(30);
  const [strategy, setStrategy] = useState<SWPStrategy>('PROPORTIONAL');
  const [fundRisk, setFundRisk] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SWPCalculationResult | null>(null);

  useEffect(() => {
    setFundRisk((prev) => {
      const next: Record<string, string> = {};
      funds.forEach((fund) => {
        next[fund.id] = prev[fund.id] ?? deriveRiskBucket(fund.category);
      });
      return next;
    });
  }, [funds]);

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
    } else {
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
      if (!purchaseDate) {
        throw new Error('Please select the initial investment date.');
      }
      if (!swpStartDate) {
        throw new Error('Please select the SWP start date.');
      }
      if (!endDate) {
        throw new Error('Please select the SWP end date.');
      }

      if (new Date(purchaseDate) > new Date(swpStartDate)) {
        throw new Error('SWP start date must be on or after the investment date.');
      }
      if (new Date(swpStartDate) > new Date(endDate)) {
        throw new Error('End date must be after the SWP start date.');
      }

      if (totalInvestment <= 0) {
        throw new Error('Please enter the total investment amount.');
      }

      if (withdrawalAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero.');
      }

      if (funds.length === 0) {
        throw new Error('Please select at least one fund.');
      }

      if (strategy === 'RISK_BUCKET') {
        const missingRisk = funds.filter((fund) => !fundRisk[fund.id]);
        if (missingRisk.length > 0) {
          throw new Error('Assign a risk bucket to every fund to use the risk-based strategy.');
        }
      }

      const schemeCodes = funds.map((fund) => fund.id);
      const navResponses = await fetchNAVData(schemeCodes, purchaseDate, endDate);

      if (navResponses.length === 0) {
        throw new Error('No NAV data available for the selected funds.');
      }

      const navMap: Record<string, { date: string; nav: number }[]> = {};
      navResponses.forEach((response) => {
        navMap[response.schemeCode] = response.navData.map((entry) => ({
          date: entry.date,
          nav: Number(entry.nav),
        }));
      });

      const withdrawalSchedule = generateWithdrawalDates(swpStartDate, endDate);
      if (withdrawalSchedule.length === 0) {
        throw new Error('No withdrawal dates generated for the selected range.');
      }

      const totalWeight = funds.reduce((sum, fund) => sum + fund.weightage, 0);
      if (totalWeight <= 0) {
        throw new Error('Fund weightages must sum to a positive number.');
      }

      const targetWeights: Record<string, number> = {};
      funds.forEach((fund) => {
        targetWeights[fund.id] = fund.weightage / totalWeight;
      });

      const initialUnits: Record<string, number> = {};
      const navAtPurchase: Record<string, number> = {};

      const findNavForDate = (series: { date: string; nav: number }[], dateISO: string) => {
        const before = getLatestNAVBeforeDate(series, dateISO);
        if (before) return before;
        const ascending = [...series].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return ascending.find((point) => new Date(point.date) >= new Date(dateISO)) ?? null;
      };

      funds.forEach((fund) => {
        const series = navMap[fund.id];
        if (!series || series.length === 0) {
          throw new Error(`No NAV history found for ${fund.name}.`);
        }
        const navPoint = findNavForDate(series, purchaseDate);
        if (!navPoint) {
          throw new Error(`No NAV available around ${purchaseDate} for ${fund.name}.`);
        }
        navAtPurchase[fund.id] = navPoint.nav;

        const amountForFund = totalInvestment * (fund.weightage / totalWeight);
        const units = navPoint.nav > 0 ? amountForFund / navPoint.nav : 0;
        initialUnits[fund.id] = units;
      });

      const simulation = simulateSWP({
        startDate: purchaseDate,
        withdrawalAmount,
        withdrawalDates: withdrawalSchedule,
        strategy,
        targetWeights,
        initialUnits,
        navSeriesByFund: navMap,
        riskOrder: strategy === 'RISK_BUCKET' ? [...DEFAULT_RISK_ORDER] : undefined,
        fundRisk: strategy === 'RISK_BUCKET' ? fundRisk : undefined,
      });

      const withdrawalEntries = simulation.timeline.filter(
        (entry) => entry.action?.type === 'WITHDRAWAL'
      );

      const lastEntry = simulation.timeline[simulation.timeline.length - 1];

      const fundSummaries: FundSummary[] = funds.map((fund) => {
        const fundResult = simulation.fundResults.find((f) => f.fundId === fund.id);
        const remainingUnits = fundResult?.remainingUnits ?? 0;
        const finalNavPoint =
          navMap[fund.id] && navMap[fund.id].length > 0
            ? getLatestNAVBeforeDate(navMap[fund.id], endDate) ||
              navMap[fund.id][navMap[fund.id].length - 1]
            : null;
        const finalNav = finalNavPoint?.nav ?? 0;
        const currentValue = round2(remainingUnits * finalNav);

        return {
          fundId: fund.id,
          fundName: fund.name,
          weightage: fund.weightage,
          navAtPurchase: navAtPurchase[fund.id],
          unitsPurchased: initialUnits[fund.id],
          remainingUnits,
          totalWithdrawn: fundResult?.totalWithdrawn ?? 0,
          currentValue,
        };
      });

      const finalCorpus = round2(
        fundSummaries.reduce((sum, fund) => sum + fund.currentValue, 0)
      );

      const cashflows = [
        { date: new Date(purchaseDate), amount: -totalInvestment },
        ...simulation.cashflows.overall.map((cf) => ({
          date: new Date(cf.date),
          amount: cf.amount,
        })),
      ];

      const finalCashflowDate = simulation.totals.depletedOn ?? endDate;
      if (finalCorpus > 0 || simulation.totals.depletedOn) {
        cashflows.push({ date: new Date(finalCashflowDate), amount: finalCorpus });
      }

      const hasPositive = cashflows.some((cf) => cf.amount > 0);
      const hasNegative = cashflows.some((cf) => cf.amount < 0);
      const xirr =
        hasPositive && hasNegative && cashflows.length >= 2
          ? calculateXIRR(cashflows)
          : null;

      let cumulativeWithdrawn = 0;
      const chartData: ChartPoint[] = simulation.timeline.map((entry) => {
        if (entry.action?.type === 'WITHDRAWAL') {
          cumulativeWithdrawn = round2(
            cumulativeWithdrawn + (entry.action.amount ?? 0)
          );
        }

        const point: ChartPoint = {
          date: entry.date,
          invested: totalInvestment,
          withdrawn: cumulativeWithdrawn,
          portfolioValue: entry.portfolioValue,
        };

        funds.forEach((fund) => {
          const series = navMap[fund.id];
          const navPoint =
            series && series.length > 0
              ? getLatestNAVBeforeDate(series, entry.date) || series[series.length - 1]
              : null;
          const navValue = navPoint?.nav ?? 0;
          const units = entry.totalUnits[fund.id] ?? 0;
          point[fund.name] = round2(units * navValue);
        });

        return point;
      });

      const tableRows: TableRowData[] = [];
      withdrawalEntries.forEach((entry) => {
        funds.forEach((fund) => {
          const series = navMap[fund.id];
          const sale = entry.action?.perFund?.find((s) => s.fundId === fund.id);
          const navPoint = sale
            ? { date: sale.navDate, nav: sale.nav }
            : series && series.length > 0
            ? getLatestNAVBeforeDate(series, entry.date) || series[series.length - 1]
            : null;

          const navValue = navPoint?.nav ?? 0;
          const navDate = navPoint?.date ?? entry.date;
          const unitsLeft = entry.totalUnits[fund.id] ?? 0;
          const fundValue = round2(unitsLeft * navValue);

          tableRows.push({
            date: entry.date,
            fundId: fund.id,
            fundName: fund.name,
            navDate,
            nav: navValue,
            withdrawalAmount: sale?.amount ?? 0,
            unitsRedeemed: sale?.unitsSold ?? 0,
            unitsLeft,
            fundValue,
            portfolioValue: entry.portfolioValue,
            totalWithdrawal: entry.action?.amount ?? 0,
          });
        });
      });

      setResult({
        totalInvested: totalInvestment,
        totalWithdrawn: round2(simulation.totals.withdrawn),
        finalCorpus,
        xirr: xirr ?? null,
        maxDrawdown: simulation.totals.maxDrawdown,
        survivalMonths: simulation.totals.depletedOn
          ? withdrawalEntries.length
          : withdrawalSchedule.length,
        depletedOn: simulation.totals.depletedOn,
        timeline: simulation.timeline,
        chartData,
        fundSummaries,
        tableRows,
      });

      setShowTable(false);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while running the SWP simulation.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">SWP Calculator</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="total-investment">Total Investment (₹)</Label>
            <Input
              id="total-investment"
              type="number"
              min={1}
              value={totalInvestment || ''}
              onChange={(event) => setTotalInvestment(Number(event.target.value) || 0)}
              placeholder="500000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="purchase-date">Investment Date</Label>
            <Input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              max={getToday()}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="swp-start-date">SWP Start Date</Label>
            <Input
              id="swp-start-date"
              type="date"
              value={swpStartDate}
              onChange={(event) => setSwpStartDate(event.target.value)}
              max={getToday()}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              max={getToday()}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="withdrawal-amount">Withdrawal Amount (₹)</Label>
            <Input
              id="withdrawal-amount"
              type="number"
              min={1}
              value={withdrawalAmount}
              onChange={(event) => setWithdrawalAmount(Number(event.target.value) || 0)}
              placeholder="15000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Withdrawal Frequency</Label>
            <Select value={frequency} onValueChange={(value: Frequency) => setFrequency(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Custom">Custom (Days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {frequency === 'Custom' && (
            <div>
              <Label htmlFor="custom-frequency">Custom Interval (Days)</Label>
              <Input
                id="custom-frequency"
                type="number"
                min={1}
                value={customFrequencyDays}
                onChange={(event) =>
                  setCustomFrequencyDays(Number(event.target.value) || 1)
                }
                placeholder="30"
                className="mt-1"
              />
            </div>
          )}
        </div>

        <div className="mt-6 border rounded-lg border-slate-200 bg-slate-50">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            <span>Advanced Options</span>
            <span>{showAdvanced ? '−' : '+'}</span>
          </button>
          {showAdvanced && (
            <div className="px-4 pb-4 pt-2 space-y-4">
              <div>
                <Label htmlFor="strategy">Withdrawal Strategy</Label>
                <Select
                  value={strategy}
                  onValueChange={(value) => setStrategy(value as SWPStrategy)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROPORTIONAL">
                      Proportional by target weights (default)
                    </SelectItem>
                    <SelectItem value="OVERWEIGHT_FIRST">
                      Overweight first (harvest gains)
                    </SelectItem>
                    <SelectItem value="RISK_BUCKET">
                      Risk bucket (sell lowest risk first)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {strategy === 'RISK_BUCKET' && (
                <div className="space-y-3">
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    Withdrawals will use the following bucket order:{' '}
                    <strong>
                      {DEFAULT_RISK_ORDER.map((bucket) => RISK_BUCKET_LABELS[bucket]).join(
                        ' → '
                      )}
                    </strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {funds.map((fund) => (
                      <div key={fund.id}>
                        <Label className="text-xs text-slate-600">
                          {fund.name} — Risk bucket
                        </Label>
                        <Select
                          value={fundRisk[fund.id]}
                          onValueChange={(value) =>
                            setFundRisk((prev) => ({ ...prev, [fund.id]: value }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_RISK_ORDER.map((bucket) => (
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
            </div>
          )}
        </div>

        <Button
          onClick={calculateSWP}
          disabled={
            isLoading ||
            !purchaseDate ||
            !swpStartDate ||
            !endDate ||
            totalInvestment <= 0 ||
            funds.length === 0
          }
          className="w-full mt-6"
        >
          {isLoading ? 'Simulating...' : 'Run SWP Simulation'}
        </Button>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200 text-red-800">
          {error}
        </Card>
      )}

      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4 border-slate-200">
              <div className="text-xs uppercase text-slate-500 font-semibold mb-2">
                Total Invested
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(result.totalInvested)}
              </div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="text-xs uppercase text-slate-500 font-semibold mb-2">
                Total Withdrawn
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(result.totalWithdrawn)}
              </div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="text-xs uppercase text-slate-500 font-semibold mb-2">
                Final Corpus Value
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(result.finalCorpus)}
              </div>
            </Card>
            <Card className="p-4 border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-slate-500 font-semibold mb-2">
                  XIRR (Money-weighted return)
                </div>
                <div
                  className={`text-2xl font-bold ${
                    (result.xirr ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  } flex items-center gap-2`}
                >
                  {(result.xirr ?? 0) >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {result.xirr !== null ? `${formatNumber(result.xirr, 2)}%` : '—'}
                </div>
              </div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="text-xs uppercase text-slate-500 font-semibold mb-2">
                Survival Duration
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {result.survivalMonths} months
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {result.depletedOn
                  ? `Depleted on ${result.depletedOn}`
                  : 'Portfolio still active at end date'}
              </div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="text-xs uppercase text-slate-500 font-semibold mb-2">
                Max Drawdown
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(result.maxDrawdown * 100, 2)}%
              </div>
            </Card>
          </div>

          <Card className="p-4 sm:p-6 border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Portfolio value vs withdrawals
                </h3>
                <p className="text-sm text-slate-500">
                  Tracks invested capital, cash withdrawn, and remaining corpus value across
                  the simulation.
                </p>
              </div>
              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                {result.chartData.length} data points
              </Badge>
            </div>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: string) =>
                      new Date(value).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name,
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    }
                  />
                  <RechartsLegend iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="invested"
                    name="Invested capital"
                    stroke="#94a3b8"
                    strokeDasharray="6 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="portfolioValue"
                    name="Portfolio value"
                    stroke="#1f2937"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="withdrawn"
                    name="Cumulative withdrawals"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                  {funds.map((fund, index) => {
                    const colors = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444'];
                    return (
                      <Line
                        key={fund.id}
                        type="monotone"
                        dataKey={fund.name}
                        name={`${fund.name} value`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Fund breakdown
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Purchase NAV</TableHead>
                  <TableHead>Units bought</TableHead>
                  <TableHead>Units remaining</TableHead>
                  <TableHead>Total withdrawn</TableHead>
                  <TableHead>Current value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.fundSummaries.map((fund) => (
                  <TableRow key={fund.fundId}>
                    <TableCell className="font-medium">{fund.fundName}</TableCell>
                    <TableCell>{fund.weightage}%</TableCell>
                    <TableCell>₹{formatNumber(fund.navAtPurchase, 2)}</TableCell>
                    <TableCell>{formatNumber(fund.unitsPurchased, 4)}</TableCell>
                    <TableCell>{formatNumber(fund.remainingUnits, 4)}</TableCell>
                    <TableCell>{formatCurrency(fund.totalWithdrawn)}</TableCell>
                    <TableCell>{formatCurrency(fund.currentValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Withdrawal ledger</h3>
            <Button
              variant="outline"
              onClick={() => setShowTable((prev) => !prev)}
              className="text-sm"
            >
              {showTable ? 'Hide table' : 'Show table'}
            </Button>
          </div>

          {showTable && (
            <Card className="p-4 sm:p-6 border-slate-200 overflow-x-auto">
              {result.tableRows.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No withdrawals occurred during the selected period.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Fund</TableHead>
                      <TableHead>NAV date</TableHead>
                      <TableHead>NAV (₹)</TableHead>
                      <TableHead>Withdrawal (₹)</TableHead>
                      <TableHead>Units redeemed</TableHead>
                      <TableHead>Units left</TableHead>
                      <TableHead>Fund value (₹)</TableHead>
                      <TableHead>Portfolio value (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.tableRows.map((row, index) => (
                      <TableRow key={`${row.date}-${row.fundId}-${index}`}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.fundName}</TableCell>
                        <TableCell>{row.navDate}</TableCell>
                        <TableCell>{formatNumber(row.nav, 2)}</TableCell>
                        <TableCell>{formatCurrency(row.withdrawalAmount)}</TableCell>
                        <TableCell>{formatNumber(row.unitsRedeemed, 4)}</TableCell>
                        <TableCell>{formatNumber(row.unitsLeft, 4)}</TableCell>
                        <TableCell>{formatCurrency(row.fundValue)}</TableCell>
                        <TableCell>{formatCurrency(row.portfolioValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

