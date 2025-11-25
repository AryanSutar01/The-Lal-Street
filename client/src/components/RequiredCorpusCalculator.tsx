import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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

interface RequiredCorpusCalculatorProps {
  funds: SelectedFund[];
  initialPayout?: number;
  initialFrequency?: 'Monthly' | 'Quarterly';
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

export function RequiredCorpusCalculator({ 
  funds, 
  initialPayout, 
  initialFrequency,
  onBacktest 
}: RequiredCorpusCalculatorProps) {
  const [payout, setPayout] = useState<number>(initialPayout || 50000);
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly'>(initialFrequency || 'Monthly');
  const [duration, setDuration] = useState<number>(20); // years
  const [purchaseDate, setPurchaseDate] = useState<string>('2020-01-01');
  const [swpStartDate, setSwpStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>(getToday());
  const [riskFactor, setRiskFactor] = useState<number>(3);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [requiredCorpus, setRequiredCorpus] = useState<number | null>(null);
  const [requiredCorpusFixed, setRequiredCorpusFixed] = useState<number | null>(null);
  const [portfolioCAGR, setPortfolioCAGR] = useState<number | null>(null);
  const [portfolioVolatility, setPortfolioVolatility] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRequiredCorpus = async () => {
    setIsCalculating(true);
    setError(null);
    setRequiredCorpus(null);
    setRequiredCorpusFixed(null);

    try {
      if (payout <= 0) {
        throw new Error('Payout amount must be greater than zero');
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

      // Calculate required corpus
      const effectiveRiskFactor = Math.max(0.1, riskFactor);
      const periodsPerYear = periodsPerYearFromFrequency(frequency);
      
      const swrAnnualPercent = avgCAGR !== null ? avgCAGR / effectiveRiskFactor : null;
      const swrPeriodPercent = swrAnnualPercent !== null ? swrAnnualPercent / periodsPerYear : null;
      const swrPeriodRate = swrPeriodPercent !== null ? swrPeriodPercent / 100 : null;

      // Required corpus for indefinite withdrawal
      const requiredCorpusIndefinite = swrPeriodRate && swrPeriodRate > 0
        ? payout / swrPeriodRate
        : null;

      // Required corpus for fixed duration
      let requiredCorpusForDuration: number | null = null;
      if (duration > 0 && avgCAGR !== null && avgVolatility !== null) {
        const adjustedReturnPercent = Math.max(0, avgCAGR - avgVolatility);
        const adjustedReturnRate = adjustedReturnPercent / 100;
        const annualWithdrawal = payout * periodsPerYear;
        
        if (adjustedReturnRate > 0) {
          requiredCorpusForDuration = annualWithdrawal *
            (1 - Math.pow(1 + adjustedReturnRate, -duration)) /
            adjustedReturnRate;
        } else {
          requiredCorpusForDuration = annualWithdrawal * duration;
        }
      }

      setRequiredCorpus(requiredCorpusIndefinite);
      setRequiredCorpusFixed(requiredCorpusForDuration);
      setIsCalculating(false);
    } catch (err: any) {
      setError(err.message || 'Error calculating required corpus');
      setIsCalculating(false);
    }
  };

  const handleBacktest = () => {
    const corpusToUse = requiredCorpusFixed || requiredCorpus;
    if (corpusToUse && corpusToUse > 0) {
      onBacktest({
        totalInvestment: corpusToUse,
        withdrawalAmount: payout,
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
        <h3 className="text-lg font-semibold">Required Corpus Calculator</h3>
        <TooltipProvider>
          <UiTooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Calculates required investment corpus based on desired payout, portfolio returns, and risk factor</p>
            </TooltipContent>
          </UiTooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="payout">Expected {frequency} Payout (₹)</Label>
            <Input
              id="payout"
              type="number"
              value={payout}
              onChange={(e) => setPayout(parseFloat(e.target.value) || 0)}
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

        <div>
          <Label htmlFor="duration">Withdrawal Duration (Years)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="50"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-gray-500 mt-1">Enter 0 or leave blank for indefinite withdrawal</p>
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
                  <p>Higher risk factor = higher corpus required (more conservative). Default: 3</p>
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
            onChange={(e) => setRiskFactor(parseFloat(e.target.value) || 3)}
          />
          <p className="text-xs text-gray-500 mt-1">Higher = More Conservative (Recommended: 3-5)</p>
        </div>

        <Button onClick={calculateRequiredCorpus} disabled={isCalculating || payout <= 0} className="w-full">
          {isCalculating ? 'Calculating...' : 'Calculate Required Corpus'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {(requiredCorpus !== null || requiredCorpusFixed !== null) && (
          <div className="space-y-4">
            {requiredCorpusFixed && duration > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Required Corpus ({duration} years):</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(requiredCorpusFixed)}</p>
              </div>
            )}
            
            {requiredCorpus && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Required Corpus (Indefinite):</p>
                <p className="text-3xl font-bold text-green-700">{formatCurrency(requiredCorpus)}</p>
              </div>
            )}

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

            <Button 
              onClick={handleBacktest} 
              className="w-full" 
              size="lg"
              disabled={!requiredCorpusFixed && !requiredCorpus}
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Backtest with SWP Calculator
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

