import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { SuggestedBucket } from '../types/suggestedBucket';

interface RollingReturnsDisplayProps {
  bucket: SuggestedBucket;
}

export function RollingReturnsDisplay({ bucket }: RollingReturnsDisplayProps) {
  const { rollingReturns } = bucket.performance;
  
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="space-y-4 sm:space-y-6 mt-2 sm:mt-4">
      {/* Portfolio Performance Summary */}
      <Card className="p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Portfolio Rolling Returns (3 Year Window)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Mean Return</p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-blue-700">
              {formatNumber(rollingReturns.bucket.mean)}%
            </p>
          </div>
          <div className="p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Median Return</p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-green-700">
              {formatNumber(rollingReturns.bucket.median)}%
            </p>
          </div>
          <div className="p-2 sm:p-3 md:p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Positive Periods</p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-purple-700">
              {formatNumber(rollingReturns.bucket.positivePercentage)}%
            </p>
          </div>
          <div className="p-2 sm:p-3 md:p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Volatility (Std Dev)</p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-orange-700">
              {formatNumber(rollingReturns.bucket.stdDev)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
          <div className="p-2 sm:p-3 md:p-4 bg-emerald-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Maximum Return</p>
            <p className="text-base sm:text-lg font-bold text-emerald-700">
              {formatNumber(rollingReturns.bucket.max)}%
            </p>
          </div>
          <div className="p-2 sm:p-3 md:p-4 bg-red-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Minimum Return</p>
            <p className="text-base sm:text-lg font-bold text-red-700">
              {formatNumber(rollingReturns.bucket.min)}%
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
              {rollingReturns.funds.map((fundData) => {
                const fund = bucket.funds.find(f => f.id === fundData.fundId);
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
            • This portfolio shows <strong>{formatNumber(rollingReturns.bucket.positivePercentage)}% positive periods</strong>, 
            indicating consistent performance over the analysis period.
          </p>
          <p>
            • Average rolling return of <strong>{formatNumber(rollingReturns.bucket.mean)}%</strong> with 
            volatility of <strong>{formatNumber(rollingReturns.bucket.stdDev)}%</strong> suggests a 
            {rollingReturns.bucket.stdDev < 15 ? ' stable' : rollingReturns.bucket.stdDev < 25 ? ' moderately stable' : ' volatile'} portfolio.
          </p>
          <p>
            • Analysis period: <strong>{bucket.performance.totalPeriods} rolling periods</strong> 
            from {new Date(bucket.performance.analysisStartDate).toLocaleDateString()} to {new Date(bucket.performance.analysisEndDate).toLocaleDateString()}
          </p>
        </div>
      </Card>
    </div>
  );
}

