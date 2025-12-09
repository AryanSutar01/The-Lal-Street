import React, { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { SIPCalculator } from './calculators/SIPCalculator';
import { LumpsumCalculator } from './calculators/LumpsumCalculator';
import { SIPLumpsumCalculator } from './calculators/SIPLumpsumCalculator';
import { TrendingUp } from 'lucide-react';
import type { SelectedFund } from '../App';

interface InvestmentTabProps {
  selectedFunds: SelectedFund[];
}

type InvestmentType = 'SIP' | 'Lumpsum' | 'SIPLumpsum' | null;

export function InvestmentTab({ selectedFunds }: InvestmentTabProps) {
  const [investmentType, setInvestmentType] = useState<InvestmentType>(null);

  // Allow 1 or more funds
  if (selectedFunds.length < 1) {
    return (
      <Card className="p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 mb-3 sm:mb-4">
          <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Select Funds First</h3>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          Please add at least 1 fund to your portfolio above before selecting an investment type.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Investment Type Selection - Always Visible */}
      <Card className="p-4 sm:p-5 md:p-6">
        <Label className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block">Select Investment Type</Label>
        <RadioGroup value={investmentType || ''} onValueChange={(value) => setInvestmentType(value as InvestmentType)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div 
              className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                investmentType === 'SIP' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
              }`}
              onClick={() => setInvestmentType('SIP')}
            >
              <RadioGroupItem value="SIP" id="sip" />
              <Label htmlFor="sip" className={`cursor-pointer font-normal flex-1 text-sm sm:text-base ${
                investmentType === 'SIP' ? 'font-semibold text-blue-700' : ''
              }`}>
                SIP (Systematic Investment Plan)
              </Label>
            </div>
            <div 
              className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                investmentType === 'Lumpsum' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
              }`}
              onClick={() => setInvestmentType('Lumpsum')}
            >
              <RadioGroupItem value="Lumpsum" id="lumpsum" />
              <Label htmlFor="lumpsum" className={`cursor-pointer font-normal flex-1 text-sm sm:text-base ${
                investmentType === 'Lumpsum' ? 'font-semibold text-blue-700' : ''
              }`}>
                Lumpsum
              </Label>
            </div>
            <div 
              className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                investmentType === 'SIPLumpsum' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
              }`}
              onClick={() => setInvestmentType('SIPLumpsum')}
            >
              <RadioGroupItem value="SIPLumpsum" id="siplumpsum" />
              <Label htmlFor="siplumpsum" className={`cursor-pointer font-normal flex-1 text-sm sm:text-base ${
                investmentType === 'SIPLumpsum' ? 'font-semibold text-blue-700' : ''
              }`}>
                SIP + Lumpsum
              </Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Show calculator below when type is selected */}
      {investmentType && (
        <div className="space-y-3 sm:space-y-4">
          <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {investmentType === 'SIP' && 'SIP Calculator'}
                  {investmentType === 'Lumpsum' && 'Lumpsum Calculator'}
                  {investmentType === 'SIPLumpsum' && 'SIP + Lumpsum Calculator'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">Configure your investment and calculate returns</p>
              </div>
            </div>
          </Card>

          {/* Render the appropriate calculator */}
          {investmentType === 'SIP' && <SIPCalculator funds={selectedFunds} />}
          {investmentType === 'Lumpsum' && <LumpsumCalculator funds={selectedFunds} />}
          {investmentType === 'SIPLumpsum' && <SIPLumpsumCalculator funds={selectedFunds} />}
        </div>
      )}
    </div>
  );
}
