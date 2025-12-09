import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { BarChart3 } from 'lucide-react';
import type { SuggestedBucket } from '../types/suggestedBucket';
import { BucketPerformanceReport } from './BucketPerformanceReport';
import { SuggestedBucketCard } from './SuggestedBucketCard';

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

  if (buckets.length === 0) {
    return null;
  }

  return (
    <>
      <section id="recommended-portfolios" className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Recommended Portfolios
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Expertly curated fund buckets with proven performance track records. 
              <span className="block mt-2 text-sm sm:text-base text-gray-500">
                See projected returns based on 3-year historical performance
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {buckets.map((bucket) => (
              <SuggestedBucketCard
                key={bucket.id}
                bucket={bucket}
                onViewPerformance={handleViewPerformance}
                onImportBucket={handleImportClick}
              />
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
              <BucketPerformanceReport bucket={selectedBucket} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

