interface CashFlow {
  date: Date;
  amount: number;
}

export function calculateXIRR(cashFlows: CashFlow[]): number {
  if (cashFlows.length < 2) return 0;
  
  // Sort by date
  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Initial guess
  let rate = 0.1;
  const tolerance = 1e-6;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let npvDerivative = 0;
    
    for (const cf of sorted) {
      const daysDiff = (cf.date.getTime() - sorted[0].date.getTime()) / (1000 * 60 * 60 * 24);
      const years = daysDiff / 365;
      
      const presentValue = cf.amount / Math.pow(1 + rate, years);
      npv += presentValue;
      
      if (years !== 0) {
        npvDerivative -= (cf.amount * years) / Math.pow(1 + rate, years + 1);
      }
    }
    
    if (Math.abs(npv) < tolerance) {
      break;
    }
    
    if (Math.abs(npvDerivative) < tolerance) {
      break;
    }
    
    rate = rate - npv / npvDerivative;
    
    // Clamp rate to prevent extreme values, but allow negative returns
    if (rate < -0.99) {
      rate = -0.99;
    }
  }
  
  return rate * 100; // Return as percentage (can be negative)
}

export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) return 0;
  
  const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;
  return cagr * 100; // Return as percentage (can be negative)
}

export function calculateReturns(initialValue: number, finalValue: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = finalValue - initialValue;
  const percentage = initialValue > 0 ? (absolute / initialValue) * 100 : 0;
  
  return {
    absolute,
    percentage
  };
}