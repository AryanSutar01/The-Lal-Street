export interface FinancialInputs {
  name: string;
  dob: string;
  maritalStatus: 'single' | 'married';
  locality: 'metro' | 'tier1' | 'tier2'; // Zone 1, 2, 3
  annualIncome: number;
  expenses: number;
  investments: number;
  numberOfKids: number;
  kidsDob: string[];
  loanAmount: number;
}

export interface FinancialResults {
  age: number;
  careerStage: 'early' | 'mid' | 'late';
  monthlyExpenses: number;
  inflationAdjustedExpenses: number;
  healthInsuranceCover: string;
  termInsuranceCover: number;
  sipRecommendation: number;
  emergencyFund: number;
  recommendations: string[];
  healthInsuranceRecommendation: string;
}

const INFLATION_RATE = 0.06; // 6% annual inflation
const FD_RETURN_RATE = 0.07; // 7% FD return rate
const COVERAGE_AGE_KIDS = 30; // Cover till kids turn 30
const COVERAGE_AGE_NO_KIDS = 60; // Cover till 60 if no kids

// Calculate age from DOB
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Determine career stage based on age
export function getCareerStage(age: number): 'early' | 'mid' | 'late' {
  if (age >= 22 && age <= 30) return 'early';
  if (age >= 31 && age <= 40) return 'mid';
  if (age >= 41 && age <= 55) return 'late';
  return 'early'; // Default
}

// Calculate inflation-adjusted monthly expenses
export function calculateInflationAdjustedExpenses(
  monthlyExpenses: number,
  years: number
): number {
  return monthlyExpenses * Math.pow(1 + INFLATION_RATE, years);
}

// Get health insurance recommendation based on zone and income
export function getHealthInsuranceRecommendation(
  locality: 'metro' | 'tier1' | 'tier2',
  annualIncome: number
): string {
  let zone: 1 | 2 | 3;
  if (locality === 'metro') zone = 1;
  else if (locality === 'tier1') zone = 2;
  else zone = 3;

  if (annualIncome <= 800000) {
    if (zone === 1) return '₹10-15 lakh';
    if (zone === 2) return '₹7-10 lakh';
    return '₹5-7 lakh';
  } else if (annualIncome <= 1600000) {
    if (zone === 1) return '₹15-25 lakh';
    if (zone === 2) return '₹10-15 lakh';
    return '₹7-12 lakh';
  } else {
    if (zone === 1) return '₹25-50 lakh';
    if (zone === 2) return '₹15-25 lakh';
    return '₹12-20 lakh';
  }
}

// Calculate term insurance coverage needed
export function calculateTermInsurance(
  inputs: FinancialInputs
): number {
  const age = calculateAge(inputs.dob);
  const monthlyExpenses = inputs.expenses;
  
  // Determine coverage period
  let coverageYears: number;
  if (inputs.numberOfKids > 0 && inputs.kidsDob && inputs.kidsDob.length > 0) {
    // Cover till youngest kid turns 30
    const kidAges = inputs.kidsDob
      .filter(dob => dob) // Filter out empty strings
      .map(dob => calculateAge(dob));
    
    if (kidAges.length > 0) {
      const youngestKidAge = Math.min(...kidAges);
      coverageYears = COVERAGE_AGE_KIDS - youngestKidAge;
    } else {
      coverageYears = COVERAGE_AGE_NO_KIDS - age;
    }
  } else {
    // Cover till 60
    coverageYears = COVERAGE_AGE_NO_KIDS - age;
  }

  // Ensure coverage years is positive
  coverageYears = Math.max(1, coverageYears);

  // Calculate inflation-adjusted monthly expenses for the coverage period
  const avgYears = coverageYears / 2; // Average of coverage period
  const inflationAdjustedMonthly = calculateInflationAdjustedExpenses(
    monthlyExpenses,
    avgYears
  );

  // Calculate annual expenses
  const annualExpenses = inflationAdjustedMonthly * 12;

  // Calculate corpus needed to cover expenses at FD rate (7%)
  // Corpus = Annual Expenses / Return Rate
  const corpusNeeded = annualExpenses / FD_RETURN_RATE;

  // Add loan amount if any
  const totalCoverage = corpusNeeded + (inputs.loanAmount || 0);

  return Math.round(totalCoverage);
}

