import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import type { SelectedFund } from '../../App';
import { fetchNAVData } from '../../services/navService';
import { calculateXIRR, calculateCAGR } from '../../utils/financialCalculations';
import { getNextAvailableNAV, getLatestNAVBeforeDate, getYearsBetween, addMonths } from '../../utils/dateUtils';

interface SIPLumpsumCalculatorProps {
  funds: SelectedFund[];
}

interface CalculationResult {
  totalInvested: number;
  sipInvested: number;
  lumpsumInvested: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  cagr: number;
  xirr: number;
  installments: number;
  fundResults: Array<{
    fundId: string;
    fundName: string;
    weightage: number;
    totalInvested: number;
    sipInvested: number;
    lumpsumInvested: number;
    units: number;
    currentValue: number;
    profit: number;
    profitPercentage: number;
    cagr: number;
    xirr: number;
  }>;
  chartData: Array<{
    date: string;
    invested: number;
    value: number;
    [key: string]: any;
  }>;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export function SIPLumpsumCalculator({ funds }: SIPLumpsumCalculatorProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [startDate, setStartDate] = useState<string>('2020-01-01');
  const [endDate, setEndDate] = useState<string>(getToday());
  const [minAvailableDate, setMinAvailableDate] = useState<string | null>(null);
  
  // Lumpsum specific state
  const [hasLumpsum, setHasLumpsum] = useState<boolean>(false);
  const [lumpsumAmount, setLumpsumAmount] = useState<number>(20000);
  const [lumpsumDate, setLumpsumDate] = useState<string>('');
  const [lumpsumMode, setLumpsumMode] = useState<'weightage' | 'specific'>('weightage');
  const [selectedFundForLumpsum, setSelectedFundForLumpsum] = useState<string>('');
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funds.length > 0) {
      const launchDates = funds
        .map(f => new Date(f.launchDate))
        .filter(date => !isNaN(date.getTime()));
      
      if (launchDates.length > 0) {
        const latestLaunchDate = new Date(Math.max(...launchDates.map(d => d.getTime())));
        const formattedDate = latestLaunchDate.toISOString().split('T')[0];
        setMinAvailableDate(formattedDate);
        
        if (new Date(startDate) < latestLaunchDate) {
          setStartDate(formattedDate);
        }
        
        // Set default lumpsum date to midpoint if not set
        if (!lumpsumDate && startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const midpoint = new Date((start.getTime() + end.getTime()) / 2);
          setLumpsumDate(midpoint.toISOString().split('T')[0]);
        }
      }
      
      // Set default fund for lumpsum
      if (!selectedFundForLumpsum && funds.length > 0) {
        setSelectedFundForLumpsum(funds[0].id);
      }
    } else {
      setMinAvailableDate(null);
    }
  }, [funds]);

  const calculateSIPLumpsum = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate lumpsum date if lumpsum is enabled
      if (hasLumpsum) {
        const lumpDate = new Date(lumpsumDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (lumpDate < start || lumpDate > end) {
          throw new Error("Lumpsum date must be between SIP start and end dates");
        }
      }

      const fundSchemeCodes = funds.map(f => f.id);
      console.log('Fetching NAV data for funds:', fundSchemeCodes);
      console.log('Date range:', startDate, 'to', endDate);
      
      const navResponses = await fetchNAVData(fundSchemeCodes, startDate, endDate);
      console.log('NAV Responses received:', navResponses);

      if (navResponses.length === 0) {
        throw new Error("No NAV data available for the selected funds in the given period.");
      }

      // Generate SIP dates
      const actualSIPDates: Array<{plannedDate: string, actualDate: string}> = [];
      let currentPlannedDate = startDate;
      const end = new Date(endDate);

      let loopCount = 0;
      while (true) {
        loopCount++;
        const plannedDateObj = new Date(currentPlannedDate);
        
        const daysFromEnd = Math.ceil((plannedDateObj.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
        if (plannedDateObj.getTime() > end.getTime() + (32 * 24 * 60 * 60 * 1000)) {
          console.log(`[SIP Loop] STOPPED - Planned date too far: ${currentPlannedDate} (${daysFromEnd} days from end)`);
          break;
        }

        const firstFundNav = navResponses[0];
        let navEntry = getNextAvailableNAV(firstFundNav.navData, currentPlannedDate);
        
        if (!navEntry) {
          const plannedYear = plannedDateObj.getFullYear();
          const plannedMonth = plannedDateObj.getMonth();
          const endYear = end.getFullYear();
          const endMonth = end.getMonth();
          
          if (plannedYear === endYear && plannedMonth === endMonth) {
            const firstDayOfMonth = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;
            navEntry = getNextAvailableNAV(firstFundNav.navData, firstDayOfMonth);
          }
        }
        
        if (navEntry) {
          const actualInvestmentDate = new Date(navEntry.date);
          const daysDiff = Math.ceil((actualInvestmentDate.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
          
          const plannedYear = plannedDateObj.getFullYear();
          const plannedMonth = plannedDateObj.getMonth();
          const endYear = end.getFullYear();
          const endMonth = end.getMonth();
          
          const isPlannedBeforeOrSameMonth = 
            (plannedYear < endYear) || 
            (plannedYear === endYear && plannedMonth <= endMonth);
          
          const shouldInclude = 
            isPlannedBeforeOrSameMonth || 
            (daysDiff >= 0 && daysDiff <= 7);
          
          if (shouldInclude) {
            actualSIPDates.push({
              plannedDate: currentPlannedDate,
              actualDate: navEntry.date
            });
            
            const actualDateObj = new Date(navEntry.date);
            const actualYear = actualDateObj.getFullYear();
            const actualMonth = actualDateObj.getMonth();
            
            if (actualYear === endYear && actualMonth === endMonth) {
              break;
            }
            
            currentPlannedDate = addMonths(currentPlannedDate, 1);
          } else {
            break;
          }
        } else {
          currentPlannedDate = addMonths(currentPlannedDate, 1);
        }
      }

      console.log('SIP Dates generated:', actualSIPDates.length, 'months');
      
      const totalSIPInvested = monthlyInvestment * actualSIPDates.length;
      const totalLumpsumInvested = hasLumpsum ? lumpsumAmount : 0;
      const totalInvested = totalSIPInvested + totalLumpsumInvested;

      // Calculate for each fund
      const fundResults = funds.map(fund => {
        const navData = navResponses.find(nav => nav.schemeCode === fund.id);
        
        if (!navData) {
          throw new Error(`No NAV data found for fund: ${fund.name} (${fund.id})`);
        }
        
        if (navData.navData.length === 0) {
          throw new Error(`NAV data is empty for fund: ${fund.name}.`);
        }

        let totalUnits = 0;
        let sipInvested = 0;
        let lumpsumInvested = 0;
        const investmentData: Array<{
          date: string;
          invested: number;
          units: number;
          nav: number;
          value: number;
          type: 'sip' | 'lumpsum';
        }> = [];

        // Process SIP investments
        actualSIPDates.forEach(({ plannedDate, actualDate }) => {
          const navEntry = getNextAvailableNAV(navData.navData, plannedDate);
          
          if (navEntry && navEntry.nav > 0) {
            const monthlyAmount = monthlyInvestment * (fund.weightage / 100);
            const unitsPurchased = monthlyAmount / navEntry.nav;
            totalUnits += unitsPurchased;
            sipInvested += monthlyAmount;
            
            investmentData.push({
              date: navEntry.date,
              invested: sipInvested + lumpsumInvested,
              units: totalUnits,
              nav: navEntry.nav,
              value: totalUnits * navEntry.nav,
              type: 'sip'
            });
          }
        });

        // Process Lumpsum investment
        if (hasLumpsum) {
          const navEntry = getNextAvailableNAV(navData.navData, lumpsumDate);
          
          if (navEntry && navEntry.nav > 0) {
            let lumpsumForThisFund = 0;
            
            if (lumpsumMode === 'weightage') {
              // Distribute by weightage
              lumpsumForThisFund = lumpsumAmount * (fund.weightage / 100);
            } else if (lumpsumMode === 'specific' && fund.id === selectedFundForLumpsum) {
              // Invest entirely in selected fund
              lumpsumForThisFund = lumpsumAmount;
            }
            
            if (lumpsumForThisFund > 0) {
              const unitsPurchased = lumpsumForThisFund / navEntry.nav;
              totalUnits += unitsPurchased;
              lumpsumInvested = lumpsumForThisFund;
              
              // Update or add investment record for lumpsum date
              const existingIndex = investmentData.findIndex(d => d.date === navEntry.date);
              if (existingIndex >= 0) {
                investmentData[existingIndex].units = totalUnits;
                investmentData[existingIndex].invested += lumpsumForThisFund;
                investmentData[existingIndex].value = totalUnits * navEntry.nav;
              } else {
                investmentData.push({
                  date: navEntry.date,
                  invested: sipInvested + lumpsumInvested,
                  units: totalUnits,
                  nav: navEntry.nav,
                  value: totalUnits * navEntry.nav,
                  type: 'lumpsum'
                });
              }
            }
          }
        }

        // Sort by date
        investmentData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const fundInvested = sipInvested + lumpsumInvested;
        const finalNavEntry = getLatestNAVBeforeDate(navData.navData, endDate);
        const currentValue = totalUnits * (finalNavEntry?.nav || 0);
        const profit = currentValue - fundInvested;
        const profitPercentage = fundInvested > 0 ? (profit / fundInvested) * 100 : 0;
        
        const years = getYearsBetween(startDate, endDate);
        const cagr = calculateCAGR(fundInvested, currentValue, years);
        
        // Calculate XIRR for individual fund
        const fundCashFlows = [
          ...actualSIPDates.map(({ actualDate }) => ({
            date: new Date(actualDate),
            amount: -(monthlyInvestment * (fund.weightage / 100))
          })),
        ];
        
        // Add lumpsum cashflow if applicable
        if (hasLumpsum) {
          const navEntry = getNextAvailableNAV(navData.navData, lumpsumDate);
          if (navEntry) {
            let lumpsumForThisFund = 0;
            if (lumpsumMode === 'weightage') {
              lumpsumForThisFund = lumpsumAmount * (fund.weightage / 100);
            } else if (lumpsumMode === 'specific' && fund.id === selectedFundForLumpsum) {
              lumpsumForThisFund = lumpsumAmount;
            }
            
            if (lumpsumForThisFund > 0) {
              fundCashFlows.push({
                date: new Date(navEntry.date),
                amount: -lumpsumForThisFund
              });
            }
          }
        }
        
        fundCashFlows.push({
          date: new Date(endDate),
          amount: currentValue
        });
        
        // Sort cashflows by date
        fundCashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const fundXIRR = calculateXIRR(fundCashFlows);

        return {
          fundId: fund.id,
          fundName: fund.name,
          weightage: fund.weightage,
          totalInvested: fundInvested,
          sipInvested,
          lumpsumInvested,
          units: totalUnits,
          currentValue,
          profit,
          profitPercentage,
          cagr,
          xirr: fundXIRR,
          investmentData
        };
      });

      // Calculate portfolio-level metrics
      const portfolioInvested = fundResults.reduce((sum, fund) => sum + fund.totalInvested, 0);
      const portfolioValue = fundResults.reduce((sum, fund) => sum + fund.currentValue, 0);
      const portfolioProfit = portfolioValue - portfolioInvested;
      const portfolioProfitPercentage = portfolioInvested > 0 ? (portfolioProfit / portfolioInvested) * 100 : 0;
      
      const years = getYearsBetween(startDate, endDate);
      const portfolioCAGR = calculateCAGR(portfolioInvested, portfolioValue, years);

      // Calculate portfolio XIRR
      const cashFlows = [
        ...actualSIPDates.map(({ actualDate }) => ({
          date: new Date(actualDate),
          amount: -monthlyInvestment
        })),
      ];
      
      // Add lumpsum cashflow
      if (hasLumpsum) {
        const firstFundNav = navResponses[0];
        const navEntry = getNextAvailableNAV(firstFundNav.navData, lumpsumDate);
        if (navEntry) {
          cashFlows.push({
            date: new Date(navEntry.date),
            amount: -lumpsumAmount
          });
        }
      }
      
      cashFlows.push({
        date: new Date(endDate),
        amount: portfolioValue
      });
      
      // Sort cashflows by date
      cashFlows.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      const xirr = calculateXIRR(cashFlows);

      // Generate chart data
      const fundUnitTracking = new Map<string, Array<{date: string, units: number, invested: number, nav: number}>>();
      
      funds.forEach(fund => {
        fundUnitTracking.set(fund.id, []);
      });

      // Track SIP investments
      actualSIPDates.forEach(({ plannedDate, actualDate }, index) => {
        funds.forEach(fund => {
          const navData = navResponses.find(nav => nav.schemeCode === fund.id);
          if (navData) {
            let navEntry = getNextAvailableNAV(navData.navData, plannedDate);
            
            if (!navEntry) {
              navEntry = getNextAvailableNAV(navData.navData, actualDate);
            }
            
            if (navEntry) {
              const fundMonthlyAmount = monthlyInvestment * (fund.weightage / 100);
              const unitsPurchased = fundMonthlyAmount / navEntry.nav;
              
              const prevData = fundUnitTracking.get(fund.id)!;
              const prevUnits = prevData.length > 0 ? prevData[prevData.length - 1].units : 0;
              const prevInvested = prevData.length > 0 ? prevData[prevData.length - 1].invested : 0;
              
              prevData.push({
                date: actualDate,
                units: prevUnits + unitsPurchased,
                invested: prevInvested + fundMonthlyAmount,
                nav: navEntry.nav
              });
            }
          }
        });
      });

      // Add lumpsum to unit tracking
      if (hasLumpsum) {
        funds.forEach(fund => {
          const navData = navResponses.find(nav => nav.schemeCode === fund.id);
          if (navData) {
            const navEntry = getNextAvailableNAV(navData.navData, lumpsumDate);
            if (navEntry) {
              let lumpsumForThisFund = 0;
              if (lumpsumMode === 'weightage') {
                lumpsumForThisFund = lumpsumAmount * (fund.weightage / 100);
              } else if (lumpsumMode === 'specific' && fund.id === selectedFundForLumpsum) {
                lumpsumForThisFund = lumpsumAmount;
              }
              
              if (lumpsumForThisFund > 0) {
                const unitsPurchased = lumpsumForThisFund / navEntry.nav;
                const trackingData = fundUnitTracking.get(fund.id)!;
                
                // Find the appropriate place to insert or update
                const lumpsumDateObj = new Date(navEntry.date);
                let insertIndex = trackingData.findIndex(d => new Date(d.date) >= lumpsumDateObj);
                
                if (insertIndex === -1) {
                  // Add at the end
                  const prevData = trackingData[trackingData.length - 1] || { units: 0, invested: 0 };
                  trackingData.push({
                    date: navEntry.date,
                    units: prevData.units + unitsPurchased,
                    invested: prevData.invested + lumpsumForThisFund,
                    nav: navEntry.nav
                  });
                } else if (trackingData[insertIndex].date === navEntry.date) {
                  // Same date as SIP, update
                  trackingData[insertIndex].units += unitsPurchased;
                  trackingData[insertIndex].invested += lumpsumForThisFund;
                } else {
                  // Insert before
                  const prevData = insertIndex > 0 ? trackingData[insertIndex - 1] : { units: 0, invested: 0 };
                  trackingData.splice(insertIndex, 0, {
                    date: navEntry.date,
                    units: prevData.units + unitsPurchased,
                    invested: prevData.invested + lumpsumForThisFund,
                    nav: navEntry.nav
                  });
                  
                  // Update all subsequent entries
                  for (let i = insertIndex + 1; i < trackingData.length; i++) {
                    trackingData[i].units += unitsPurchased;
                    trackingData[i].invested += lumpsumForThisFund;
                  }
                }
              }
            }
          }
        });
      }

      // Generate chart data
      const chartData = actualSIPDates.map(({ actualDate }, index) => {
        const monthNumber = index + 1;
        const cumulativeSIPInvested = monthlyInvestment * monthNumber;
        
        // Add lumpsum if it's before or on this date
        let cumulativeInvested = cumulativeSIPInvested;
        if (hasLumpsum && new Date(lumpsumDate) <= new Date(actualDate)) {
          cumulativeInvested += lumpsumAmount;
        }
        
        const dateObj = new Date(actualDate);
        const dataPoint: any = {
          date: dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          fullDate: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          invested: cumulativeInvested,
        };

        let bucketValue = 0;

        funds.forEach(fund => {
          const unitData = fundUnitTracking.get(fund.id);
          
          if (unitData && unitData[index]) {
            const currentNav = unitData[index].nav;
            const fundValue = unitData[index].units * currentNav;
            
            dataPoint[fund.name] = fundValue;
            bucketValue += fundValue;
          }
        });

        dataPoint['Bucket Performance'] = bucketValue;

        return dataPoint;
      });

      setResult({
        totalInvested,
        sipInvested: totalSIPInvested,
        lumpsumInvested: totalLumpsumInvested,
        currentValue: portfolioValue,
        profit: portfolioProfit,
        profitPercentage: portfolioProfitPercentage,
        cagr: portfolioCAGR,
        xirr,
        installments: actualSIPDates.length,
        fundResults: fundResults.map(f => ({
          fundId: f.fundId,
          fundName: f.fundName,
          weightage: f.weightage,
          totalInvested: f.totalInvested,
          sipInvested: f.sipInvested,
          lumpsumInvested: f.lumpsumInvested,
          units: f.units,
          currentValue: f.currentValue,
          profit: f.profit,
          profitPercentage: f.profitPercentage,
          cagr: f.cagr,
          xirr: f.xirr
        })),
        chartData
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during calculation.");
      setIsLoading(false);
    }
  };

  const isValidAllocation = funds.reduce((sum, fund) => sum + fund.weightage, 0) === 100;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">SIP + Lumpsum Calculator</h2>
        
        {/* SIP Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-slate-700">SIP Investment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthly-investment">Monthly Investment (₹)</Label>
              <Input
                id="monthly-investment"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                placeholder="10000"
                min="100"
              />
            </div>
            
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={minAvailableDate || undefined}
              />
              {minAvailableDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Earliest: {new Date(minAvailableDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={getToday()}
              />
            </div>
          </div>
        </div>

        {/* Lumpsum Configuration */}
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-slate-700">Lumpsum Investment (Optional)</h3>
            <Button
              onClick={() => setHasLumpsum(!hasLumpsum)}
              variant={hasLumpsum ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {hasLumpsum ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {hasLumpsum ? 'Remove Lumpsum' : 'Add Lumpsum'}
            </Button>
          </div>
          
          {hasLumpsum && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lumpsum-amount">Lumpsum Amount (₹)</Label>
                  <Input
                    id="lumpsum-amount"
                    type="number"
                    value={lumpsumAmount}
                    onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                    placeholder="20000"
                    min="1000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lumpsum-date">Investment Date</Label>
                  <Input
                    id="lumpsum-date"
                    type="date"
                    value={lumpsumDate}
                    onChange={(e) => setLumpsumDate(e.target.value)}
                    min={startDate}
                    max={endDate}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be between SIP start and end dates
                  </p>
                </div>
              </div>

              <div>
                <Label>Investment Mode</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lumpsum-mode"
                      value="weightage"
                      checked={lumpsumMode === 'weightage'}
                      onChange={(e) => setLumpsumMode('weightage')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Distribute by Weightage</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lumpsum-mode"
                      value="specific"
                      checked={lumpsumMode === 'specific'}
                      onChange={(e) => setLumpsumMode('specific')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Invest in Specific Fund</span>
                  </label>
                </div>
              </div>

              {lumpsumMode === 'specific' && (
                <div>
                  <Label htmlFor="selected-fund">Select Fund</Label>
                  <select
                    id="selected-fund"
                    value={selectedFundForLumpsum}
                    onChange={(e) => setSelectedFundForLumpsum(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <Button 
          onClick={calculateSIPLumpsum}
          disabled={!isValidAllocation || isLoading || funds.length === 0}
          className="w-full"
        >
          {isLoading ? 'Calculating...' : 'Calculate SIP + Lumpsum'}
        </Button>

        {!isValidAllocation && (
          <p className="text-red-600 text-sm mt-2">
            Please ensure portfolio allocation totals 100%
          </p>
        )}
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {result && (
        <>
          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Total Invested</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(result.totalInvested)}</div>
              <div className="text-xs text-blue-600 mt-2 flex flex-col gap-0.5">
                <span>SIP: {formatCurrency(result.sipInvested)}</span>
                {hasLumpsum && <span>Lumpsum: {formatCurrency(result.lumpsumInvested)}</span>}
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Current Value</div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(result.currentValue)}</div>
              <div className="text-xs text-indigo-600 mt-2">Portfolio worth</div>
            </Card>

            <Card className={`p-5 border-2 shadow-lg hover:shadow-xl transition-shadow ${
              result.profit >= 0 
                ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' 
                : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'
            }`}>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                result.profit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>Profit/Loss</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${
                result.profit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.profit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {formatCurrency(result.profit)}
              </div>
              <div className={`text-xs mt-2 ${
                result.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.profitPercentage >= 0 ? '+' : ''}{result.profitPercentage.toFixed(2)}% returns
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">CAGR</div>
              <div className={`text-2xl font-bold ${
                result.cagr >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.cagr >= 0 ? '+' : ''}{result.cagr.toFixed(2)}%
              </div>
              <div className="text-xs text-amber-600 mt-2">Annualized return</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">XIRR</div>
              <div className={`text-2xl font-bold ${
                result.xirr >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.xirr >= 0 ? '+' : ''}{result.xirr.toFixed(2)}%
              </div>
              <div className="text-xs text-purple-600 mt-2">Internal rate</div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-1">SIP Count</div>
              <div className="text-2xl font-bold text-slate-900">{result.installments}</div>
              <div className="text-xs text-pink-600 mt-2">Installments</div>
            </Card>
          </div>

          {/* Chart */}
          <Card className="p-6 border-2 border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Performance Over Time</h3>
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                {result.chartData.length} data points
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={result.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `Investment Date: ${payload[0].payload.fullDate}`;
                    }
                    return label;
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                {/* @ts-ignore */}
                <RechartsLegend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                
                {/* Bucket Performance Line (Bold) */}
                <Line 
                  type="monotone" 
                  dataKey="Bucket Performance" 
                  stroke="#1f2937" 
                  strokeWidth={3}
                  name="Bucket Performance"
                  dot={false}
                />
                
                {/* Individual Fund Lines */}
                {result.fundResults.map((fund, index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  return (
                    <Line 
                      key={fund.fundId}
                      type="monotone" 
                      dataKey={fund.fundName} 
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      name={fund.fundName}
                      dot={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Fund Details Table */}
          <Card className="p-6 border-2 border-slate-200 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Individual Fund Performance</h3>
              <p className="text-sm text-slate-600">Detailed breakdown of each fund's contribution</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>Total Invested</TableHead>
                  <TableHead>SIP Invested</TableHead>
                  <TableHead>Lumpsum Invested</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Profit/Loss</TableHead>
                  <TableHead>% Returns</TableHead>
                  <TableHead>CAGR</TableHead>
                  <TableHead>XIRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.fundResults.map((fund, index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  const fundColor = colors[index % colors.length];
                  
                  return (
                    <TableRow key={fund.fundId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: fundColor }}
                          />
                          {fund.fundName}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(fund.totalInvested)}</TableCell>
                      <TableCell className="text-gray-600">{formatCurrency(fund.sipInvested)}</TableCell>
                      <TableCell className="text-gray-600">{formatCurrency(fund.lumpsumInvested)}</TableCell>
                      <TableCell>{formatCurrency(fund.currentValue)}</TableCell>
                      <TableCell className={fund.profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {fund.profit >= 0 ? '+' : ''}{formatCurrency(fund.profit)}
                      </TableCell>
                      <TableCell className={fund.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {fund.profitPercentage >= 0 ? '+' : ''}{fund.profitPercentage.toFixed(2)}%
                      </TableCell>
                      <TableCell className={fund.cagr >= 0 ? 'text-black' : 'text-red-600'}>
                        {fund.cagr.toFixed(2)}%
                      </TableCell>
                      <TableCell className={fund.xirr >= 0 ? 'text-black' : 'text-red-600'}>
                        {fund.xirr.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

