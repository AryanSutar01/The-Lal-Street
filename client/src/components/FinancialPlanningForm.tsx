import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Plus, Minus, Calculator } from 'lucide-react';
import type { FinancialInputs } from '../utils/financialPlanningCalculations';

interface FinancialPlanningFormProps {
  onSubmit: (inputs: FinancialInputs) => void;
}

export function FinancialPlanningForm({ onSubmit }: FinancialPlanningFormProps) {
  const [formData, setFormData] = useState<Partial<FinancialInputs>>({
    name: '',
    dob: '',
    maritalStatus: 'single',
    locality: 'metro',
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
    setFormData(prev => {
      const newKidsDob = [...(prev.kidsDob || [])];
      newKidsDob[index] = dob;
      return { ...prev, kidsDob: newKidsDob };
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
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
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="cursor-pointer">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="married" id="married" />
                    <Label htmlFor="married" className="cursor-pointer">Married</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="locality">Locality/Region *</Label>
              <Select
                value={formData.locality || 'metro'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  locality: value as 'metro' | 'tier1' | 'tier2' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metro">Metro Cities (Zone 1)</SelectItem>
                  <SelectItem value="tier1">Tier-1/Non-Metro (Zone 2)</SelectItem>
                  <SelectItem value="tier2">Rest of India (Zone 3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Financial Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Children Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Number of Children</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleKidsCountChange((formData.numberOfKids || 0) - 1)}
                    disabled={(formData.numberOfKids || 0) <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {formData.numberOfKids || 0}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleKidsCountChange((formData.numberOfKids || 0) + 1)}
                    disabled={(formData.numberOfKids || 0) >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formData.numberOfKids! > 0 && (
                <div className="space-y-3">
                  <Label>Children's Date of Birth</Label>
                  {Array.from({ length: formData.numberOfKids || 0 }).map((_, index) => (
                    <div key={index}>
                      <Label htmlFor={`kid-dob-${index}`}>
                        Child {index + 1} DOB
                      </Label>
                      <Input
                        id={`kid-dob-${index}`}
                        type="date"
                        value={formData.kidsDob?.[index] || ''}
                        onChange={(e) => handleKidDobChange(index, e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        <Button type="submit" size="lg" className="w-full">
          <Calculator className="h-5 w-5 mr-2" />
          Generate Financial Plan
        </Button>
      </div>
    </form>
  );
}

