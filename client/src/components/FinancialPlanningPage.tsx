import React, { useState } from 'react';
import { Card } from './ui/card';
import { FinancialPlanningForm } from './FinancialPlanningForm';
import { FinancialPlanningResults } from './FinancialPlanningResults';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from './ui/button';
import type { FinancialInputs, FinancialResults } from '../utils/financialPlanningCalculations';
import { calculateFinancialPlan } from '../utils/financialPlanningCalculations';
import { downloadReport } from '../utils/financialPlanningHelpers';

export function FinancialPlanningPage() {
  const [inputs, setInputs] = useState<FinancialInputs | null>(null);
  const [results, setResults] = useState<FinancialResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleFormSubmit = (formInputs: FinancialInputs) => {
    const calculatedResults = calculateFinancialPlan(formInputs);
    setInputs(formInputs);
    setResults(calculatedResults);
    setShowResults(true);
    // Scroll to results
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleDownload = () => {
    if (inputs && results) {
      setIsGeneratingPDF(true);
      try {
        downloadReport(inputs, results);
        // Reset loading state after a delay
        setTimeout(() => setIsGeneratingPDF(false), 2000);
      } catch (error) {
        console.error('Error downloading report:', error);
        setIsGeneratingPDF(false);
        alert('Failed to open print dialog. Please try again.');
      }
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setInputs(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 text-white">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">Financial Planning</h1>
                <p className="text-purple-100 mt-1 sm:mt-2 text-sm sm:text-base">
                  Get personalized financial recommendations based on your profile, income, and goals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results View */}
        {showResults && inputs && results && (
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto h-10 sm:h-9 text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
            <FinancialPlanningResults
              inputs={inputs}
              results={results}
              onDownload={handleDownload}
              isGeneratingPDF={isGeneratingPDF}
            />
          </div>
        )}

        {/* Form View */}
        {!showResults && (
          <Card className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Get Your Financial Plan
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Fill in your details below to receive personalized financial planning recommendations
                including term insurance, health insurance, SIP suggestions, and more.
              </p>
            </div>
            <FinancialPlanningForm onSubmit={handleFormSubmit} />
          </Card>
        )}
      </div>
    </div>
  );
}
