import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { LandingPage } from './components/LandingPage';
import { RetirePlanTab } from './components/RetirePlanTab';
import { InvestmentTab } from './components/InvestmentTab';
import { TrendingUp, PieChart, Calculator, BarChart3 } from 'lucide-react';
import type { Bucket } from './types/bucket';

export interface Fund {
  id: string;
  name: string;
  launchDate: string;
  category: string;
}

export interface SelectedFund extends Fund {
  weightage: number;
}

export type TabType = 'Landing' | 'RetirePlan' | 'Investment';

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
  const [activeTab, setActiveTab] = useState<TabType>('Landing');
  const [buckets, setBuckets] = useState<Bucket[]>([]);

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

  const handleCreateBucket = useCallback((name: string, funds: SelectedFund[]) => {
    const newBucket: Bucket = {
      id: `bucket-${Date.now()}`,
      name,
      funds: [...funds], // Create a copy
      createdAt: new Date().toISOString(),
    };
    setBuckets(prev => [...prev, newBucket]);
  }, []);

  const handleDeleteBucket = useCallback((bucketId: string) => {
    setBuckets(prev => prev.filter(b => b.id !== bucketId));
  }, []);

  const handleAddFundsToBucket = useCallback((bucketId: string, funds: SelectedFund[]) => {
    setBuckets(prev => prev.map(bucket => 
      bucket.id === bucketId 
        ? { ...bucket, funds: [...funds] }
        : bucket
    ));
  }, []);

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
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  The Lal Street
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">Portfolio Analysis & Investment Calculator</p>
                <p className="text-xs text-slate-500 sm:hidden">Investment Calculator</p>
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
                {buckets.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-100">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <div className="text-left">
                      <div className="text-xs text-slate-500">Buckets</div>
                      <div className="text-sm font-semibold text-slate-900">{buckets.length}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="Landing" className="flex items-center justify-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Landing</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="RetirePlan" className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Retire/Yearly Return Plan</span>
              <span className="sm:hidden">Retire</span>
            </TabsTrigger>
            <TabsTrigger value="Investment" className="flex items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Investment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Landing" className="mt-0">
            <LandingPage
              selectedFunds={selectedFunds}
              onAddFund={handleAddFund}
              onRemoveFund={handleRemoveFund}
              onWeightageChange={handleWeightageChange}
            />
          </TabsContent>

          <TabsContent value="RetirePlan" className="mt-0">
            <RetirePlanTab
              selectedFunds={selectedFunds}
              buckets={buckets}
              onCreateBucket={handleCreateBucket}
              onDeleteBucket={handleDeleteBucket}
              onAddFundsToBucket={handleAddFundsToBucket}
            />
          </TabsContent>

          <TabsContent value="Investment" className="mt-0">
            <InvestmentTab selectedFunds={selectedFunds} />
          </TabsContent>
        </Tabs>
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
