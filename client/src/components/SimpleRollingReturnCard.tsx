import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { calculateBucketPerformance } from '../utils/bucketPerformanceCalculator';
import type { SelectedFund } from '../App';

interface SimpleRollingReturnCardProps {
  funds: SelectedFund[];
}

export function SimpleRollingReturnCard({ funds }: SimpleRollingReturnCardProps) {
  const [meanReturn, setMeanReturn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funds.length === 0) {
      setMeanReturn(null);
      return;
    }

    const loadPerformance = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await calculateBucketPerformance(funds);
        setMeanReturn(result.rollingReturns.bucket.mean);
      } catch (err: any) {
        console.error('Error calculating rolling return:', err);
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

  return (
    <Card className="p-3 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Rolling Return (3Y)
      </div>
      {isLoading && (
        <div className="flex items-center gap-2 mt-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          <span className="text-xs text-gray-600">Calculating...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>Unable to load</span>
        </div>
      )}
      {meanReturn !== null && !isLoading && !error && (
        <>
          <div className={`text-lg sm:text-2xl font-bold ${meanReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatNumber(meanReturn)}%
          </div>
          <div className="text-xs text-purple-600 mt-2">Mean return (3-year window)</div>
        </>
      )}
    </Card>
  );
}

