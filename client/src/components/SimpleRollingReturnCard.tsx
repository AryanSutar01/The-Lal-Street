import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { calculateBucketPerformance } from '../utils/bucketPerformanceCalculator';
import type { SelectedFund } from '../App';

interface SimpleRollingReturnCardProps {
  funds: SelectedFund[];
}

interface RollingReturnState {
  meanReturn: number | null;
  windowType: '3Y' | '1Y' | 'insufficient';
  message: string | null;
}

export function SimpleRollingReturnCard({ funds }: SimpleRollingReturnCardProps) {
  const [state, setState] = useState<RollingReturnState>({
    meanReturn: null,
    windowType: '3Y',
    message: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funds.length === 0) {
      setState({ meanReturn: null, windowType: '3Y', message: null });
      return;
    }

    const loadPerformance = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await calculateBucketPerformance(funds);
        
        if (result.windowType === 'insufficient' || result.totalPeriods === 0) {
          setState({
            meanReturn: null,
            windowType: 'insufficient',
            message: result.message || 'Not enough historical NAV data available. Need at least 1 year of data for rolling returns calculation.',
          });
        } else {
          setState({
            meanReturn: result.rollingReturns.bucket.mean,
            windowType: result.windowType,
            message: result.message || null,
          });
        }
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

  const getWindowLabel = () => {
    if (state.windowType === '1Y') return 'Rolling Return (1Y)';
    if (state.windowType === 'insufficient') return 'Rolling Return';
    return 'Rolling Return (3Y)';
  };

  const getWindowDescription = () => {
    if (state.windowType === '1Y') return 'Mean return (1-year window)';
    if (state.windowType === 'insufficient') return '';
    return 'Mean return (3-year window)';
  };

  return (
    <Card className="p-3 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        {getWindowLabel()}
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
      {state.windowType === 'insufficient' && !isLoading && !error && (
        <div className="mt-2">
          <div className="flex items-center gap-2 text-xs text-amber-700 mb-1">
            <AlertCircle className="h-3 w-3" />
            <span className="font-semibold">Insufficient Data</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {state.message || 'Not enough historical NAV data available. Need at least 1 year of data for rolling returns calculation.'}
          </p>
        </div>
      )}
      {state.meanReturn !== null && !isLoading && !error && (
        <>
          <div className={`text-lg sm:text-2xl font-bold ${state.meanReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatNumber(state.meanReturn)}%
          </div>
          <div className="text-xs text-purple-600 mt-2">{getWindowDescription()}</div>
          {state.message && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
              {state.message}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

