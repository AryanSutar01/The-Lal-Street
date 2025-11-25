import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Info, TrendingUp } from 'lucide-react';
import type { SelectedFund } from '../App';
import { fetchNAVData } from '../services/navService';
import {
  computeFundAnnualizedVolatility,
  computeFundCAGR,
  computeWeightedAverage,
} from '../utils/portfolioStats';
import { getToday } from '../utils/dateUtils';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from './ui/tooltip';

interface SafeWithdrawalCalculatorProps {
  funds: SelectedFund[];
  initialCorpus?: number;
  onBacktest: (values: {
    totalInvestment: number;
    withdrawalAmount: number;
    frequency: 'Monthly' | 'Quarterly';
    purchaseDate: string;
    swpStartDate: string;
    endDate: string;
    riskFactor: number;
  }) => void;
}

const periodsPerYearFromFrequency = (frequency: 'Monthly' | 'Quarterly'): number => {
  if (frequency === 'Monthly') return 12;
  return 4;
};

export function SafeWithdrawalCalculator({ funds, initialCorpus, onBacktest }: SafeWithdrawalCalculatorProps) {
  const [corpus, setCorpus] = useState<number>(initialCorpus || 1000000);
  const [purchaseDate, setPurchaseDate] = useState<string>('2020-01-01');
  const [swpStartDate, setSwpStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>(getToday());
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly'>('Monthly');
  const [riskFactor, setRiskFactor] = useState<number>(3);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [safeWithdrawal, setSafeWithdrawal] = useState<number | null>(null);
  const [portfolioCAGR, setPortfolioCAGR] = useState<number | null>(null);
  const [portfolioVolatility, setPortfolioVolatility] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateSafeWithdrawal = async () => {
    setIsCalculating(true);
    setError(null);
    setSafeWithdrawal(null);

    try {
      if (corpus <= 0) {
        throw new Error('Corpus amount must be greater than zero');
      }

      if (!purchaseDate || !endDate) {
        throw new Error('Please select purchase date and end date for historical analysis');
      }

      const schemeCodes = funds.map(f => f.id);
      const navResponses = await fetchNAVData(schemeCodes, purchaseDate, endDate);

      if (navResponses.length === 0) {
        throw new Error('No NAV data available for the selected funds');
      }

      const navMap: Record<string, { date: string; nav: number }[]> = {};
      navResponses.forEach(response => {
        navMap[response.schemeCode] = response.navData.map(nav => ({ date: nav.date, nav: nav.nav }));
      });

      // Calculate portfolio metrics
      const targetWeights: Record<string, number> = {};
      funds.forEach(fund => {
        targetWeights[fund.id] = fund.weightage / 100;
      });

      const fundCagrs: Record<string, number | null> = {};
      const fundVols: Record<string, number | null> = {};
      funds.forEach(fund => {
        const series = navMap[fund.id];
        if (series && series.length > 0) {
          fundCagrs[fund.id] = computeFundCAGR(series);
          fundVols[fund.id] = computeFundAnnualizedVolatility(series);
        }
      });

      const avgCAGR = computeWeightedAverage(fundCagrs, targetWeights);
      const avgVolatility = computeWeightedAverage(fundVols, targetWeights);
      
      setPortfolioCAGR(avgCAGR);
      setPortfolioVolatility(avgVolatility);

      // Calculate safe withdrawal rate
      const effectiveRiskFactor = Math.max(0.1, riskFactor);
      const periodsPerYear = periodsPerYearFromFrequency(frequency);
      
      const swrAnnualPercent = avgCAGR !== null ? avgCAGR / effectiveRiskFactor : null;
      const swrPeriodPercent = swrAnnualPercent !== null ? swrAnnualPercent / periodsPerYear : null;
      const swrPeriodRate = swrPeriodPercent !== null ? swrPeriodPercent / 100 : null;

      const safeWithdrawalAmount = swrPeriodRate && swrPeriodRate > 0
        ? corpus * swrPeriodRate
        : null;

      setSafeWithdrawal(safeWithdrawalAmount);
      setIsCalculating(false);
    } catch (err: any) {
      setError(err.message || 'Error calculating safe withdrawal');
      setIsCalculating(false);
    }
  };

  const handleBacktest = () => {
    if (safeWithdrawal && safeWithdrawal > 0) {
      onBacktest({
        totalInvestment: corpus,
        withdrawalAmount: safeWithdrawal,
        frequency,
        purchaseDate,
        swpStartDate: swpStartDate || purchaseDate,
        endDate,
        riskFactor,
      });
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Safe Withdrawal Calculator</h3>
        <TooltipProvider>
          <UiTooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Calculates safe monthly/quarterly withdrawal amount based on portfolio CAGR, volatility, and risk factor</p>
            </TooltipContent>
          </UiTooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="corpus">Investment Corpus (₹)</Label>
            <Input
              id="corpus"
              type="number"
              value={corpus}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setCorpus(value >= 0 ? value : 0);
              }}
              prefix="₹"
              className="pl-8"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Withdrawal Frequency</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as 'Monthly' | 'Quarterly')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="purchase-date">Purchase Date</Label>
            <Input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="swp-start-date">SWP Start Date (Optional)</Label>
            <Input
              id="swp-start-date"
              type="date"
              value={swpStartDate}
              onChange={(e) => setSwpStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">Analysis End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={getToday()}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="risk-factor">Risk Factor</Label>
            <TooltipProvider>
              <UiTooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Higher risk factor = lower withdrawal rate (more conservative). Default: 3</p>
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
          <Input
            id="risk-factor"
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={riskFactor}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 3;
              setRiskFactor(value >= 0.1 && value <= 10 ? value : (value < 0.1 ? 0.1 : 10));
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Higher = More Conservative (Recommended: 3-5)</p>
        </div>

        <Button onClick={calculateSafeWithdrawal} disabled={isCalculating || corpus <= 0} className="w-full">
          {isCalculating ? 'Calculating...' : 'Calculate Safe Withdrawal'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {safeWithdrawal !== null && safeWithdrawal > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Safe {frequency} Withdrawal:</p>
              <p className="text-3xl font-bold text-green-700">{formatCurrency(safeWithdrawal)}</p>
            </div>

            {portfolioCAGR !== null && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Portfolio CAGR</p>
                  <p className="text-lg font-semibold text-blue-700">{portfolioCAGR.toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Volatility</p>
                  <p className="text-lg font-semibold text-purple-700">
                    {portfolioVolatility ? `${portfolioVolatility.toFixed(2)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleBacktest} className="w-full" size="lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              Backtest with SWP Calculator
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

