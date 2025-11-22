import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { BucketManager } from './BucketManager';
import { SWPCalculator } from './calculators/SWPCalculator';
import { TrendingUp, Calculator, DollarSign } from 'lucide-react';
import type { SelectedFund } from '../App';
import type { Bucket } from '../types/bucket';
import { getToday } from '../utils/dateUtils';

interface RetirePlanTabProps {
  selectedFunds: SelectedFund[];
  buckets: Bucket[];
  onCreateBucket: (name: string, funds: SelectedFund[]) => void;
  onDeleteBucket: (bucketId: string) => void;
  onAddFundsToBucket: (bucketId: string, funds: SelectedFund[]) => void;
}

export function RetirePlanTab({
  selectedFunds,
  buckets,
  onCreateBucket,
  onDeleteBucket,
  onAddFundsToBucket,
}: RetirePlanTabProps) {
  const [inputMode, setInputMode] = useState<'PAYOUT' | 'INVESTMENT'>('PAYOUT');
  const [payoutAmount, setPayoutAmount] = useState<number>(50000);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000);
  const [duration, setDuration] = useState<number>(20); // years
  const [frequency, setFrequency] = useState<'Monthly' | 'Quarterly'>('Monthly');
  const [calculatedInvestment, setCalculatedInvestment] = useState<number | null>(null);
  const [calculatedPayout, setCalculatedPayout] = useState<number | null>(null);
  const [showBucketManager, setShowBucketManager] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [viewMode, setViewMode] = useState<'CALCULATE' | 'BUCKETS' | 'PERFORMANCE'>('CALCULATE');

  // Calculate required investment based on payout
  const calculateRequiredInvestment = () => {
    if (inputMode === 'PAYOUT' && payoutAmount > 0) {
      // Simplified calculation: Assuming 7% annual return and 4% withdrawal rate
      // Required corpus = Annual Payout / Withdrawal Rate
      const annualPayout = frequency === 'Monthly' ? payoutAmount * 12 : payoutAmount * 4;
      const withdrawalRate = 0.04; // 4% safe withdrawal rate
      const requiredCorpus = annualPayout / withdrawalRate;
      setCalculatedInvestment(requiredCorpus);
    }
  };

  // Calculate possible payout based on investment
  const calculatePossiblePayout = () => {
    if (inputMode === 'INVESTMENT' && investmentAmount > 0) {
      // Simplified calculation: 4% of corpus as annual payout
      const withdrawalRate = 0.04;
      const annualPayout = investmentAmount * withdrawalRate;
      const monthlyPayout = annualPayout / 12;
      const quarterlyPayout = annualPayout / 4;
      setCalculatedPayout(frequency === 'Monthly' ? monthlyPayout : quarterlyPayout);
    }
  };

  useEffect(() => {
    if (inputMode === 'PAYOUT') {
      calculateRequiredInvestment();
    } else {
      calculatePossiblePayout();
    }
  }, [inputMode, payoutAmount, investmentAmount, frequency]);

  const handleViewPerformance = (bucketId: string) => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (bucket) {
      setSelectedBucket(bucket);
      setViewMode('PERFORMANCE');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (selectedFunds.length < 2) {
    return (
      <Card className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Funds First</h3>
        <p className="text-gray-600">
          Please go to the Landing page and add at least 2 funds to your portfolio before creating a retirement plan.
        </p>
      </Card>
    );
  }

  if (viewMode === 'PERFORMANCE' && selectedBucket) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Bucket Performance: {selectedBucket.name}</h3>
            <p className="text-sm text-gray-600">Analyzing SWP performance</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('BUCKETS')}>
            Back to Buckets
          </Button>
        </div>
        <SWPCalculator funds={selectedBucket.funds} />
      </div>
    );
  }

  if (viewMode === 'BUCKETS' || showBucketManager) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">SWP Bucket Management</h3>
            <p className="text-sm text-gray-600">Create and manage your withdrawal plan buckets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setViewMode('CALCULATE');
              setShowBucketManager(false);
            }}>
              Back to Calculator
            </Button>
            <Button onClick={() => {
              setShowBucketManager(true);
              setViewMode('BUCKETS');
            }}>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate SWP
            </Button>
          </div>
        </div>
        <BucketManager
          buckets={buckets}
          onCreateBucket={onCreateBucket}
          onDeleteBucket={onDeleteBucket}
          onViewPerformance={handleViewPerformance}
          availableFunds={selectedFunds}
          onAddFundsToBucket={onAddFundsToBucket}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-teal-700 rounded-xl shadow-2xl p-6 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Retirement / Yearly Return Plan</h2>
        <p className="text-green-100">
          Calculate how much you need to invest or how much payout you can expect from your portfolio
        </p>
      </div>

      {/* Input Mode Selection */}
      <Card className="p-6">
        <Label className="text-base font-semibold mb-4 block">What would you like to calculate?</Label>
        <RadioGroup value={inputMode} onValueChange={(value) => setInputMode(value as 'PAYOUT' | 'INVESTMENT')}>
          <div className="flex items-center space-x-2 mb-4">
            <RadioGroupItem value="PAYOUT" id="payout" />
            <Label htmlFor="payout" className="cursor-pointer font-normal">
              How much payout expected? (Calculate required investment)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="INVESTMENT" id="investment" />
            <Label htmlFor="investment" className="cursor-pointer font-normal">
              How much wanted to invest? (Calculate possible payout)
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Input Form */}
      <Card className="p-6">
        <div className="space-y-4">
          {inputMode === 'PAYOUT' ? (
            <>
              <div>
                <Label htmlFor="payout-amount">Expected Payout Amount</Label>
                  <Input
                  id="payout-amount"
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                  prefix="₹"
                  className="pl-8"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(value) => setFrequency(value as 'Monthly' | 'Quarterly')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (Years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              {calculatedInvestment && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Required Investment Amount:</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(calculatedInvestment)}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="investment-amount">Investment Amount</Label>
                <Input
                  id="investment-amount"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                  prefix="₹"
                  className="pl-8"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(value) => setFrequency(value as 'Monthly' | 'Quarterly')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (Years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              {calculatedPayout && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Possible Payout Amount:</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(calculatedPayout)}</p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => {
            setViewMode('BUCKETS');
            setShowBucketManager(true);
          }}
          className="flex-1"
        >
          <DollarSign className="h-5 w-5 mr-2" />
          Create SWP Bucket
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowBucketManager(true)}
          className="flex-1"
        >
          <Calculator className="h-5 w-5 mr-2" />
          Check Buckets Performance
        </Button>
      </div>
    </div>
  );
}

