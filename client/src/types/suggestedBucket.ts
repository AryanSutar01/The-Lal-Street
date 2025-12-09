import type { SelectedFund } from '../App';

export interface SuggestedBucket {
  id: string;
  name: string;
  description: string;
  category: 'investment' | 'retirement' | 'both';
  funds: SelectedFund[];
  createdAt: string;
  updatedAt: string;
  lastCalculationDate?: string; // Date when performance was last calculated
  isActive: boolean;
  
  // Pre-calculated performance metrics
  performance: {
    // Rolling returns (3 year window)
    rollingReturns: {
      bucket: {
        mean: number;
        median: number;
        max: number;
        min: number;
        stdDev: number;
        positivePercentage: number;
      };
      funds: Array<{
        fundId: string;
        fundName: string;
        mean: number;
        median: number;
        max: number;
        min: number;
        stdDev: number;
        positivePercentage: number;
      }>;
    };
    
    // Overall statistics
    cagr?: number;
    volatility?: number;
    riskLevel: 'low' | 'moderate' | 'high';
    
    // Analysis period
    analysisStartDate: string;
    analysisEndDate: string;
    totalPeriods: number;
  };
  
  // Display metadata
  tags?: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  minInvestment?: number;
  targetAudience?: string; // e.g., "Conservative Investors", "Growth Seekers"
}

export interface BucketPerformanceData {
  bucketId: string;
  rollingReturns: {
    bucket: {
      mean: number;
      median: number;
      max: number;
      min: number;
      stdDev: number;
      positivePercentage: number;
    };
    funds: Array<{
      fundId: string;
      fundName: string;
      mean: number;
      median: number;
      max: number;
      min: number;
      stdDev: number;
      positivePercentage: number;
    }>;
  };
  analysisStartDate: string;
  analysisEndDate: string;
}

