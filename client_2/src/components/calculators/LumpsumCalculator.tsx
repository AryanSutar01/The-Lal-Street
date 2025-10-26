import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { SelectedFund } from '../../App';
import { fetchNAVData } from '../../services/navService';
import { getNextAvailableNAV, getLatestNAVBeforeDate } from '../../utils/dateUtils';
import { calculateCAGR as calcCAGR } from '../../utils/financialCalculations';

interface LumpsumCalculatorProps {
  funds: SelectedFund[];
}

interface FundPerformance {
  fundId: string;
  fundName: string;
  investment: number;
  unitsPurchased: number;
  startNAV: number;
  endNAV: number;
  currentValue: number;
  profitLoss: number;
  percentReturns: number;
  cagr: number;
}

interface BucketPerformance {
  totalInvestment: number;
  currentValue: number;
  absoluteProfit: number;
  absoluteProfitPercent: number;
  cagr: number;
  years: number;
}

// Helper to get today's date
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export function LumpsumCalculator({ funds }: LumpsumCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [startDate, setStartDate] = useState<string>('2020-01-01');
  const [endDate, setEndDate] = useState<string>(getToday());
  const [minAvailableDate, setMinAvailableDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    bucketPerformance: BucketPerformance;
    fundPerformances: FundPerformance[];
  } | null>(null);

  // Update minAvailableDate when funds change
  useEffect(() => {
    if (funds.length > 0) {
      const latestLaunchDate = funds.reduce((latest, fund) => {
        const fundLaunchDate = new Date(fund.launchDate);
        return fundLaunchDate > latest ? fundLaunchDate : latest;
      }, new Date(funds[0].launchDate));
      
      const minDate = latestLaunchDate.toISOString().split('T')[0];
      setMinAvailableDate(minDate);
      
      if (new Date(startDate) < latestLaunchDate) {
        setStartDate(minDate);
      }
    } else {
      setMinAvailableDate(null);
    }
  }, [funds]);

  const calculateLumpsum = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate dates
      if (start >= end) {
        throw new Error("Start date must be before end date");
      }
      
      // Calculate years
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      // Fetch real NAV data
      const fundSchemeCodes = funds.map(f => f.id);
      console.log('[Lumpsum] Fetching NAV data for funds:', fundSchemeCodes);
      console.log('[Lumpsum] Date range:', startDate, 'to', endDate);
      
      const navResponses = await fetchNAVData(fundSchemeCodes, startDate, endDate);
      
      if (navResponses.length === 0) {
        throw new Error("No NAV data available for the selected funds in the given period.");
      }
      
      console.log('[Lumpsum] NAV Responses received:', navResponses.length, 'funds');
      
      // Calculate lumpsum for each fund
      const fundPerformances: FundPerformance[] = [];
      let totalBucketValue = 0;
      
      for (const fund of funds) {
        const navResponse = navResponses.find(nav => nav.schemeCode === fund.id);
        
        if (!navResponse) {
          console.error(`[Lumpsum] No NAV data found for fund: ${fund.id}`);
          throw new Error(`No NAV data available for ${fund.name}`);
        }
        
        // Step 2: Allocation of Investment
        // I_i = P × w_i
        const fundInvestment = (investmentAmount * fund.weightage) / 100;
        
        // Step 3: Get NAVs at start and end dates (with fallback for holidays)
        const startNavEntry = getNextAvailableNAV(navResponse.navData, startDate);
        const endNavEntry = getLatestNAVBeforeDate(navResponse.navData, endDate);
        
        if (!startNavEntry || !endNavEntry) {
          throw new Error(`NAV data not available for ${fund.name} in the selected date range`);
        }
        
        const startNAV = startNavEntry.nav;
        const endNAV = endNavEntry.nav;
        
        console.log(`[Lumpsum] ${fund.name}: Start NAV (${startNavEntry.date}) = ${startNAV}, End NAV (${endNavEntry.date}) = ${endNAV}`);
        
        // Step 4: Units Purchased
        // U_i = I_i / NAV_{i,start}
        const unitsPurchased = startNAV > 0 ? fundInvestment / startNAV : 0;
        
        // Step 5: Portfolio Value at End Date
        // V_i = U_i × NAV_{i,end}
        const currentValue = unitsPurchased * endNAV;
        
        const profitLoss = currentValue - fundInvestment;
        const percentReturns = fundInvestment > 0 ? (profitLoss / fundInvestment) * 100 : 0;
        
        // Step 6: Annualized Return (CAGR)
        // CAGR = ((V_total/P)^(1/n)) - 1
        const cagr = calcCAGR(fundInvestment, currentValue, years);
        
        fundPerformances.push({
          fundId: fund.id,
          fundName: fund.name,
          investment: fundInvestment,
          unitsPurchased,
          startNAV,
          endNAV,
          currentValue,
          profitLoss,
          percentReturns,
          cagr
        });
        
        totalBucketValue += currentValue;
      }
      
      // Calculate bucket performance
      const absoluteProfit = totalBucketValue - investmentAmount;
      const absoluteProfitPercent = (absoluteProfit / investmentAmount) * 100;
      const bucketCAGR = calcCAGR(investmentAmount, totalBucketValue, years);
      
      const bucketPerformance: BucketPerformance = {
        totalInvestment: investmentAmount,
        currentValue: totalBucketValue,
        absoluteProfit,
        absoluteProfitPercent,
        cagr: bucketCAGR,
        years
      };
      
      console.log('[Lumpsum] Calculation complete:', {
        investment: investmentAmount,
        currentValue: totalBucketValue,
        profit: absoluteProfit,
        cagr: bucketCAGR.toFixed(2) + '%'
      });
      
      setResult({
        bucketPerformance,
        fundPerformances
      });
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('[Lumpsum] Calculation error:', err);
      setError(err.message || "An unexpected error occurred during calculation.");
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const getChartData = () => {
    if (!result) return [];
    
    return result.fundPerformances.map(perf => ({
      name: perf.fundName,
      investment: perf.investment,
      currentValue: perf.currentValue,
      profit: perf.profitLoss
    }));
  };

  const chartData = getChartData();
  
  // Define colors for funds
  const fundColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 mb-1">Lumpsum Calculator</h2>
            <p className="text-sm text-slate-600">Calculate returns on one-time investment</p>
          </div>
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            {funds.length} {funds.length === 1 ? 'Fund' : 'Funds'} Selected
          </Badge>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="investment-amount">Total Investment (₹)</Label>
            <Input
              id="investment-amount"
              type="number"
              min="1000"
              step="1000"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minAvailableDate || undefined}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
            {minAvailableDate && (
              <p className="text-xs text-gray-500 mt-1">
                Earliest available: {new Date(minAvailableDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              max={getToday()}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={calculateLumpsum}
              disabled={isLoading || funds.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Calculating...' : 'Calculate'}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200 mb-6">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Total Investment</div>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{result.bucketPerformance.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-blue-600 mt-2">One-time lumpsum</div>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Current Bucket Value</div>
                <div className="text-2xl font-bold text-slate-900">
                  ₹{result.bucketPerformance.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-indigo-600 mt-2">Portfolio worth</div>
              </Card>

              <Card className={`p-5 border-2 shadow-lg hover:shadow-xl transition-shadow ${result.bucketPerformance.absoluteProfit >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'}`}>
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${result.bucketPerformance.absoluteProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>Absolute Profit</div>
                <div className={`text-2xl font-bold flex items-center gap-2 ${result.bucketPerformance.absoluteProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {result.bucketPerformance.absoluteProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {result.bucketPerformance.absoluteProfitPercent.toFixed(2)}%
                </div>
                <div className={`text-xs mt-2 ${result.bucketPerformance.absoluteProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.bucketPerformance.absoluteProfit >= 0 ? '+' : ''}₹{Math.abs(result.bucketPerformance.absoluteProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">CAGR</div>
                <div className={`text-2xl font-bold ${result.bucketPerformance.cagr >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {result.bucketPerformance.cagr >= 0 ? '+' : ''}{result.bucketPerformance.cagr.toFixed(2)}%
                </div>
                <div className="text-xs text-purple-600 mt-2">
                  Over {result.bucketPerformance.years.toFixed(1)} years
                </div>
              </Card>
            </div>

            {/* Fund Performance Table */}
            <Card className="border-2 border-slate-200 shadow-xl">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Fund-wise Performance</h3>
                  <p className="text-sm text-slate-600">Detailed breakdown of each fund's contribution to your portfolio</p>
                </div>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-slate-700">Fund Name</TableHead>
                        <TableHead className="text-slate-700 text-right">Investment</TableHead>
                        <TableHead className="text-slate-700 text-right">Units Purchased</TableHead>
                        <TableHead className="text-slate-700 text-right">Start NAV</TableHead>
                        <TableHead className="text-slate-700 text-right">End NAV</TableHead>
                        <TableHead className="text-slate-700 text-right">Current Value</TableHead>
                        <TableHead className="text-slate-700 text-right">Profit/Loss</TableHead>
                        <TableHead className="text-slate-700 text-right">Returns %</TableHead>
                        <TableHead className="text-slate-700 text-right">CAGR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.fundPerformances.map((perf, index) => (
                        <TableRow key={perf.fundId} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: fundColors[index % fundColors.length] }}
                              />
                              <span className="text-slate-900">{perf.fundName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            ₹{perf.investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            {perf.unitsPurchased.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            ₹{perf.startNAV.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            ₹{perf.endNAV.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            ₹{perf.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className={`text-right ${perf.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {perf.profitLoss >= 0 ? '+' : ''}₹{perf.profitLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className={`text-right ${perf.percentReturns >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {perf.percentReturns >= 0 ? '+' : ''}{perf.percentReturns.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-slate-900">
                            {perf.cagr.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Bucket Total Row */}
                      <TableRow className="bg-blue-50 hover:bg-blue-100 font-medium">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-900" />
                            <span className="text-slate-900">Bucket Total</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-slate-900">
                          ₹{result.bucketPerformance.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">—</TableCell>
                        <TableCell className="text-right text-slate-600">—</TableCell>
                        <TableCell className="text-right text-slate-600">—</TableCell>
                        <TableCell className="text-right text-slate-900">
                          ₹{result.bucketPerformance.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className={`text-right ${result.bucketPerformance.absoluteProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {result.bucketPerformance.absoluteProfit >= 0 ? '+' : ''}₹{result.bucketPerformance.absoluteProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className={`text-right ${result.bucketPerformance.absoluteProfitPercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {result.bucketPerformance.absoluteProfitPercent >= 0 ? '+' : ''}{result.bucketPerformance.absoluteProfitPercent.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-slate-900">
                          {result.bucketPerformance.cagr.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>

            {/* Performance Chart */}
            <Card className="p-6 border-2 border-slate-200 shadow-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Investment vs Current Value Comparison</h3>
                <p className="text-sm text-slate-600">Visual representation of your portfolio growth</p>
              </div>
              <div className="max-w-4xl mx-auto">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis 
                      type="number"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      width={150}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value: any) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="investment" fill="#94a3b8" name="Investment" radius={[0, 8, 8, 0]} barSize={20} />
                    <Bar dataKey="currentValue" name="Current Value" radius={[0, 8, 8, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={fundColors[index % fundColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Growth Indicator */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {result.fundPerformances.map((perf, index) => (
                    <div key={perf.fundId} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: fundColors[index % fundColors.length] }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-slate-600 truncate">{perf.fundName}</div>
                        <div className={`text-sm ${perf.percentReturns >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {perf.percentReturns >= 0 ? '+' : ''}{perf.percentReturns.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-slate-900 mb-2">Ready to Calculate</h3>
            <p className="text-slate-600">Enter investment details and click Calculate to see lumpsum performance</p>
          </div>
        )}
      </div>
    </Card>
  );
}
