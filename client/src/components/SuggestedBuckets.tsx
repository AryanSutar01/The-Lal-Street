import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Download, CheckCircle2, Info, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import type { SuggestedBucket } from '../types/suggestedBucket';
import { RollingReturnsDisplay } from './RollingReturnsDisplay';
// Removed unused import

interface SuggestedBucketsProps {
  buckets: SuggestedBucket[];
  onImportBucket: (bucket: SuggestedBucket, targetPage: 'investment' | 'retirement') => void;
}

export function SuggestedBuckets({ buckets, onImportBucket }: SuggestedBucketsProps) {
  const [selectedBucket, setSelectedBucket] = useState<SuggestedBucket | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [importTarget, setImportTarget] = useState<'investment' | 'retirement' | null>(null);

  const handleViewPerformance = (bucket: SuggestedBucket) => {
    setSelectedBucket(bucket);
    setShowPerformanceModal(true);
  };

  const handleImportClick = (bucket: SuggestedBucket, target: 'investment' | 'retirement') => {
    onImportBucket(bucket, target);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (buckets.length === 0) {
    return null;
  }

  return (
    <>
      <section id="recommended-portfolios" className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Recommended Portfolios
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Expertly curated fund buckets with proven performance track records. 
              Import these portfolios directly into your investment or retirement plans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {buckets.map((bucket) => (
              <Card key={bucket.id} className="p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow border-2 flex flex-col">
                {/* Header */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex-1 min-w-0 break-words">
                      {bucket.name}
                    </h3>
                    <Badge className={`${getRiskColor(bucket.riskLevel)} flex-shrink-0 text-xs sm:text-sm whitespace-nowrap`}>
                      {bucket.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  {bucket.description && (
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{bucket.description}</p>
                  )}
                </div>

                {/* Performance Summary */}
                <div className="mb-3 sm:mb-4 space-y-2">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 truncate">Avg. Rolling Return (3Y)</span>
                    <span className="text-base sm:text-lg font-bold text-blue-700 flex-shrink-0">
                      {bucket.performance.rollingReturns.bucket.mean.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 sm:p-2.5 bg-green-50 rounded">
                      <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Positive Periods</p>
                      <p className="text-xs sm:text-sm font-semibold text-green-700">
                        {bucket.performance.rollingReturns.bucket.positivePercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-2 sm:p-2.5 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Volatility</p>
                      <p className="text-xs sm:text-sm font-semibold text-purple-700">
                        {bucket.performance.rollingReturns.bucket.stdDev.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Funds List */}
                <div className="mb-3 sm:mb-4 flex-1">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Funds ({bucket.funds.length})
                  </p>
                  <div className="space-y-1">
                    {bucket.funds.slice(0, 3).map((fund) => (
                      <div key={fund.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-gray-700 truncate flex-1 min-w-0">{fund.name}</span>
                        <span className="text-gray-500 flex-shrink-0 whitespace-nowrap">{fund.weightage}%</span>
                      </div>
                    ))}
                    {bucket.funds.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{bucket.funds.length - 3} more funds
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:gap-2.5 pt-3 sm:pt-4 border-t mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPerformance(bucket)}
                    className="w-full text-xs sm:text-sm h-9 sm:h-10"
                  >
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="whitespace-nowrap">View Performance</span>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {bucket.category === 'investment' || bucket.category === 'both' ? (
                      <Button
                        size="sm"
                        onClick={() => handleImportClick(bucket, 'investment')}
                        className="text-xs sm:text-sm h-9 sm:h-10 whitespace-nowrap"
                      >
                        <Download className="h-3 w-3 mr-1 sm:mr-1.5" />
                        <span className="truncate">Investment</span>
                      </Button>
                    ) : null}
                    {bucket.category === 'retirement' || bucket.category === 'both' ? (
                      <Button
                        size="sm"
                        onClick={() => handleImportClick(bucket, 'retirement')}
                        className="text-xs sm:text-sm h-9 sm:h-10 whitespace-nowrap"
                      >
                        <Download className="h-3 w-3 mr-1 sm:mr-1.5" />
                        <span className="truncate">Retirement</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Modal */}
      {selectedBucket && (
        <Dialog open={showPerformanceModal} onOpenChange={setShowPerformanceModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 w-full">
            <DialogHeader className="pb-2 sm:pb-3">
              <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl break-words pr-6">
                {selectedBucket.name} - Performance Analysis
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                Detailed rolling returns analysis from {new Date(selectedBucket.performance.analysisStartDate).toLocaleDateString()} 
                to {new Date(selectedBucket.performance.analysisEndDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-x-hidden">
              <RollingReturnsDisplay bucket={selectedBucket} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

