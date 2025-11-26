import type { SuggestedBucket } from '../types/suggestedBucket';
import { loadSuggestedBuckets, saveSuggestedBuckets, updateSuggestedBucket } from '../data/suggestedBuckets';
import { calculateBucketPerformance } from './bucketPerformanceCalculator';
import { checkServerHealth, shouldRecalculate } from './serverHealthCheck';

const RECALCULATION_INTERVAL_DAYS = 5;

/**
 * Recalculate performance for a single bucket
 */
async function recalculateBucketPerformance(bucket: SuggestedBucket): Promise<SuggestedBucket | null> {
  try {
    console.log(`[Recalculation] Starting recalculation for bucket: ${bucket.name}`);
    
    // Calculate new performance metrics
    const performance = await calculateBucketPerformance(bucket.funds);
    
    // Update bucket with new performance data
    const updatedBucket: SuggestedBucket = {
      ...bucket,
      performance: {
        ...bucket.performance,
        rollingReturns: performance.rollingReturns,
        analysisStartDate: performance.analysisStartDate,
        analysisEndDate: performance.analysisEndDate,
        totalPeriods: performance.totalPeriods,
      },
      lastCalculationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save updated bucket
    await updateSuggestedBucket(bucket.id, updatedBucket);
    
    console.log(`[Recalculation] Successfully recalculated bucket: ${bucket.name}`);
    return updatedBucket;
  } catch (error: any) {
    console.error(`[Recalculation] Error recalculating bucket ${bucket.name}:`, error.message);
    return null;
  }
}

/**
 * Check and recalculate buckets that need updating
 * Only recalculates if server is not under load
 */
export async function checkAndRecalculateBuckets(): Promise<{
  checked: number;
  recalculated: number;
  skipped: number;
  errors: number;
}> {
  const stats = {
    checked: 0,
    recalculated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Check server health first
    const serverStatus = await checkServerHealth();
    
    if (!serverStatus.isHealthy) {
      console.log('[Recalculation] Server is not healthy, skipping recalculation');
      return stats;
    }

    if (serverStatus.isLoading) {
      console.log('[Recalculation] Server is under load, skipping recalculation');
      return stats;
    }

    console.log('[Recalculation] Server is healthy, checking buckets...');

    // Load all buckets
    const buckets = await loadSuggestedBuckets(false);
    
    // Filter active buckets that need recalculation
    const bucketsToRecalculate = buckets.filter(bucket => {
      stats.checked++;
      return (
        bucket.isActive &&
        shouldRecalculate(bucket.lastCalculationDate, RECALCULATION_INTERVAL_DAYS)
      );
    });

    if (bucketsToRecalculate.length === 0) {
      console.log('[Recalculation] No buckets need recalculation');
      return stats;
    }

    console.log(`[Recalculation] Found ${bucketsToRecalculate.length} buckets that need recalculation`);

    // Recalculate buckets one by one (to avoid overwhelming the server)
    for (const bucket of bucketsToRecalculate) {
      const result = await recalculateBucketPerformance(bucket);
      
      if (result) {
        stats.recalculated++;
      } else {
        stats.errors++;
      }

      // Small delay between recalculations to avoid server overload
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[Recalculation] Completed: ${stats.recalculated} recalculated, ${stats.errors} errors`);
    
    return stats;
  } catch (error: any) {
    console.error('[Recalculation] Error in checkAndRecalculateBuckets:', error.message);
    return stats;
  }
}

/**
 * Recalculate a specific bucket by ID
 */
export async function recalculateSingleBucket(bucketId: string): Promise<SuggestedBucket | null> {
  const buckets = await loadSuggestedBuckets(false);
  const bucket = buckets.find(b => b.id === bucketId);
  
  if (!bucket) {
    console.error(`[Recalculation] Bucket not found: ${bucketId}`);
    return null;
  }

  return await recalculateBucketPerformance(bucket);
}

