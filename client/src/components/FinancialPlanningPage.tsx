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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Financial Planning</h1>
                <p className="text-purple-100 mt-2">
                  Get personalized financial recommendations based on your profile, income, and goals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results View */}
        {showResults && inputs && results && (
          <div className="space-y-4 mb-6">
            <Button variant="outline" onClick={handleReset}>
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
          <Card className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Get Your Financial Plan
              </h2>
              <p className="text-gray-600">
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
