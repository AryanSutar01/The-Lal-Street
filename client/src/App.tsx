import React, { useState } from 'react';
import { FundSearch } from './components/FundSearch';
import { FundBucket } from './components/FundBucket';
import { CalculatorButtons } from './components/CalculatorButtons';
import { SIPCalculator } from './components/calculators/SIPCalculator';
import { RollingCalculator } from './components/calculators/RollingCalculator';
import { LumpsumCalculator } from './components/calculators/LumpsumCalculator';
import { SWPCalculator } from './components/calculators/SWPCalculator';
import { SIPLumpsumCalculator } from './components/calculators/SIPLumpsumCalculator';
import { TrendingUp, PieChart, Calculator, BarChart3 } from 'lucide-react';

export interface Fund {
  id: string;
  name: string;
  launchDate: string;
  category: string;
}

export interface SelectedFund extends Fund {
  weightage: number;
}

export type CalculatorType = 'SIP' | 'SIPLumpsum' | 'Rolling' | 'Lumpsum' | 'SWP' | null;

// Utility function to distribute 100% weightage as whole numbers
const distributeWeightage = (count: number): number[] => {
  if (count === 0) return [];
  
  const baseWeight = Math.floor(100 / count);
  const remainder = 100 - (baseWeight * count);
  
  // Create array with base weights
  const weights = new Array(count).fill(baseWeight);
  
  // Distribute remainder by adding 1 to the first 'remainder' funds
  for (let i = 0; i < remainder; i++) {
    weights[i] += 1;
  }
  
  return weights;
};

export default function App() {
  const [selectedFunds, setSelectedFunds] = useState<SelectedFund[]>([]);
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(null);

  const handleAddFund = (fund: Fund) => {
    // Check if fund already exists in bucket
    if (selectedFunds.find(f => f.id === fund.id)) {
      return;
    }
    
    // Check fund limit (max 5 funds)
    if (selectedFunds.length >= 5) {
      alert('Maximum 5 funds allowed in the bucket. Please remove a fund before adding a new one.');
      return;
    }
    
    // Calculate equal weightage using whole numbers
    const newCount = selectedFunds.length + 1;
    const weights = distributeWeightage(newCount);
    
    const updatedFunds = selectedFunds.map((f, index) => ({
      ...f,
      weightage: weights[index]
    }));
    
    setSelectedFunds([...updatedFunds, { ...fund, weightage: weights[newCount - 1] }]);
  };

  const handleRemoveFund = (fundId: string) => {
    const filtered = selectedFunds.filter(f => f.id !== fundId);
    
    // Redistribute weightage equally using whole numbers
    if (filtered.length > 0) {
      const weights = distributeWeightage(filtered.length);
      const redistributed = filtered.map((f, index) => ({
        ...f,
        weightage: weights[index]
      }));
      setSelectedFunds(redistributed);
    } else {
      setSelectedFunds([]);
    }
  };

  const handleWeightageChange = (fundId: string, weightage: number) => {
    setSelectedFunds(selectedFunds.map(f => 
      f.id === fundId ? { ...f, weightage } : f
    ));
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'SIP':
        return <SIPCalculator funds={selectedFunds} />;
      case 'SIPLumpsum':
        return <SIPLumpsumCalculator funds={selectedFunds} />;
      case 'Rolling':
        return <RollingCalculator funds={selectedFunds} />;
      case 'Lumpsum':
        return <LumpsumCalculator funds={selectedFunds} />;
      case 'SWP':
        return <SWPCalculator funds={selectedFunds} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  The Lal Street
                </h1>
                <p className="text-xs text-slate-500">Portfolio Analysis & Investment Calculator</p>
              </div>
            </div>
            
            {/* Stats Badge */}
            {selectedFunds.length > 0 && (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <PieChart className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <div className="text-xs text-slate-500">Portfolio</div>
                    <div className="text-sm font-semibold text-slate-900">{selectedFunds.length} {selectedFunds.length === 1 ? 'Fund' : 'Funds'}</div>
                  </div>
                </div>
                {activeCalculator && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-100">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <div className="text-left">
                      <div className="text-xs text-slate-500">Active</div>
                      <div className="text-sm font-semibold text-slate-900">{activeCalculator}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Section / Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden border border-blue-500">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">Professional Investment Tools</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Mutual Fund Portfolio Calculator
              </h2>
              <p className="text-blue-100 max-w-2xl">
                Analyze your portfolio performance with real-time NAV data. Calculate SIP returns, lumpsum investments, 
                rolling returns, and systematic withdrawal plans with industry-standard metrics.
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                <div className="px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm text-xs font-medium border border-white/40">
                  ✓ Real NAV Data
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm text-xs font-medium border border-white/40">
                  ✓ XIRR & CAGR Calculations
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm text-xs font-medium border border-white/40">
                  ✓ Rolling Returns Analysis
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm text-xs font-medium border border-white/40">
                  ✓ Multi-Fund Buckets
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fund Search */}
        <div className="mb-6">
          <FundSearch onSelectFund={handleAddFund} />
        </div>

        {/* Fund Bucket */}
        {selectedFunds.length > 0 && (
          <div className="mb-8">
            <FundBucket
              funds={selectedFunds}
              onRemoveFund={handleRemoveFund}
              onWeightageChange={handleWeightageChange}
            />
          </div>
        )}

        {/* Calculator Type Selection */}
        {selectedFunds.length > 0 && (
          <div className="mb-8">
            <CalculatorButtons
              activeCalculator={activeCalculator}
              onSelectCalculator={setActiveCalculator}
            />
          </div>
        )}

        {/* Active Calculator */}
        {activeCalculator && selectedFunds.length > 0 && (
          <div className="animate-in fade-in duration-300">
            {renderCalculator()}
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
              Search for mutual funds above and add them to your portfolio to begin analyzing returns, 
              calculating SIPs, and optimizing your investments.
            </p>
            
            {/* Quick Guide */}
            <div className="max-w-2xl mx-auto mt-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-white border-2 border-blue-200 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">1. Search Funds</h4>
                  <p className="text-xs text-slate-600">Find mutual funds by name or code</p>
                </div>
                
                <div className="p-5 rounded-xl bg-white border-2 border-green-200 shadow-lg hover:shadow-xl hover:border-green-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">2. Set Weightage</h4>
                  <p className="text-xs text-slate-600">Allocate portfolio percentages</p>
                </div>
                
                <div className="p-5 rounded-xl bg-white border-2 border-amber-200 shadow-lg hover:shadow-xl hover:border-amber-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <span className="text-2xl">🧮</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">3. Choose Calculator</h4>
                  <p className="text-xs text-slate-600">Select SIP, Lumpsum, or Rolling</p>
                </div>
                
                <div className="p-5 rounded-xl bg-white border-2 border-purple-200 shadow-lg hover:shadow-xl hover:border-purple-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">4. Analyze Results</h4>
                  <p className="text-xs text-slate-600">View returns, XIRR, and charts</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-16 border-t-2 border-slate-300 bg-gradient-to-r from-white via-slate-50 to-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-slate-700">
              © 2024 The Lal Street. Built with real NAV data for accurate portfolio analysis.
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium text-green-700">Live NAV Data</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-medium">Industry-Standard Calculations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
