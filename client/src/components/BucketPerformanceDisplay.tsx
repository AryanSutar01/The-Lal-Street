import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, CheckCircle2, BarChart3, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RollingCalculator } from './calculators/RollingCalculator';
import { calculateBucketPerformance } from '../utils/bucketPerformanceCalculator';
import type { SelectedFund } from '../App';
import type { BucketPerformanceMetrics } from '../utils/bucketPerformanceCalculator';

interface BucketPerformanceDisplayProps {
  funds: SelectedFund[];
}

export function BucketPerformanceDisplay({ funds }: BucketPerformanceDisplayProps) {
  const [performance, setPerformance] = useState<BucketPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCalculatePerformance = async () => {
    setIsLoading(true);
    setError(null);
    setShowAdvanced(false);
    
    try {
      const result = await calculateBucketPerformance(funds);
      setPerformance(result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate bucket performance');
      console.error('Error calculating bucket performance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };


  if (showAdvanced) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Advanced Performance Analysis</h3>
            <p className="text-sm text-gray-600">Customize rolling returns calculation with different strategies</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(false)}
          >
            Back to Summary
          </Button>
        </div>
        <RollingCalculator funds={funds} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Button to Calculate Performance */}
      {!performance && !isLoading && (
        <Card className="p-4 sm:p-5 md:p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-blue-100 mb-3 sm:mb-4">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Check Bucket Performance</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
              Analyze your portfolio's historical performance using rolling returns. 
              This will show you how your bucket would have performed over different 3-year periods.
            </p>
            <Button
              onClick={handleCalculatePerformance}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base h-10 sm:h-11 md:h-12 px-4 sm:px-6 md:px-8"
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Calculate Performance
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 sm:p-10 md:p-12 text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Calculating Performance...</h3>
          <p className="text-sm sm:text-base text-gray-600">This may take a few moments while we analyze historical data</p>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="p-4 sm:p-5 md:p-6 border-red-200 bg-red-50">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2">Error Calculating Performance</h3>
            <p className="text-sm sm:text-base text-red-700 mb-3 sm:mb-4">{error}</p>
            <Button
              onClick={handleCalculatePerformance}
              variant="outline"
              size="sm"
              className="h-9 sm:h-10"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Performance Results */}
      {performance && !isLoading && (
        <>
          {/* Portfolio Performance Summary */}
          <Card className="p-4 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Portfolio Rolling Returns (3 Year Window)</h3>
              <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">{performance.totalPeriods} periods analyzed</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Mean Return</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-blue-700">
                  {formatNumber(performance.rollingReturns.bucket.mean)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Median Return</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-700">
                  {formatNumber(performance.rollingReturns.bucket.median)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 md:p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Positive Periods</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-purple-700">
                  {formatNumber(performance.rollingReturns.bucket.positivePercentage)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 md:p-4 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Volatility (Std Dev)</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-orange-700">
                  {formatNumber(performance.rollingReturns.bucket.stdDev)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
              <div className="p-2 sm:p-3 md:p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Maximum Return</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-700">
                  {formatNumber(performance.rollingReturns.bucket.max)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 md:p-4 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Minimum Return</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-red-700">
                  {formatNumber(performance.rollingReturns.bucket.min)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Individual Fund Performance */}
          <Card className="p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Individual Fund Performance</h3>
            <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 px-4 sm:px-5 md:px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fund Name</TableHead>
                    <TableHead>Weightage</TableHead>
                    <TableHead>Mean Return</TableHead>
                    <TableHead>Median Return</TableHead>
                    <TableHead>Positive Periods</TableHead>
                    <TableHead>Volatility</TableHead>
                    <TableHead>Max Return</TableHead>
                    <TableHead>Min Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performance.rollingReturns.funds.map((fundData) => {
                    const fund = funds.find(f => f.id === fundData.fundId);
                    return (
                      <TableRow key={fundData.fundId}>
                        <TableCell className="font-medium max-w-[120px] sm:max-w-xs truncate text-xs sm:text-sm">
                          {fundData.fundName}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="secondary" className="text-xs">{fund?.weightage || 0}%</Badge>
                        </TableCell>
                        <TableCell className={`text-xs sm:text-sm ${fundData.mean >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}`}>
                          {formatNumber(fundData.mean)}%
                        </TableCell>
                        <TableCell className={`text-xs sm:text-sm ${fundData.median >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatNumber(fundData.median)}%
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className={fundData.positivePercentage >= 70 ? 'text-green-700' : fundData.positivePercentage >= 50 ? 'text-yellow-700' : 'text-red-700'}>
                              {formatNumber(fundData.positivePercentage)}%
                            </span>
                            {fundData.positivePercentage >= 70 && (
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <span className={fundData.stdDev < 15 ? 'text-green-700' : fundData.stdDev < 25 ? 'text-yellow-700' : 'text-red-700'}>
                            {formatNumber(fundData.stdDev)}%
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

          {/* Performance Insights */}
          <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <span>Performance Insights</span>
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-gray-700">
              <p>
                • This portfolio shows <strong>{formatNumber(performance.rollingReturns.bucket.positivePercentage)}% positive periods</strong>, 
                indicating {performance.rollingReturns.bucket.positivePercentage >= 70 ? 'consistent' : performance.rollingReturns.bucket.positivePercentage >= 50 ? 'moderately consistent' : 'inconsistent'} performance over the analysis period.
              </p>
              <p>
                • Average rolling return of <strong>{formatNumber(performance.rollingReturns.bucket.mean)}%</strong> with 
                volatility of <strong>{formatNumber(performance.rollingReturns.bucket.stdDev)}%</strong> suggests a 
                {performance.rollingReturns.bucket.stdDev < 15 ? ' stable' : performance.rollingReturns.bucket.stdDev < 25 ? ' moderately stable' : ' volatile'} portfolio.
              </p>
              <p>
                • Analysis period: <strong>{performance.totalPeriods} rolling periods</strong> 
                from {new Date(performance.analysisStartDate).toLocaleDateString()} to {new Date(performance.analysisEndDate).toLocaleDateString()}
              </p>
            </div>
          </Card>

          {/* Advanced Performance Button */}
          <Card className="p-4 sm:p-5 md:p-6 border-2 border-dashed border-blue-300 bg-blue-50/50">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Want More Detailed Analysis?</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 max-w-2xl mx-auto px-2">
                Use the advanced rolling returns calculator to customize your analysis with different investment strategies, 
                time windows, and rolling periods.
              </p>
              <Button
                onClick={() => setShowAdvanced(true)}
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 text-sm sm:text-base h-10 sm:h-11 md:h-12 px-4 sm:px-6"
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="whitespace-nowrap">Check Advanced Performance (Optional)</span>
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

