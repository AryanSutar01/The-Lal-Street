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
      <section id="recommended-portfolios" className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Recommended Portfolios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expertly curated fund buckets with proven performance track records. 
              Import these portfolios directly into your investment or retirement plans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buckets.map((bucket) => (
              <Card key={bucket.id} className="p-6 hover:shadow-xl transition-shadow border-2">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {bucket.name}
                    </h3>
                    <Badge className={getRiskColor(bucket.riskLevel)}>
                      {bucket.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  {bucket.description && (
                    <p className="text-sm text-gray-600">{bucket.description}</p>
                  )}
                </div>

                {/* Performance Summary */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-xs text-gray-600">Avg. Rolling Return (3Y)</span>
                    <span className="text-lg font-bold text-blue-700">
                      {bucket.performance.rollingReturns.bucket.mean.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Positive Periods</p>
                      <p className="text-sm font-semibold text-green-700">
                        {bucket.performance.rollingReturns.bucket.positivePercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600">Volatility</p>
                      <p className="text-sm font-semibold text-purple-700">
                        {bucket.performance.rollingReturns.bucket.stdDev.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Funds List */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Funds ({bucket.funds.length})
                  </p>
                  <div className="space-y-1">
                    {bucket.funds.slice(0, 3).map((fund) => (
                      <div key={fund.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 truncate flex-1">{fund.name}</span>
                        <span className="text-gray-500 ml-2">{fund.weightage}%</span>
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
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPerformance(bucket)}
                    className="w-full"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Performance
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {bucket.category === 'investment' || bucket.category === 'both' ? (
                      <Button
                        size="sm"
                        onClick={() => handleImportClick(bucket, 'investment')}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Investment
                      </Button>
                    ) : null}
                    {bucket.category === 'retirement' || bucket.category === 'both' ? (
                      <Button
                        size="sm"
                        onClick={() => handleImportClick(bucket, 'retirement')}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Retirement
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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBucket.name} - Performance Analysis</DialogTitle>
              <DialogDescription>
                Detailed rolling returns analysis from {new Date(selectedBucket.performance.analysisStartDate).toLocaleDateString()} 
                to {new Date(selectedBucket.performance.analysisEndDate).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <RollingReturnsDisplay bucket={selectedBucket} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

