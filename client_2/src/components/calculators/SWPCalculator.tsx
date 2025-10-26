import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { SelectedFund } from '../../App';

interface SWPCalculatorProps {
  funds: SelectedFund[];
}

export function SWPCalculator({ funds }: SWPCalculatorProps) {
  const [totalInvestment, setTotalInvestment] = useState<number>(1000000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<number>(10000);
  const [duration, setDuration] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(10);
  const [result, setResult] = useState<any>(null);

  const calculateSWP = () => {
    const months = duration * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    
    let balance = totalInvestment;
    let totalWithdrawn = 0;
    
    for (let i = 0; i < months; i++) {
      // Add returns
      balance = balance * (1 + monthlyRate);
      // Withdraw
      balance -= monthlyWithdrawal;
      totalWithdrawn += monthlyWithdrawal;
      
      if (balance < 0) {
        balance = 0;
        break;
      }
    }
    
    const finalValue = Math.max(0, balance);
    const totalReturns = (finalValue + totalWithdrawn) - totalInvestment;
    
    setResult({
      finalValue,
      totalWithdrawn,
      totalReturns,
      sustainabilityMonths: balance > 0 ? months : Math.floor(totalInvestment / monthlyWithdrawal)
    });
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 mb-1">SWP Calculator</h2>
            <p className="text-sm text-slate-600">Calculate systematic withdrawal plan outcomes</p>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            {funds.length} {funds.length === 1 ? 'Fund' : 'Funds'} Selected
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="total-investment">Total Investment (₹)</Label>
              <Input
                id="total-investment"
                type="number"
                min="10000"
                step="10000"
                value={totalInvestment}
                onChange={(e) => setTotalInvestment(parseFloat(e.target.value) || 0)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-withdrawal">Monthly Withdrawal (₹)</Label>
              <Input
                id="monthly-withdrawal"
                type="number"
                min="1000"
                step="1000"
                value={monthlyWithdrawal}
                onChange={(e) => setMonthlyWithdrawal(parseFloat(e.target.value) || 0)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Withdrawal Duration (Years)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="40"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-return">Expected Annual Return (%)</Label>
              <Input
                id="expected-return"
                type="number"
                min="1"
                max="30"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(parseFloat(e.target.value) || 0)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button 
              onClick={calculateSWP}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Calculate Withdrawals
            </Button>
          </div>

          {/* Results Section */}
          <div>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="text-sm text-slate-600 mb-1">Final Portfolio Value</div>
                  <div className="text-3xl text-slate-900">
                    ₹{result.finalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Total Withdrawn</div>
                    <div className="text-xl text-slate-900">
                      ₹{result.totalWithdrawn.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${result.totalReturns >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-sm mb-1 ${result.totalReturns >= 0 ? 'text-green-700' : 'text-red-700'}`}>Net Returns</div>
                    <div className={`text-xl ${result.totalReturns >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      ₹{result.totalReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-sm text-amber-800 mb-1">Sustainability</div>
                  <div className="text-xl text-amber-800">
                    {result.sustainabilityMonths} months ({(result.sustainabilityMonths / 12).toFixed(1)} years)
                  </div>
                  {result.finalValue === 0 && (
                    <div className="text-xs text-amber-700 mt-1">
                      ⚠️ Portfolio depleted before withdrawal period ends
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                  <div className="text-sm text-indigo-800 mb-1">Initial Investment</div>
                  <div className="text-xl text-indigo-800">
                    ₹{totalInvestment.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Fund Breakdown */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600 mb-3">Portfolio Allocation</div>
                  <div className="space-y-2">
                    {funds.map(fund => (
                      <div key={fund.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700">{fund.name}</span>
                        <span className="text-slate-900">
                          {fund.weightage.toFixed(1)}% • ₹{((totalInvestment * fund.weightage) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-600">Enter values and click Calculate to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
