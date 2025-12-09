import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { calculateBucketPerformance } from '../utils/bucketPerformanceCalculator';
import { fetchNAVData } from '../services/navService';
import { getLatestNAVBeforeDate, getToday } from '../utils/dateUtils';
import { computeFundCAGR } from '../utils/portfolioStats';
import type { SelectedFund } from '../App';
import type { BucketPerformanceMetrics } from '../utils/bucketPerformanceCalculator';

interface CalculatorPerformanceTabProps {
  funds: SelectedFund[];
}

interface FundLiveData {
  fundId: string;
  fundName: string;
  currentNAV: number | null;
  cagr3Y: number | null;
  cagr5Y: number | null;
}

export function CalculatorPerformanceTab({ funds }: CalculatorPerformanceTabProps) {
  const [performance, setPerformance] = useState<BucketPerformanceMetrics | null>(null);
  const [fundLiveData, setFundLiveData] = useState<FundLiveData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funds.length === 0) {
      setPerformance(null);
      setFundLiveData([]);
      return;
    }

    const loadPerformance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate rolling returns performance
        const perf = await calculateBucketPerformance(funds);
        setPerformance(perf);

        // Fetch current NAVs and calculate 3Y and 5Y CAGR
        const today = getToday();
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
        const threeYearsAgoStr = threeYearsAgo.toISOString().split('T')[0];

        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0];

        const schemeCodes = funds.map(f => f.id);
        const navResponses = await fetchNAVData(schemeCodes, fiveYearsAgoStr, today);

        const liveData: FundLiveData[] = [];

        for (const fund of funds) {
          const navResponse = navResponses.find(nav => nav.schemeCode === fund.id);
          if (!navResponse || navResponse.navData.length === 0) {
            liveData.push({
              fundId: fund.id,
              fundName: fund.name,
              currentNAV: null,
              cagr3Y: null,
              cagr5Y: null,
            });
            continue;
          }

          // Get current NAV
          const currentNavEntry = getLatestNAVBeforeDate(navResponse.navData, today);
          const currentNAV = currentNavEntry?.nav || null;

          // Calculate 3-year CAGR
          const nav3YEntry = navResponse.navData.find(nav => {
            const navDate = new Date(nav.date);
            const targetDate = new Date(threeYearsAgoStr);
            return navDate >= targetDate;
          });
          const cagr3Y = nav3YEntry && currentNavEntry
            ? computeFundCAGR([{ date: nav3YEntry.date, nav: nav3YEntry.nav }, { date: currentNavEntry.date, nav: currentNavEntry.nav }])
            : null;

          // Calculate 5-year CAGR
          const nav5YEntry = navResponse.navData.find(nav => {
            const navDate = new Date(nav.date);
            const targetDate = new Date(fiveYearsAgoStr);
            return navDate >= targetDate;
          });
          const cagr5Y = nav5YEntry && currentNavEntry
            ? computeFundCAGR([{ date: nav5YEntry.date, nav: nav5YEntry.nav }, { date: currentNavEntry.date, nav: currentNavEntry.nav }])
            : null;

          liveData.push({
            fundId: fund.id,
            fundName: fund.name,
            currentNAV,
            cagr3Y,
            cagr5Y,
          });
        }

        setFundLiveData(liveData);
      } catch (err: any) {
        console.error('Error loading performance:', err);
        setError(err.message || 'Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformance();
  }, [funds]);

  const formatNumber = (num: number | null, decimals: number = 2): string => {
    if (num === null || isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
  };

  const formatCurrency = (num: number | null): string => {
    if (num === null || isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (funds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 mt-6">
      <Card className="p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Portfolio Performance (3-Year Rolling Window)</h3>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Calculating performance...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {performance && !isLoading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Positive Periods</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-purple-700">
                {formatNumber(performance.rollingReturns.bucket.positivePercentage)}%
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs text-gray-600 mb-1">Maximum Return</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-700">
                {formatNumber(performance.rollingReturns.bucket.max)}%
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-gray-600 mb-1">Minimum Return</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-red-700">
                {formatNumber(performance.rollingReturns.bucket.min)}%
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">CAGR - 5 Yr</p>
              <p className={`text-base sm:text-lg md:text-xl font-bold ${fundLiveData.length > 0 && fundLiveData[0].cagr5Y !== null && fundLiveData[0].cagr5Y >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {(() => {
                  // Calculate weighted average 5Y CAGR
                  if (fundLiveData.length === 0) return 'N/A';
                  const weights: Record<string, number> = {};
                  funds.forEach(fund => {
                    weights[fund.id] = fund.weightage / 100;
                  });
                  let numerator = 0;
                  let denominator = 0;
                  fundLiveData.forEach(fd => {
                    const weight = weights[fd.fundId] || 0;
                    if (fd.cagr5Y !== null) {
                      numerator += weight * fd.cagr5Y;
                      denominator += weight;
                    }
                  });
                  const weightedCAGR = denominator > 0 ? numerator / denominator : null;
                  return weightedCAGR !== null ? `${formatNumber(weightedCAGR)}%` : 'N/A';
                })()}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Individual Fund Performance */}
      {performance && !isLoading && !error && (
        <Card className="p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Individual Fund Performance</h3>
          <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 px-4 sm:px-5 md:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>NAV</TableHead>
                  <TableHead>CAGR - 3 Yr</TableHead>
                  <TableHead>CAGR - 5 Yr</TableHead>
                  <TableHead>Positive Periods</TableHead>
                  <TableHead>Max Return</TableHead>
                  <TableHead>Min Return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.rollingReturns.funds.map((fundData) => {
                  const fund = funds.find(f => f.id === fundData.fundId);
                  const liveData = fundLiveData.find(f => f.fundId === fundData.fundId);
                  return (
                    <TableRow key={fundData.fundId}>
                      <TableCell className="font-medium max-w-[120px] sm:max-w-xs truncate text-xs sm:text-sm">
                        {fundData.fundName}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {liveData && liveData.currentNAV !== null ? formatCurrency(liveData.currentNAV) : 'N/A'}
                      </TableCell>
                      <TableCell className={`text-xs sm:text-sm ${liveData && liveData.cagr3Y !== null && liveData.cagr3Y >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}`}>
                        {liveData && liveData.cagr3Y !== null ? `${formatNumber(liveData.cagr3Y)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className={`text-xs sm:text-sm ${liveData && liveData.cagr5Y !== null && liveData.cagr5Y >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}`}>
                        {liveData && liveData.cagr5Y !== null ? `${formatNumber(liveData.cagr5Y)}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <span className={fundData.positivePercentage >= 70 ? 'text-green-700' : fundData.positivePercentage >= 50 ? 'text-yellow-700' : 'text-red-700'}>
                          {formatNumber(fundData.positivePercentage)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-green-700 text-xs sm:text-sm">
                        {formatNumber(fundData.max)}%
                      </TableCell>
                      <TableCell className="text-red-700 text-xs sm:text-sm">
                        {formatNumber(fundData.min)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}


