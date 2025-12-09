import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { calculateBucketPerformance } from '../utils/bucketPerformanceCalculator';
import type { SelectedFund } from '../App';
import type { BucketPerformanceMetrics } from '../utils/bucketPerformanceCalculator';

interface BucketPerformanceCardsProps {
  funds: SelectedFund[];
}

export function BucketPerformanceCards({ funds }: BucketPerformanceCardsProps) {
  const [performance, setPerformance] = useState<BucketPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funds.length === 0) {
      setPerformance(null);
      return;
    }

    const loadPerformance = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await calculateBucketPerformance(funds);
        setPerformance(result);
      } catch (err: any) {
        console.error('Error calculating bucket performance:', err);
        setError(err.message || 'Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformance();
  }, [funds]);

  if (funds.length === 0) {
    return null;
  }

  const formatNumber = (num: number | null, decimals: number = 2): string => {
    if (num === null || isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
  };

  const getPositivePeriodsColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-700 bg-green-50 border-green-200';
    if (percentage >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getVolatilityColor = (volatility: number) => {
    if (volatility < 15) return 'text-green-700 bg-green-50 border-green-200';
    if (volatility < 25) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <Card className="p-3 sm:p-4 border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Portfolio Performance (3Y Rolling Returns)</h3>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-xs text-gray-600">Calculating performance...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 py-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>Unable to load performance data</span>
        </div>
      )}

      {performance && !isLoading && !error && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Mean Return */}
          <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Mean Return</p>
            <p className={`text-sm sm:text-base font-bold ${performance.rollingReturns.bucket.mean >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatNumber(performance.rollingReturns.bucket.mean)}%
            </p>
          </div>

          {/* Positive Periods */}
          <div className={`p-2 sm:p-3 rounded-lg border ${getPositivePeriodsColor(performance.rollingReturns.bucket.positivePercentage)}`}>
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Positive Periods</p>
            <p className="text-sm sm:text-base font-bold">
              {formatNumber(performance.rollingReturns.bucket.positivePercentage)}%
            </p>
          </div>

          {/* Volatility */}
          <div className={`p-2 sm:p-3 rounded-lg border ${getVolatilityColor(performance.rollingReturns.bucket.stdDev)}`}>
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Volatility</p>
            <p className="text-sm sm:text-base font-bold">
              {formatNumber(performance.rollingReturns.bucket.stdDev)}%
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}