// Calculate SIP recommendation
export function calculateSIPRecommendation(
  annualIncome: number,
  monthlyExpenses: number,
  existingInvestments: number
): number {
  const annualExpenses = monthlyExpenses * 12;
  const surplus = annualIncome - annualExpenses;

  // If no existing investments, recommend 50% of surplus
  if (existingInvestments === 0 || existingInvestments < 10000) {
    return Math.round((surplus * 0.5) / 12); // Monthly SIP
  }

  // If has investments, recommend 30% of surplus as SIP
  return Math.round((surplus * 0.3) / 12);
}

// Calculate emergency fund (6 months of expenses)
export function calculateEmergencyFund(monthlyExpenses: number): number {
  return Math.round(monthlyExpenses * 6);
}

// Generate career stage specific recommendations
export function generateRecommendations(
  inputs: FinancialInputs,
  results: FinancialResults
): string[] {
  const recommendations: string[] = [];

  if (results.careerStage === 'early') {
    recommendations.push(`Build an emergency fund of ₹${results.emergencyFund.toLocaleString('en-IN')} to cover 6 months of expenses.`);
    recommendations.push(`Start SIP of ₹${results.sipRecommendation.toLocaleString('en-IN')} per month to build wealth early.`);
    recommendations.push(`Get term insurance coverage of ₹${results.termInsuranceCover.toLocaleString('en-IN')} to protect your family.`);
    recommendations.push(`Consider health insurance coverage of ${results.healthInsuranceCover} for medical emergencies.`);
  } else if (results.careerStage === 'mid') {
    recommendations.push(`Increase your term insurance coverage to ₹${results.termInsuranceCover.toLocaleString('en-IN')} to account for growing responsibilities.`);
    if (inputs.numberOfKids > 0) {
      recommendations.push(`Start planning for children's education - consider creating a dedicated SIP for education goals.`);
    }
    recommendations.push(`Ensure health insurance coverage of ${results.healthInsuranceCover} for the entire family.`);
    recommendations.push(`Consider a second term insurance plan if current coverage is insufficient.`);
    recommendations.push(`Increase SIP to ₹${results.sipRecommendation.toLocaleString('en-IN')} per month for wealth accumulation.`);
  } else {
    recommendations.push(`Focus on retirement planning - aim to build a corpus that can sustain your post-retirement expenses.`);
    recommendations.push(`Review and optimize your existing investments for better returns.`);
    recommendations.push(`Ensure adequate health insurance coverage of ${results.healthInsuranceCover} considering medical costs in later years.`);
    recommendations.push(`Plan for corpus withdrawal strategy to maintain lifestyle post-retirement.`);
  }

  // General recommendations
  if (inputs.loanAmount > 0) {
    recommendations.push(`Your term insurance should cover your loan amount of ₹${inputs.loanAmount.toLocaleString('en-IN')} in addition to living expenses.`);
  }

  if (inputs.investments === 0 || inputs.investments < 10000) {
    recommendations.push(`Start investing immediately - even small SIPs can grow significantly over time.`);
  }

  return recommendations;
}

// Main calculation function
export function calculateFinancialPlan(
  inputs: FinancialInputs
): FinancialResults {
  const age = calculateAge(inputs.dob);
  const careerStage = getCareerStage(age);
  const monthlyExpenses = inputs.expenses;
  
  // Calculate inflation-adjusted expenses for 10 years (average planning period)
  const inflationAdjustedExpenses = calculateInflationAdjustedExpenses(
    monthlyExpenses,
    10
  );

  // Health insurance recommendation
  const healthInsuranceCover = getHealthInsuranceRecommendation(
    inputs.locality,
    inputs.annualIncome
  );

  // Term insurance coverage
  const termInsuranceCover = calculateTermInsurance(inputs);

  // SIP recommendation
  const sipRecommendation = calculateSIPRecommendation(
    inputs.annualIncome,
    monthlyExpenses,
    inputs.investments
  );

  // Emergency fund
  const emergencyFund = calculateEmergencyFund(monthlyExpenses);

  const results: FinancialResults = {
    age,
    careerStage,
    monthlyExpenses,
    inflationAdjustedExpenses,
    healthInsuranceCover,
    termInsuranceCover,
    sipRecommendation,
    emergencyFund,
    recommendations: [],
    healthInsuranceRecommendation: healthInsuranceCover,
  };

  // Generate recommendations
  results.recommendations = generateRecommendations(inputs, results);

  return results;
}

