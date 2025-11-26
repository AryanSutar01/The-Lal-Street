import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Plus, Minus, Calculator } from 'lucide-react';
import type { FinancialInputs } from '../utils/financialPlanningCalculations';
import { CitySelector } from './CitySelector';

interface FinancialPlanningFormProps {
  onSubmit: (inputs: FinancialInputs) => void;
}

export function FinancialPlanningForm({ onSubmit }: FinancialPlanningFormProps) {
  const [formData, setFormData] = useState<Partial<FinancialInputs>>({
    name: '',
    dob: '',
    maritalStatus: 'single',
    city: 'Mumbai', // Default city
    zone: 1, // Default zone (Mumbai is Zone 1)
    annualIncome: 0,
    expenses: 0,
    investments: 0,
    numberOfKids: 0,
    kidsDob: [] as string[],
    loanAmount: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as FinancialInputs);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.dob || !formData.annualIncome || !formData.expenses) {
      alert('Please fill in all required fields');
      return false;
    }
    if (formData.numberOfKids! > 0 && formData.kidsDob!.length !== formData.numberOfKids!) {
      alert('Please provide DOB for all children');
      return false;
    }
    return true;
  };

  const handleKidsCountChange = (count: number) => {
    const newCount = Math.max(0, Math.min(10, count));
    setFormData(prev => {
      const newKidsDob = [...(prev.kidsDob || [])];
      while (newKidsDob.length < newCount) {
        newKidsDob.push('');
      }
      while (newKidsDob.length > newCount) {
        newKidsDob.pop();
      }
      return { ...prev, numberOfKids: newCount, kidsDob: newKidsDob };
    });
  };

  const handleKidDobChange = (index: number, dob: string) => {
    const today = new Date().toISOString().split('T')[0];
    const parentDob = formData.dob;
    
    // Validate: DOB should not be in the future and should be after parent's DOB
    if (dob <= today && (!parentDob || dob >= parentDob)) {
      setFormData(prev => {
        const newKidsDob = [...(prev.kidsDob || [])];
        newKidsDob[index] = dob;
        return { ...prev, kidsDob: newKidsDob };
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 sm:space-y-6">
        {/* Personal Information */}
        <Card className="p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob || ''}
                onChange={(e) => {
                  const newDob = e.target.value;
                  if (newDob <= new Date().toISOString().split('T')[0]) {
                    setFormData(prev => ({ ...prev, dob: newDob }));
                  }
                }}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="marital-status">Marital Status *</Label>
              <RadioGroup
                value={formData.maritalStatus || 'single'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  maritalStatus: value as 'single' | 'married',
                  numberOfKids: value === 'single' ? 0 : prev.numberOfKids
                }))}
              >
                <div className="flex gap-3 sm:gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="cursor-pointer text-sm sm:text-base">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="married" id="married" />
                    <Label htmlFor="married" className="cursor-pointer text-sm sm:text-base">Married</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div>
              <CitySelector
                value={formData.city || 'Mumbai'}
                onChange={(cityName, zone, state) => {
                  // Store as "cityName|state" format if state is provided (for disambiguation)
                  const cityValue = state ? `${cityName}|${state}` : cityName;
                  setFormData(prev => ({ 
                    ...prev, 
                    city: cityValue,
                    zone: zone,
                    // Keep legacy locality for backward compatibility
                    locality: zone === 1 ? 'metro' : zone === 2 ? 'tier1' : 'tier2'
                  }));
                }}
                label="City/Locality"
                required
              />
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card className="p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="annual-income">Annual Income (₹) *</Label>
              <Input
                id="annual-income"
                type="number"
                value={formData.annualIncome || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    annualIncome: value >= 0 ? value : 0 
                  }));
                }}
                required
                min="0"
                prefix="₹"
                className="pl-8"
              />
            </div>
            <div>
              <Label htmlFor="expenses">Monthly Expenses (₹) *</Label>
              <Input
                id="expenses"
                type="number"
                value={formData.expenses || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    expenses: value >= 0 ? value : 0 
                  }));
                }}
                required
                min="0"
                prefix="₹"
                className="pl-8"
              />
            </div>
            <div>
              <Label htmlFor="investments">Existing Investments (₹)</Label>
              <Input
                id="investments"
                type="number"
                value={formData.investments || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    investments: value >= 0 ? value : 0 
                  }));
                }}
                min="0"
                prefix="₹"
                className="pl-8"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="loan-amount">Loan Amount (₹) - if any</Label>
              <Input
                id="loan-amount"
                type="number"
                value={formData.loanAmount || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    loanAmount: value >= 0 ? value : 0 
                  }));
                }}
                min="0"
                prefix="₹"
                className="pl-8"
                placeholder="0"
              />
            </div>
          </div>
        </Card>

        {/* Children Information */}
        {formData.maritalStatus === 'married' && (
          <Card className="p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Children Information</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Number of Children</Label>
                <div className="flex items-center gap-3 sm:gap-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleKidsCountChange((formData.numberOfKids || 0) - 1)}
                    disabled={(formData.numberOfKids || 0) <= 0}
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-base sm:text-lg font-semibold w-12 text-center">
                    {formData.numberOfKids || 0}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleKidsCountChange((formData.numberOfKids || 0) + 1)}
                    disabled={(formData.numberOfKids || 0) >= 10}
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formData.numberOfKids! > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base">Children's Date of Birth</Label>
                  {Array.from({ length: formData.numberOfKids || 0 }).map((_, index) => (
                    <div key={index}>
                      <Label htmlFor={`kid-dob-${index}`} className="text-sm sm:text-base">
                        Child {index + 1} DOB
                      </Label>
                      <Input
                        id={`kid-dob-${index}`}
                        type="date"
                        value={formData.kidsDob?.[index] || ''}
                        onChange={(e) => handleKidDobChange(index, e.target.value)}
                        min={formData.dob || undefined}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        className="mt-1"
                      />
                      {formData.dob && formData.kidsDob?.[index] && formData.kidsDob[index] < formData.dob && (
                        <p className="text-xs text-red-600 mt-1">Child's DOB must be after parent's DOB</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        <Button type="submit" size="lg" className="w-full h-11 sm:h-12 text-sm sm:text-base">
          <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Generate Financial Plan
        </Button>
      </div>
    </form>
  );
}

