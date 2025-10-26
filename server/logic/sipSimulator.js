// server/logic/sipSimulator.js
const { 
  calculateCAGR, 
  calculateXIRR, 
  calculateVolatility, 
  calculateSharpeRatio, 
  calculateMaxDrawdown 
} = require('./financialCalculations.js');

/**
 * Finds the closest available NAV date from the data.
 * @param {Array<object>} navData - The array of {date, nav} objects.
 * @param {Date} targetDate - The date we *want* to invest on.
 * @returns {object} The {date, nav} object for the closest valid investment day.
 */
const findClosestNav = (navData, targetDate) => {
  // Assumes navData is sorted oldest to newest
  for (const dayData of navData) {
    const navDate = new Date(dayData.date);
    if (navDate >= targetDate) {
      return dayData;
    }
  }
  return navData[navData.length - 1]; // Fallback to last available
};

/**
 * The main portfolio simulation engine.
 * @param {object} inputs - The user's form inputs (totalInvestment, dates, funds array).
 * @param {Array<object>} allNavData - An array of the complete NAV data for each fund.
 * @returns {object} The final, comprehensive simulation result.
 */
const runPortfolioSipSimulation = (inputs, allNavData) => {
  const { totalInvestment, startDate, endDate, funds } = inputs;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);

  let currentDate = new Date(start);
  let portfolioTotalInvested = 0;
  let portfolioFinalValue = 0;
  const portfolioCashflows = []; // For overall XIRR
  
  // To store data for each individual fund
  const individualFundResults = funds.map(fund => {
    const navHistory = allNavData.find(nav => nav.meta.scheme_code == fund.schemeCode);
    if (!navHistory) throw new Error(`NAV data missing for ${fund.schemeCode}`);

    return {
      schemeCode: fund.schemeCode,
      schemeName: navHistory.meta.scheme_name,
      weight: fund.weight,
      totalUnits: 0,
      totalInvested: 0,
      cashflows: [], // For individual XIRR
      growthData: [], // For the chart
      navData: navHistory.data.slice().reverse(), // Sort oldest to newest
    };
  });

  // --- Main Simulation Loop (Month by Month) ---
  while (currentDate <= end) {
    const investmentDate = new Date(currentDate);

    // Add total monthly investment to portfolio cashflow for XIRR
    portfolioCashflows.push({ amount: -totalInvestment, date: investmentDate });
    portfolioTotalInvested += totalInvestment;

    // Distribute investment across funds
    for (const fund of individualFundResults) {
      const monthlyFundInvestment = totalInvestment * (fund.weight / 100);
      const { nav: currentNav } = findClosestNav(fund.navData, investmentDate);

      const unitsBought = monthlyFundInvestment / parseFloat(currentNav);
      fund.totalUnits += unitsBought;
      fund.totalInvested += monthlyFundInvestment;
      fund.cashflows.push({ amount: -monthlyFundInvestment, date: investmentDate });
    }
    
    // Add a snapshot for the graph
    let portfolioValueSnapshot = 0;
     for (const fund of individualFundResults) {
        const { nav: snapshotNav } = findClosestNav(fund.navData, investmentDate);
        const fundValue = fund.totalUnits * parseFloat(snapshotNav);
        portfolioValueSnapshot += fundValue;
     }

     for(const fund of individualFundResults) {
        const { nav: snapshotNav } = findClosestNav(fund.navData, investmentDate);
        fund.growthData.push({
            date: investmentDate.toISOString().split('T')[0],
            value: fund.totalUnits * parseFloat(snapshotNav)
        });
     }


    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // --- Final Calculations (After the Loop) ---
  const finalResults = individualFundResults.map(fund => {
    const finalNavEntry = fund.navData[fund.navData.length - 1];
    const finalNav = parseFloat(finalNavEntry.nav);
    const finalValue = fund.totalUnits * finalNav;
    portfolioFinalValue += finalValue;

    // Add final value for XIRR
    fund.cashflows.push({ amount: finalValue, date: new Date(finalNavEntry.date) });

    // Calculate additional metrics
    const monthlyReturns = [];
    for (let i = 1; i < fund.growthData.length; i++) {
      const prevValue = fund.growthData[i - 1].value;
      const currValue = fund.growthData[i].value;
      if (prevValue > 0) {
        monthlyReturns.push(((currValue - prevValue) / prevValue) * 100);
      }
    }

    const volatility = calculateVolatility(monthlyReturns);
    const sharpeRatio = calculateSharpeRatio(calculateCAGR(fund.totalInvested, finalValue, years), 6, volatility);
    const maxDrawdown = calculateMaxDrawdown(fund.growthData.map(d => d.value));

    return {
      schemeCode: fund.schemeCode,
      schemeName: fund.schemeName,
      totalInvested: fund.totalInvested,
      currentValue: finalValue,
      profit: finalValue - fund.totalInvested,
      returnPercentage: ((finalValue - fund.totalInvested) / fund.totalInvested) * 100,
      cagr: calculateCAGR(fund.totalInvested, finalValue, years),
      xirr: calculateXIRR(fund.cashflows),
      volatility: volatility,
      sharpeRatio: sharpeRatio,
      maxDrawdown: maxDrawdown.maxDrawdown,
      growthData: fund.growthData,
    };
  });

  // Add final portfolio value for overall XIRR
  portfolioCashflows.push({ amount: portfolioFinalValue, date: new Date(endDate) });

  // Calculate portfolio-level analytics
  const portfolioMonthlyReturns = [];
  const portfolioValues = finalResults[0].growthData.map((point, index) => {
    let totalValue = 0;
    finalResults.forEach(fund => {
      totalValue += fund.growthData[index]?.value || 0;
    });
    return totalValue;
  });

  for (let i = 1; i < portfolioValues.length; i++) {
    const prevValue = portfolioValues[i - 1];
    const currValue = portfolioValues[i];
    if (prevValue > 0) {
      portfolioMonthlyReturns.push(((currValue - prevValue) / prevValue) * 100);
    }
  }

  const portfolioVolatility = calculateVolatility(portfolioMonthlyReturns);
  const portfolioSharpeRatio = calculateSharpeRatio(calculateCAGR(portfolioTotalInvested, portfolioFinalValue, years), 6, portfolioVolatility);
  const portfolioMaxDrawdown = calculateMaxDrawdown(portfolioValues);

  // Calculate best and worst performers
  const bestPerformer = finalResults.reduce((best, current) => 
    current.cagr > best.cagr ? current : best, finalResults[0]);
  const worstPerformer = finalResults.reduce((worst, current) => 
    current.cagr < worst.cagr ? current : worst, finalResults[0]);

  return {
    summary: {
      totalInvestment: portfolioTotalInvested,
      currentValue: portfolioFinalValue,
      profit: portfolioFinalValue - portfolioTotalInvested,
      returnPercentage: ((portfolioFinalValue - portfolioTotalInvested) / portfolioTotalInvested) * 100,
      cagr: calculateCAGR(portfolioTotalInvested, portfolioFinalValue, years),
      xirr: calculateXIRR(portfolioCashflows),
      volatility: portfolioVolatility,
      sharpeRatio: portfolioSharpeRatio,
      maxDrawdown: portfolioMaxDrawdown.maxDrawdown,
      bestPerformer: {
        name: bestPerformer.schemeName,
        cagr: bestPerformer.cagr
      },
      worstPerformer: {
        name: worstPerformer.schemeName,
        cagr: worstPerformer.cagr
      }
    },
    breakdown: finalResults,
    // We need to structure the data for the chart
    chartData: finalResults[0].growthData.map((point, index) => {
        let entry = { date: point.date, totalInvested: (index + 1) * totalInvestment };
        finalResults.forEach(fund => {
            entry[fund.schemeName] = fund.growthData[index]?.value || 0;
        });
        return entry;
    })
  };
};

module.exports = {
  runPortfolioSipSimulation,
};