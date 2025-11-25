import type { SuggestedBucket } from '../types/suggestedBucket';
import type { SelectedFund } from '../App';

// This will be populated by the admin interface
// For now, we'll create a structure that can be updated
export let suggestedBucketsData: SuggestedBucket[] = [];

/**
 * Initialize or load suggested buckets
 * This would typically load from an API or localStorage
 */
export function loadSuggestedBuckets(): SuggestedBucket[] {
  // Try to load from localStorage first
  try {
    const stored = localStorage.getItem('suggestedBuckets');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading suggested buckets:', error);
  }
  
  return suggestedBucketsData;
}

/**
 * Save suggested buckets (for admin)
 */
export function saveSuggestedBuckets(buckets: SuggestedBucket[]): void {
  suggestedBucketsData = buckets;
  try {
    localStorage.setItem('suggestedBuckets', JSON.stringify(buckets));
  } catch (error) {
    console.error('Error saving suggested buckets:', error);
  }
}

/**
 * Add a new suggested bucket
 */
export function addSuggestedBucket(bucket: SuggestedBucket): void {
  const buckets = loadSuggestedBuckets();
  buckets.push(bucket);
  saveSuggestedBuckets(buckets);
}

/**
 * Update an existing suggested bucket
 */
export function updateSuggestedBucket(bucketId: string, updates: Partial<SuggestedBucket>): void {
  const buckets = loadSuggestedBuckets();
  const index = buckets.findIndex(b => b.id === bucketId);
  if (index !== -1) {
    buckets[index] = { ...buckets[index], ...updates };
    saveSuggestedBuckets(buckets);
  }
}

/**
 * Delete a suggested bucket
 */
export function deleteSuggestedBucket(bucketId: string): void {
  const buckets = loadSuggestedBuckets();
  const filtered = buckets.filter(b => b.id !== bucketId);
  saveSuggestedBuckets(filtered);
}

