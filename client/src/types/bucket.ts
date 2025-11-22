import type { SelectedFund } from '../App';

export interface Bucket {
  id: string;
  name: string;
  funds: SelectedFund[];
  createdAt: string;
  swpConfig?: {
    mode: 'PAYOUT' | 'INVESTMENT';
    payoutAmount?: number;
    investmentAmount?: number;
    frequency: 'Monthly' | 'Quarterly';
    duration?: number;
  };
}

export interface BucketPerformance {
  bucketId: string;
  currentValue: number;
  totalInvested: number;
  profit: number;
  profitPercentage: number;
  cagr: number;
  xirr: number;
}

