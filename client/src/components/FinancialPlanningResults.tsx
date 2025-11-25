import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, CheckCircle2, TrendingUp, Shield, Heart, DollarSign } from 'lucide-react';
import type { FinancialInputs, FinancialResults } from '../utils/financialPlanningCalculations';
import { getCareerStageLabel } from '../utils/financialPlanningHelpers';

interface FinancialPlanningResultsProps {
  inputs: FinancialInputs;
  results: FinancialResults;
  onDownload: () => void;
  isGeneratingPDF?: boolean;
}

export function FinancialPlanningResults({
  inputs,
  results,
  onDownload,
  isGeneratingPDF = false,
}: FinancialPlanningResultsProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getZoneLabel = (locality: string): string => {
    if (locality === 'metro') return 'Zone 1 (Metro Cities)';
    if (locality === 'tier1') return 'Zone 2 (Tier-1/Non-Metro)';
    return 'Zone 3 (Rest of India)';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Term Insurance</h4>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(results.termInsuranceCover)}
          </p>
          <p className="text-xs text-blue-600 mt-1">Recommended Coverage</p>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Health Insurance</h4>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {results.healthInsuranceCover}
          </p>
          <p className="text-xs text-green-600 mt-1">Base Cover</p>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Monthly SIP</h4>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {formatCurrency(results.sipRecommendation)}
          </p>
          <p className="text-xs text-purple-600 mt-1">Recommended</p>
        </Card>

        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <h4 className="font-semibold text-orange-900">Emergency Fund</h4>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            {formatCurrency(results.emergencyFund)}
          </p>
          <p className="text-xs text-orange-600 mt-1">6 Months Expenses</p>
        </Card>
      </div>

      {/* Detailed Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Financial Plan Summary</h2>
          <Button onClick={onDownload} disabled={isGeneratingPDF}>
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Opening...' : 'Download PDF Report'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-semibold">{inputs.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Age</p>
                <p className="font-semibold">{results.age} years</p>
              </div>
              <div>
                <p className="text-gray-600">Career Stage</p>
                <Badge variant="outline">{getCareerStageLabel(results.careerStage)}</Badge>
              </div>
              <div>
                <p className="text-gray-600">Region</p>
                <p className="font-semibold">{getZoneLabel(inputs.locality)}</p>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Financial Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Annual Income</p>
                <p className="text-xl font-bold">{formatCurrency(inputs.annualIncome)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
                <p className="text-xl font-bold">{formatCurrency(results.monthlyExpenses)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Inflation-Adjusted Expenses (10 years)</p>
                <p className="text-xl font-bold">{formatCurrency(results.inflationAdjustedExpenses)}</p>
                <p className="text-xs text-gray-500 mt-1">At 6% inflation rate</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Existing Investments</p>
                <p className="text-xl font-bold">{formatCurrency(inputs.investments || 0)}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Actionable Recommendations
            </h3>
            <div className="space-y-2">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-2 border-blue-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Term Insurance Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Amount:</span>
                  <span className="font-semibold">{formatCurrency(results.termInsuranceCover)}</span>
                </div>
                {inputs.numberOfKids > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage Until:</span>
                    <span className="font-semibold">Youngest child turns 30</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage Until:</span>
                    <span className="font-semibold">Age 60</span>
                  </div>
                )}
                {inputs.loanAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Includes Loan:</span>
                    <span className="font-semibold">{formatCurrency(inputs.loanAmount)}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 border-2 border-green-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                Health Insurance Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recommended Cover:</span>
                  <span className="font-semibold">{results.healthInsuranceCover}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Based on Income:</span>
                  <span className="font-semibold">{formatCurrency(inputs.annualIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Region:</span>
                  <span className="font-semibold">{getZoneLabel(inputs.locality)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

