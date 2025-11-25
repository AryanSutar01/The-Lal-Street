import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { SWPCalculator } from './calculators/SWPCalculator';
import { TrendingUp } from 'lucide-react';
import type { SelectedFund } from '../App';

interface RetirePlanTabProps {
  selectedFunds: SelectedFund[];
}

type PlanMode = 'PAYOUT' | 'CORPUS' | 'NORMAL' | null;

export function RetirePlanTab({ selectedFunds }: RetirePlanTabProps) {
  const [planMode, setPlanMode] = useState<PlanMode>(null);

  if (selectedFunds.length < 1) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Funds First</h3>
        <p className="text-gray-600">
          Please add at least 1 fund to your portfolio above before planning your retirement.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      {!planMode && (
        <Card className="p-6">
          <Label className="text-base font-semibold mb-4 block">Select Planning Mode</Label>
          <RadioGroup value={planMode || ''} onValueChange={(value) => setPlanMode(value as PlanMode)}>
            <div className="space-y-3">
              <div 
                className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all"
                onClick={() => setPlanMode('PAYOUT')}
              >
                <RadioGroupItem value="PAYOUT" id="payout" />
                <Label htmlFor="payout" className="cursor-pointer font-normal flex-1">
                  How much payout expected? (I have corpus - Calculate safe withdrawal)
                </Label>
              </div>
              <div 
                className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all"
                onClick={() => setPlanMode('CORPUS')}
              >
                <RadioGroupItem value="CORPUS" id="corpus" />
                <Label htmlFor="corpus" className="cursor-pointer font-normal flex-1">
                  How much corpus is required? (I have target withdrawal - Calculate required corpus)
                </Label>
              </div>
              <div 
                className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all"
                onClick={() => setPlanMode('NORMAL')}
              >
                <RadioGroupItem value="NORMAL" id="normal" />
                <Label htmlFor="normal" className="cursor-pointer font-normal flex-1">
                  Perform Normal calculations
                </Label>
              </div>
            </div>
          </RadioGroup>
        </Card>
      )}

      {/* Normal SWP Calculator - Normal Simulation Mode */}
      {planMode === 'NORMAL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Normal SWP Calculator</h3>
              <p className="text-sm text-gray-600">Run normal SWP simulations with your own inputs</p>
            </div>
            <button
              onClick={() => setPlanMode(null)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Change Mode
            </button>
          </div>
          <SWPCalculator 
            funds={selectedFunds} 
            forcedMode="NORMAL"
            title="Normal SWP Simulation"
            hideAdvanced={true}
          />
        </div>
      )}

      {/* Safe Withdrawal Calculator - "I Have Corpus" Mode */}
      {planMode === 'PAYOUT' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Calculate Safe Withdrawal</h3>
              <p className="text-sm text-gray-600">I have a corpus - Calculate safe withdrawal amount</p>
            </div>
            <button
              onClick={() => setPlanMode(null)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Change Mode
            </button>
          </div>
          <SWPCalculator 
            funds={selectedFunds} 
            forcedMode="CORPUS"
            title="Safe Withdrawal Calculator"
            hideAdvanced={false}
          />
        </div>
      )}

      {/* Required Corpus Calculator - "I Have Target Withdrawal" Mode */}
      {planMode === 'CORPUS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Calculate Required Corpus</h3>
              <p className="text-sm text-gray-600">I have a target withdrawal - Calculate required corpus</p>
            </div>
            <button
              onClick={() => setPlanMode(null)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Change Mode
            </button>
          </div>
          <SWPCalculator 
            funds={selectedFunds} 
            forcedMode="TARGET"
            title="Required Corpus Calculator"
            hideAdvanced={false}
          />
        </div>
      )}
    </div>
  );
}
