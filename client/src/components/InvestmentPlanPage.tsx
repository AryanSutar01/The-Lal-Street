import React, { useState } from 'react';
import { FundSearch } from './FundSearch';
import { FundBucket } from './FundBucket';
import { InvestmentTab } from './InvestmentTab';
import { Card } from './ui/card';
import { TrendingUp } from 'lucide-react';
import type { Fund, SelectedFund } from '../App';

interface InvestmentPlanPageProps {
  selectedFunds: SelectedFund[];
  onAddFund: (fund: Fund) => void;
  onRemoveFund: (fundId: string) => void;
  onWeightageChange: (fundId: string, weightage: number) => void;
}

export function InvestmentPlanPage({
  selectedFunds,
  onAddFund,
  onRemoveFund,
  onWeightageChange,
}: InvestmentPlanPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Investment Plan</h1>
                <p className="text-blue-100 mt-2">Calculate returns for SIP, Lumpsum, and combined investment strategies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Selection Section */}
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Select Your Funds</h2>
            <p className="text-gray-600 mb-6">
              Search and add mutual funds to build your investment portfolio. You can add 1-5 funds.
            </p>
            <FundSearch onSelectFund={onAddFund} />
          </Card>
        </div>

        {/* Fund Bucket */}
        {selectedFunds.length > 0 && (
          <div className="mb-8">
            <FundBucket
              funds={selectedFunds}
              onRemoveFund={onRemoveFund}
              onWeightageChange={onWeightageChange}
            />
          </div>
        )}

        {/* Calculator Section */}
        {selectedFunds.length >= 1 && (
          <div>
            <InvestmentTab selectedFunds={selectedFunds} />
          </div>
        )}

        {/* Empty State */}
        {selectedFunds.length < 1 && (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-6 shadow-lg">
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Select Funds to Get Started</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Add at least 1 fund to your portfolio above to begin calculating investment returns.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

