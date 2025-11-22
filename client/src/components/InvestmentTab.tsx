import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { SIPCalculator } from './calculators/SIPCalculator';
import { LumpsumCalculator } from './calculators/LumpsumCalculator';
import { SIPLumpsumCalculator } from './calculators/SIPLumpsumCalculator';
import { RollingCalculator } from './calculators/RollingCalculator';
import { TrendingUp, BarChart3, FileText } from 'lucide-react';
import type { SelectedFund } from '../App';
import { getToday } from '../utils/dateUtils';

interface InvestmentTabProps {
  selectedFunds: SelectedFund[];
}

type InvestmentType = 'SIP' | 'Lumpsum' | 'SIPLumpsum';
type ViewMode = 'INPUT' | 'RESULTS' | 'GRAPHS' | 'PERFORMANCE_REPORT';

export function InvestmentTab({ selectedFunds }: InvestmentTabProps) {
  const [investmentType, setInvestmentType] = useState<InvestmentType>('SIP');
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [duration, setDuration] = useState<number>(5); // years
  const [startDate, setStartDate] = useState<string>('2020-01-01');
  const [endDate, setEndDate] = useState<string>(getToday());
  const [viewMode, setViewMode] = useState<ViewMode>('INPUT');
  const [results, setResults] = useState<any>(null);

  if (selectedFunds.length < 2) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Funds First</h3>
        <p className="text-gray-600">
          Please go to the Landing page and add at least 2 funds to your portfolio before calculating investments.
        </p>
      </Card>
    );
  }

  const handleCalculate = () => {
    // Calculate end date based on duration
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + duration);
    setEndDate(end.toISOString().split('T')[0]);
    setViewMode('RESULTS');
  };

  if (viewMode === 'GRAPHS' || viewMode === 'PERFORMANCE_REPORT') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {viewMode === 'GRAPHS' ? 'Performance Graphs' : 'Performance Report'}
            </h3>
            <p className="text-sm text-gray-600">
              {viewMode === 'GRAPHS' ? 'Visual representation of your investment performance' : 'Detailed performance analysis'}
            </p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('RESULTS')}>
            Back to Results
          </Button>
        </div>
        {viewMode === 'GRAPHS' ? (
          <Card className="p-6">
            <div className="space-y-4">
              {investmentType === 'SIP' && <SIPCalculator funds={selectedFunds} />}
              {investmentType === 'Lumpsum' && <LumpsumCalculator funds={selectedFunds} />}
              {investmentType === 'SIPLumpsum' && <SIPLumpsumCalculator funds={selectedFunds} />}
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Rolling Returns</p>
                    <p className="text-xl font-bold text-blue-700">
                      {results?.rollingReturns ? `${results.rollingReturns.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">CAGR</p>
                    <p className="text-xl font-bold text-green-700">
                      {results?.cagr ? `${results.cagr.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
                    <p className="text-xl font-bold text-purple-700">
                      {results?.profit ? `₹${results.profit.toLocaleString('en-IN')}` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                    <p className="text-xl font-bold text-orange-700">
                      {results?.totalInvested ? `₹${results.totalInvested.toLocaleString('en-IN')}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Fund-wise Performance</h4>
                <div className="space-y-2">
                  {results?.fundResults?.map((fund: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{fund.fundName}</h5>
                        <span className="text-sm text-gray-500">Weightage: {fund.weightage}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">CAGR</p>
                          <p className="font-semibold">{fund.cagr?.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Profit</p>
                          <p className="font-semibold">₹{fund.profit?.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Value</p>
                          <p className="font-semibold">₹{fund.currentValue?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  if (viewMode === 'RESULTS') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Investment Results</h3>
            <p className="text-sm text-gray-600">Your calculated investment performance</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('INPUT')}>
            Back to Input
          </Button>
        </div>
        
        {/* Results Summary */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rolling Returns</p>
              <p className="text-xl font-bold text-blue-700">Calculating...</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">CAGR</p>
              <p className="text-xl font-bold text-green-700">Calculating...</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
              <p className="text-xl font-bold text-purple-700">Calculating...</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Invested</p>
              <p className="text-xl font-bold text-orange-700">
                ₹{investmentAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </Card>

        {/* Calculator Component */}
        <Card className="p-6">
          {investmentType === 'SIP' && <SIPCalculator funds={selectedFunds} />}
          {investmentType === 'Lumpsum' && <LumpsumCalculator funds={selectedFunds} />}
          {investmentType === 'SIPLumpsum' && <SIPLumpsumCalculator funds={selectedFunds} />}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={() => setViewMode('GRAPHS')}
            className="flex-1"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            View Graphs
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setViewMode('PERFORMANCE_REPORT')}
            className="flex-1"
          >
            <FileText className="h-5 w-5 mr-2" />
            Performance Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-xl shadow-2xl p-6 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Investment Calculator</h2>
        <p className="text-purple-100">
          Calculate returns for SIP, Lumpsum, or combined investment strategies
        </p>
      </div>

      {/* Investment Type Selection */}
      <Card className="p-6">
        <Label className="text-base font-semibold mb-4 block">Investment Type</Label>
        <RadioGroup value={investmentType} onValueChange={(value) => setInvestmentType(value as InvestmentType)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setInvestmentType('SIP')}>
              <RadioGroupItem value="SIP" id="sip" />
              <Label htmlFor="sip" className="cursor-pointer font-normal flex-1">SIP (Systematic Investment Plan)</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setInvestmentType('Lumpsum')}>
              <RadioGroupItem value="Lumpsum" id="lumpsum" />
              <Label htmlFor="lumpsum" className="cursor-pointer font-normal flex-1">Lumpsum</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setInvestmentType('SIPLumpsum')}>
              <RadioGroupItem value="SIPLumpsum" id="siplumpsum" />
              <Label htmlFor="siplumpsum" className="cursor-pointer font-normal flex-1">SIP + Lumpsum</Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Investment Inputs */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">
                {investmentType === 'SIP' ? 'Monthly Investment Amount' : 'Investment Amount'}
              </Label>
              <Input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                prefix="₹"
                className="pl-8"
              />
            </div>
            <div>
              <Label htmlFor="duration">Investment Duration (Years)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                min="1"
                max="50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Calculate Button */}
      <Button size="lg" onClick={handleCalculate} className="w-full">
        <TrendingUp className="h-5 w-5 mr-2" />
        Calculate Returns
      </Button>
    </div>
  );
}

