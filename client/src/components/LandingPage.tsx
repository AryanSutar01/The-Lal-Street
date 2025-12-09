import React, { useState } from 'react';
import { FundSearch } from './FundSearch';
import { FundBucket } from './FundBucket';
import { PieChart } from 'lucide-react';
import type { Fund, SelectedFund } from '../App';

interface LandingPageProps {
  selectedFunds: SelectedFund[];
  onAddFund: (fund: Fund) => void;
  onRemoveFund: (fundId: string) => void;
  onWeightageChange: (fundId: string, weightage: number) => void;
}

export function LandingPage({
  selectedFunds,
  onAddFund,
  onRemoveFund,
  onWeightageChange,
}: LandingPageProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden border border-blue-500">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white rounded-full -translate-y-16 translate-x-16 sm:-translate-y-32 sm:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white rounded-full translate-y-12 -translate-x-12 sm:translate-y-24 sm:-translate-x-24"></div>
        </div>
        
        <div className="relative">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
            Build Your Investment Portfolio
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Search and select mutual funds to create your investment bucket. 
            Add 2-5 funds and allocate weightage to start planning your investments.
          </p>
        </div>
      </div>

      {/* Fund Search */}
      <div>
        <FundSearch onSelectFund={onAddFund} />
      </div>

      {/* Fund Bucket */}
      {selectedFunds.length > 0 && (
        <div>
          <FundBucket
            funds={selectedFunds}
            onRemoveFund={onRemoveFund}
            onWeightageChange={onWeightageChange}
          />
        </div>
      )}

      {/* Empty State */}
      {selectedFunds.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-6 shadow-lg">
            <PieChart className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Start Building Your Portfolio</h3>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            Search for mutual funds above and add them to your bucket. 
            You can add 2-5 funds to create a diversified portfolio.
          </p>
          
          {/* Quick Guide */}
          <div className="max-w-2xl mx-auto mt-8 sm:mt-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-white border-2 border-blue-200 shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md">
                  <span className="text-xl sm:text-2xl">🔍</span>
                </div>
                <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-1">Search Funds</h4>
                <p className="text-xs text-slate-600">Find mutual funds by name or code</p>
              </div>
              
              <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-white border-2 border-green-200 shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md">
                  <span className="text-xl sm:text-2xl">📊</span>
                </div>
                <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-1">Add to Bucket</h4>
                <p className="text-xs text-slate-600">Select funds for your portfolio</p>
              </div>
              
              <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-white border-2 border-amber-200 shadow-lg col-span-2 md:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md">
                  <span className="text-xl sm:text-2xl">⚖️</span>
                </div>
                <h4 className="font-semibold text-sm sm:text-base text-slate-900 mb-1">Set Weightage</h4>
                <p className="text-xs text-slate-600">Allocate portfolio percentages</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

