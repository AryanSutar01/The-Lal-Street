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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">Investment Plan</h1>
                <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">Calculate returns for SIP, Lumpsum, and combined investment strategies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Selection Section */}
        <div className="mb-6 sm:mb-8">
          <Card className="p-4 sm:p-5 md:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Step 1: Select Your Funds</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
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
            <Card className="p-4 sm:p-5 md:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Step 2: Calculate Investment Returns</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Select an investment strategy and calculate your expected returns based on historical NAV data.
              </p>
            </Card>
            <div className="mt-3 sm:mt-4">
              <InvestmentTab selectedFunds={selectedFunds} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedFunds.length < 1 && (
          <Card className="p-6 sm:p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-4 sm:mb-6 shadow-lg">
              <TrendingUp className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">Select Funds to Get Started</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-2">
              Add at least 1 fund to your portfolio above to begin calculating investment returns.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

