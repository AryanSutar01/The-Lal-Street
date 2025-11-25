import React from 'react';
import { FundSearch } from './FundSearch';
import { FundBucket } from './FundBucket';
import { RetirePlanTab } from './RetirePlanTab';
import { Card } from './ui/card';
import { Target } from 'lucide-react';
import type { Fund, SelectedFund } from '../App';

interface RetirementPlanPageProps {
  selectedFunds: SelectedFund[];
  onAddFund: (fund: Fund) => void;
  onRemoveFund: (fundId: string) => void;
  onWeightageChange: (fundId: string, weightage: number) => void;
}

export function RetirementPlanPage({
  selectedFunds,
  onAddFund,
  onRemoveFund,
  onWeightageChange,
}: RetirementPlanPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Retirement Plan</h1>
                <p className="text-green-100 mt-2">Plan your retirement with systematic withdrawal plans and yearly return calculations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Selection Section */}
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Select Your Funds</h2>
            <p className="text-gray-600 mb-6">
              Search and add mutual funds to build your retirement portfolio. You can add 1-5 funds.
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

        {/* Retirement Planning Section */}
        {selectedFunds.length >= 1 && (
          <div>
            <RetirePlanTab selectedFunds={selectedFunds} />
          </div>
        )}

        {/* Empty State */}
        {selectedFunds.length < 1 && (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 mb-6 shadow-lg">
              <Target className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Select Funds to Get Started</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Add at least 1 fund to your portfolio above to begin planning your retirement strategy.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

