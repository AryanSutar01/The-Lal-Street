import React, { useState, useEffect } from 'react';
import { searchFunds, fetchNavsForBucket } from '../services/fundsApi';
import useDebounce from '../hooks/useDebounce';
import PerformanceMetricsDashboard from './PortfolioCharts';
import './PortfolioAnalyzer.css';

// Helper functions
const getToday = () => new Date().toISOString().split('T')[0];
const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(amount);

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB');
};

// XIRR calculation function
const calculateXIRR = (cashflows, dates, guess = 0.1) => {
  try {
    const newton = (f, x0, tolerance = 1e-6, maxIterations = 100) => {
      let x = x0;
      for (let i = 0; i < maxIterations; i++) {
        const fx = f(x);
        if (Math.abs(fx) < tolerance) return x;
        
        // Numerical derivative
        const h = 1e-6;
        const dfx = (f(x + h) - f(x - h)) / (2 * h);
        if (Math.abs(dfx) < 1e-12) break;
        
        x = x - fx / dfx;
      }
      return x;
    };

    const xnpv = (rate, cashflows, dates) => {
      const minDate = new Date(Math.min(...dates.map(d => new Date(d).getTime())));
      return cashflows.reduce((sum, cf, i) => {
        const days = (new Date(dates[i]) - minDate) / (1000 * 60 * 60 * 24);
        return sum + cf / Math.pow(1 + rate, days / 365.0);
      }, 0);
    };

    const result = newton(r => xnpv(r, cashflows, dates), guess);
    return result * 100;
  } catch (error) {
    return null;
  }
};

// SIP Calculator
const sipCalculator = (navData, monthlyInvestment, startDate, endDate, schemeName = "", schemeCode = "") => {
  if (!navData || navData.length < 2) return null;

  // Clean and sort data
  const cleanData = navData
    .map(item => ({
      date: new Date(item.date),
      nav: parseFloat(item.nav)
    }))
    .filter(item => !isNaN(item.nav) && !isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date);

  if (cleanData.length < 2) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const filteredData = cleanData.filter(item => item.date >= start && item.date <= end);

  if (filteredData.length < 2) return null;

  // Generate SIP dates
  const sipDates = [];
  const current = new Date(start);
  while (current <= end) {
    sipDates.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  let totalUnits = 0;
  let totalInvestment = 0;
  const sipValues = [];
  const cashflows = [];
  const cashflowDates = [];

  for (const sipDate of sipDates) {
    if (sipDate > end) break;

    // Find nearest available NAV
    const nearestNav = filteredData.reduce((prev, curr) => 
      Math.abs(curr.date - sipDate) < Math.abs(prev.date - sipDate) ? curr : prev
    );

    const units = monthlyInvestment / nearestNav.nav;
    totalUnits += units;
    totalInvestment += monthlyInvestment;

    const currentNav = filteredData[filteredData.length - 1].nav;
    const currentValue = totalUnits * currentNav;

    sipValues.push({
      date: sipDate,
      nav: nearestNav.nav,
      units: units,
      cumulativeUnits: totalUnits,
      invested: totalInvestment,
      value: currentValue
    });

    cashflows.push(-monthlyInvestment);
    cashflowDates.push(sipDate);
  }

  if (sipValues.length === 0) return null;

  const finalNav = filteredData[filteredData.length - 1].nav;
  const currentValue = totalUnits * finalNav;
  const profit = currentValue - totalInvestment;
  const returns = (profit / totalInvestment) * 100;

  // XIRR calculation
  cashflows.push(currentValue);
  cashflowDates.push(filteredData[filteredData.length - 1].date);
  const xirr = calculateXIRR(cashflows, cashflowDates);

  // CAGR calculation
  const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
  const cagr = years > 0 ? (Math.pow(currentValue / totalInvestment, 1 / years) - 1) * 100 : 0;

  return {
    schemeName,
    schemeCode,
    totalInvestment,
    currentValue,
    profit,
    returnPercentage: returns,
    cagr,
    xirr,
    totalUnits,
    finalNav,
    numInstallments: sipValues.length,
    growthData: sipValues,
    startDate: start,
    endDate: end
  };
};

// Lump Sum Calculator
const lumpsumCalculator = (navData, lumpsumInvestment, investmentDate, endDate, schemeName = "", schemeCode = "") => {
  if (!navData || navData.length < 2) return null;

  const cleanData = navData
    .map(item => ({
      date: new Date(item.date),
      nav: parseFloat(item.nav)
    }))
    .filter(item => !isNaN(item.nav) && !isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date);

  if (cleanData.length < 2) return null;

  const investDate = new Date(investmentDate);
  const end = new Date(endDate);
  const filteredData = cleanData.filter(item => item.date >= investDate && item.date <= end);

  if (filteredData.length === 0) return null;

  // Find NAV on investment date
  const nearestNav = filteredData.reduce((prev, curr) => 
    Math.abs(curr.date - investDate) < Math.abs(prev.date - investDate) ? curr : prev
  );

  const unitsPurchased = lumpsumInvestment / nearestNav.nav;
  const finalNav = filteredData[filteredData.length - 1].nav;
  const currentValue = unitsPurchased * finalNav;
  const profit = currentValue - lumpsumInvestment;
  const returns = (profit / lumpsumInvestment) * 100;

  // CAGR calculation
  const years = (filteredData[filteredData.length - 1].date - nearestNav.date) / (1000 * 60 * 60 * 24 * 365.25);
  const cagr = years > 0 ? (Math.pow(currentValue / lumpsumInvestment, 1 / years) - 1) * 100 : 0;

  // XIRR calculation
  const cashflows = [-lumpsumInvestment, currentValue];
  const cashflowDates = [nearestNav.date, filteredData[filteredData.length - 1].date];
  const xirr = calculateXIRR(cashflows, cashflowDates);

  return {
    schemeName,
    schemeCode,
    investmentDate: nearestNav.date,
    lumpsumInvestment,
    currentValue,
    profit,
    returnPercentage: returns,
    cagr,
    xirr,
    unitsPurchased,
    growthData: filteredData.map(item => ({
      date: item.date,
      value: item.nav * unitsPurchased
    })),
    startNav: nearestNav.nav,
    endDate: filteredData[filteredData.length - 1].date
  };
};

// Rolling Returns Calculator
const rollingReturnsCalculator = (navData, windowDays, schemeName = "") => {
  if (!navData || navData.length < windowDays) return null;

  const cleanData = navData
    .map(item => ({
      date: new Date(item.date),
      nav: parseFloat(item.nav)
    }))
    .filter(item => !isNaN(item.nav) && !isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date);

  if (cleanData.length < windowDays) return null;

  const rollingReturns = [];
  const dates = [];

  for (let i = 0; i < cleanData.length - windowDays; i++) {
    const startNav = cleanData[i].nav;
    const endNav = cleanData[i + windowDays].nav;
    const years = windowDays / 365.25;
    const rr = (Math.pow(endNav / startNav, 1 / years) - 1) * 100;
    rollingReturns.push(rr);
    dates.push(cleanData[i + windowDays].date);
  }

  const stats = {
    mean: rollingReturns.reduce((a, b) => a + b, 0) / rollingReturns.length,
    median: rollingReturns.sort((a, b) => a - b)[Math.floor(rollingReturns.length / 2)],
    std: Math.sqrt(rollingReturns.reduce((sq, n) => sq + Math.pow(n - rollingReturns.reduce((a, b) => a + b, 0) / rollingReturns.length, 2), 0) / rollingReturns.length),
    min: Math.min(...rollingReturns),
    max: Math.max(...rollingReturns),
    positivePeriods: (rollingReturns.filter(r => r > 0).length / rollingReturns.length) * 100
  };

  return {
    data: rollingReturns.map((rr, i) => ({ date: dates[i], rollingReturn: rr })),
    statistics: stats
  };
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, color = "#2E86AB" }) => (
  <div className="metric-card" style={{ '--card-color': color }}>
    <div className="metric-title">{title}</div>
    <div className="metric-value" style={{ color: color }}>{value}</div>
    <div className="metric-subtitle">{subtitle}</div>
  </div>
);

// Preset allocation strategies
const ALLOCATION_PRESETS = {
  'Equal Weight': (count) => {
    const weight = 100 / count;
    const remainder = 100 - (Math.floor(weight) * count);
    return Array(count).fill(Math.floor(weight)).map((w, i) => w + (i === 0 ? remainder : 0));
  },
  'Aggressive (Top Heavy)': (count) => {
    const weights = [40, 30, 20, 10];
    return weights.slice(0, count).concat(Array(Math.max(0, count - 4)).fill(0));
  },
  'Balanced': (count) => {
    const weights = [30, 25, 25, 20];
    return weights.slice(0, count).concat(Array(Math.max(0, count - 4)).fill(0));
  }
};

function PortfolioAnalyzer() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchemes, setSelectedSchemes] = useState({});
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [lumpsumInvestment, setLumpsumInvestment] = useState(100000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(getToday());
  const [lumpsumDate, setLumpsumDate] = useState('');
  const [rollingWindow, setRollingWindow] = useState(365);
  const [allocationPreset, setAllocationPreset] = useState('Equal Weight');
  const [weights, setWeights] = useState({});
  const [navData, setNavData] = useState({});
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('sip');
  const [results, setResults] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search funds
  useEffect(() => {
    const fetchFunds = async () => {
      if (debouncedSearchTerm) {
        setIsLoading(true);
        try {
          const data = await searchFunds(debouncedSearchTerm);
          setSearchResults(data);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
        setIsLoading(false);
      } else {
        setSearchResults([]);
      }
    };
    fetchFunds();
  }, [debouncedSearchTerm]);

  // Initialize weights when schemes change
  useEffect(() => {
    const schemeCodes = Object.keys(selectedSchemes);
    if (schemeCodes.length > 0) {
      const newWeights = {};
      schemeCodes.forEach((code, index) => {
        newWeights[code] = weights[code] || (100 / schemeCodes.length);
      });
      setWeights(newWeights);
    }
  }, [selectedSchemes]);

  // Add scheme to portfolio
  const handleAddScheme = (scheme) => {
    if (Object.keys(selectedSchemes).length >= 5) {
      alert('Maximum 5 schemes allowed');
      return;
    }
    if (selectedSchemes[scheme.schemeCode]) return;

    setSelectedSchemes(prev => ({
      ...prev,
      [scheme.schemeCode]: scheme.schemeName
    }));
    setSearchTerm('');
    setSearchResults([]);
  };

  // Remove scheme from portfolio
  const handleRemoveScheme = (schemeCode) => {
    const newSchemes = { ...selectedSchemes };
    delete newSchemes[schemeCode];
    setSelectedSchemes(newSchemes);

    const newWeights = { ...weights };
    delete newWeights[schemeCode];
    setWeights(newWeights);
  };

  // Update weight
  const handleWeightChange = (schemeCode, newWeight) => {
    setWeights(prev => ({
      ...prev,
      [schemeCode]: Math.max(0, Math.min(100, parseFloat(newWeight) || 0))
    }));
  };

  // Apply preset allocation
  const applyPreset = () => {
    const schemeCodes = Object.keys(selectedSchemes);
    if (schemeCodes.length === 0) return;

    const presetWeights = ALLOCATION_PRESETS[allocationPreset](schemeCodes.length);
    const newWeights = {};
    schemeCodes.forEach((code, index) => {
      newWeights[code] = presetWeights[index] || 0;
    });
    setWeights(newWeights);
  };

  // Normalize weights to 100%
  const normalizeWeights = () => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return;

    const newWeights = {};
    Object.keys(weights).forEach(code => {
      newWeights[code] = (weights[code] / totalWeight) * 100;
    });
    setWeights(newWeights);
  };

  // Fetch NAV data
  const fetchNavData = async () => {
    const schemeCodes = Object.keys(selectedSchemes);
    if (schemeCodes.length === 0) return;

    setIsNavLoading(true);
    try {
      const data = await fetchNavsForBucket(schemeCodes);
      if (data && data.length === schemeCodes.length) {
        const navDataMap = {};
        data.forEach(fund => {
          navDataMap[fund.schemeCode] = fund.navData;
        });
        setNavData(navDataMap);
        
        // Set earliest start date
        const inceptionDates = data.map(fund => fund.meta.scheme_start_date);
        const earliestDate = inceptionDates.reduce((earliest, current) => 
          new Date(current) < new Date(earliest) ? current : earliest
        );
        setStartDate(earliestDate);
        setLumpsumDate(earliestDate);
      }
    } catch (error) {
      console.error('NAV fetch error:', error);
      alert('Failed to fetch NAV data');
    }
    setIsNavLoading(false);
  };

  // Run SIP Analysis
  const runSIPAnalysis = async () => {
    const schemeCodes = Object.keys(selectedSchemes);
    if (schemeCodes.length === 0) return;

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      alert('Weights must sum to 100%');
      return;
    }

    setIsCalculating(true);
    try {
      const results = [];
      let totalCurrentValue = 0;
      let totalInvestment = 0;

      for (const [code, name] of Object.entries(selectedSchemes)) {
        const weight = weights[code] || 0;
        if (weight <= 0) continue;

        const investAmount = (monthlyInvestment * weight) / 100;
        const schemeNavData = navData[code];
        
        if (!schemeNavData) continue;

        const result = sipCalculator(schemeNavData, investAmount, startDate, endDate, name, code);
        if (result) {
          results.push(result);
          totalCurrentValue += result.currentValue;
          totalInvestment += result.totalInvestment;
        }
      }

      if (results.length === 0) {
        alert('No valid data for analysis');
        return;
      }

      const profit = totalCurrentValue - totalInvestment;
      const returns = (profit / totalInvestment) * 100;
      const years = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365.25);
      const portfolioCagr = years > 0 ? (Math.pow(totalCurrentValue / totalInvestment, 1 / years) - 1) * 100 : 0;

      // Calculate portfolio XIRR
      const allCashflows = [];
      const allCashflowDates = [];
      results.forEach(result => {
        result.growthData.forEach((item, index) => {
          const investAmount = (monthlyInvestment * weights[result.schemeCode]) / 100;
          allCashflows.push(-investAmount);
          allCashflowDates.push(item.date);
        });
      });
      allCashflows.push(totalCurrentValue);
      allCashflowDates.push(new Date(endDate));
      const portfolioXirr = calculateXIRR(allCashflows, allCashflowDates);

      setResults({
        type: 'sip',
        summary: {
          totalInvestment,
          currentValue: totalCurrentValue,
          profit,
          returnPercentage: returns,
          cagr: portfolioCagr,
          xirr: portfolioXirr,
          numInstallments: results[0]?.numInstallments || 0
        },
        breakdown: results,
        bestPerformer: results.reduce((best, current) => 
          current.cagr > best.cagr ? current : best
        ),
        worstPerformer: results.reduce((worst, current) => 
          current.cagr < worst.cagr ? current : worst
        )
      });
    } catch (error) {
      console.error('SIP Analysis error:', error);
      alert('Analysis failed');
    }
    setIsCalculating(false);
  };

  // Run Lump Sum Analysis
  const runLumpsumAnalysis = async () => {
    const schemeCodes = Object.keys(selectedSchemes);
    if (schemeCodes.length === 0) return;

    setIsCalculating(true);
    try {
      const results = [];
      let totalCurrentValue = 0;
      let totalInvestment = 0;

      for (const [code, name] of Object.entries(selectedSchemes)) {
        const schemeNavData = navData[code];
        if (!schemeNavData) continue;

        const result = lumpsumCalculator(schemeNavData, lumpsumInvestment, lumpsumDate, endDate, name, code);
        if (result) {
          results.push(result);
          totalCurrentValue += result.currentValue;
          totalInvestment += result.lumpsumInvestment;
        }
      }

      if (results.length === 0) {
        alert('No valid data for analysis');
        return;
      }

      const profit = totalCurrentValue - totalInvestment;
      const returns = (profit / totalInvestment) * 100;

      setResults({
        type: 'lumpsum',
        summary: {
          totalInvestment,
          currentValue: totalCurrentValue,
          profit,
          returnPercentage: returns
        },
        breakdown: results,
        bestPerformer: results.reduce((best, current) => 
          current.cagr > best.cagr ? current : best
        ),
        worstPerformer: results.reduce((worst, current) => 
          current.cagr < worst.cagr ? current : worst
        )
      });
    } catch (error) {
      console.error('Lump Sum Analysis error:', error);
      alert('Analysis failed');
    }
    setIsCalculating(false);
  };

  // Run Rolling Returns Analysis
  const runRollingAnalysis = async () => {
    const schemeCodes = Object.keys(selectedSchemes);
    if (schemeCodes.length === 0) return;

    setIsCalculating(true);
    try {
      const results = [];
      const allStats = [];

      for (const [code, name] of Object.entries(selectedSchemes)) {
        const schemeNavData = navData[code];
        if (!schemeNavData) continue;

        const result = rollingReturnsCalculator(schemeNavData, rollingWindow, name);
        if (result) {
          results.push({
            schemeCode: code,
            schemeName: name,
            data: result.data,
            statistics: result.statistics
          });
          allStats.push({
            scheme: name,
            ...result.statistics
          });
        }
      }

      setResults({
        type: 'rolling',
        results,
        allStats
      });
    } catch (error) {
      console.error('Rolling Analysis error:', error);
      alert('Analysis failed');
    }
    setIsCalculating(false);
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="portfolio-analyzer">
      {/* Header */}
      <div className="analyzer-header">
        <h1>📈 Portfolio Analyzer Pro</h1>
        <p>Comprehensive SIP Analysis & Rolling Returns Calculator</p>
      </div>

      {/* Configuration Section */}
      <div className="config-section">
        <h2>⚙️ Configuration</h2>
        
        {/* Investment Amounts */}
        <div className="investment-inputs">
          <div className="input-group">
            <label>Monthly SIP Investment (₹)</label>
            <input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              min="500"
              step="100"
            />
          </div>
          <div className="input-group">
            <label>Lump Sum Investment (₹)</label>
            <input
              type="number"
              value={lumpsumInvestment}
              onChange={(e) => setLumpsumInvestment(Number(e.target.value))}
              min="1000"
              step="1000"
            />
          </div>
        </div>

        {/* Date Inputs */}
        <div className="date-inputs">
          <div className="input-group">
            <label>SIP Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Lump Sum Date</label>
            <input
              type="date"
              value={lumpsumDate}
              onChange={(e) => setLumpsumDate(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Fund Selection */}
      <div className="fund-selection">
        <h2>💼 Portfolio Selection</h2>
        
        {/* Search */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search mutual funds by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            />
            {isLoading && <div className="loading-spinner">⟳</div>}
            {!isLoading && searchTerm && <div className="search-icon">🔍</div>}
          </div>
          
          {isSearchFocused && searchTerm && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(fund => (
                <div
                  key={fund.schemeCode}
                  className="search-result-item"
                  onMouseDown={() => handleAddScheme(fund)}
                >
                  <div className="fund-name">{fund.schemeName}</div>
                  <div className="fund-code">Code: {fund.schemeCode}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Schemes */}
        {Object.keys(selectedSchemes).length > 0 && (
          <div className="selected-schemes">
            <h3>Selected Schemes</h3>
            <div className="schemes-grid">
              {Object.entries(selectedSchemes).map(([code, name]) => (
                <div key={code} className="scheme-card">
                  <div className="scheme-header">
                    <h4>{name}</h4>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveScheme(code)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="weight-input">
                    <label>Weight %</label>
                    <input
                      type="number"
                      value={weights[code] || 0}
                      onChange={(e) => handleWeightChange(code, e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Allocation Controls */}
            <div className="allocation-controls">
              <div className="preset-controls">
                <select
                  value={allocationPreset}
                  onChange={(e) => setAllocationPreset(e.target.value)}
                >
                  {Object.keys(ALLOCATION_PRESETS).map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
                <button onClick={applyPreset}>Apply Preset</button>
                <button onClick={normalizeWeights}>Normalize to 100%</button>
              </div>
              <div className="weight-status">
                <span>Total Weight: {totalWeight.toFixed(1)}%</span>
                {Math.abs(totalWeight - 100) > 0.01 && (
                  <span className="weight-warning">⚠️ Must equal 100%</span>
                )}
              </div>
            </div>

            {/* Fetch Data Button */}
            <button
              className="fetch-data-btn"
              onClick={fetchNavData}
              disabled={isNavLoading}
            >
              {isNavLoading ? 'Loading...' : '📊 Load Fund Data'}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Options */}
      <div className="analysis-section">
        <h2>🎯 Analysis Options</h2>
        
        <div className="tab-buttons">
          <button
            className={activeTab === 'sip' ? 'active' : ''}
            onClick={() => setActiveTab('sip')}
          >
            🚀 SIP Analysis
          </button>
          <button
            className={activeTab === 'lumpsum' ? 'active' : ''}
            onClick={() => setActiveTab('lumpsum')}
          >
            💰 Lump Sum Analysis
          </button>
          <button
            className={activeTab === 'rolling' ? 'active' : ''}
            onClick={() => setActiveTab('rolling')}
          >
            📊 Rolling Returns
          </button>
        </div>

        <div className="analysis-controls">
          {activeTab === 'rolling' && (
            <div className="rolling-controls">
              <label>Rolling Window (days):</label>
              <input
                type="number"
                value={rollingWindow}
                onChange={(e) => setRollingWindow(Number(e.target.value))}
                min="30"
                max="1095"
                step="30"
              />
            </div>
          )}

          <button
            className="run-analysis-btn"
            onClick={() => {
              if (activeTab === 'sip') runSIPAnalysis();
              else if (activeTab === 'lumpsum') runLumpsumAnalysis();
              else if (activeTab === 'rolling') runRollingAnalysis();
            }}
            disabled={isCalculating || Object.keys(selectedSchemes).length === 0}
          >
            {isCalculating ? 'Calculating...' : `Run ${activeTab === 'sip' ? 'SIP' : activeTab === 'lumpsum' ? 'Lump Sum' : 'Rolling Returns'} Analysis`}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="results-section">
          <h2>📊 Analysis Results</h2>
          
          {results.type === 'sip' && (
            <div className="sip-results">
              {/* Summary Cards */}
              <div className="summary-cards">
                <MetricCard
                  title="Total Investment"
                  value={formatCurrency(results.summary.totalInvestment)}
                  subtitle={`${results.summary.numInstallments} monthly installments`}
                  color="#2E86AB"
                />
                <MetricCard
                  title="Current Value"
                  value={formatCurrency(results.summary.currentValue)}
                  subtitle={`As on ${formatDate(endDate)}`}
                  color="#6A994E"
                />
                <MetricCard
                  title="Absolute Profit"
                  value={formatCurrency(results.summary.profit)}
                  subtitle={`${results.summary.returnPercentage.toFixed(2)}% returns`}
                  color={results.summary.profit > 0 ? "#F18F01" : "#C73E1D"}
                />
                <MetricCard
                  title="CAGR"
                  value={`${results.summary.cagr.toFixed(2)}%`}
                  subtitle={`Over ${((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)} years`}
                  color="#A23B72"
                />
                <MetricCard
                  title="XIRR"
                  value={results.summary.xirr ? `${results.summary.xirr.toFixed(2)}%` : 'N/A'}
                  subtitle="Internal Rate of Return"
                  color="#5C80BC"
                />
              </div>

              {/* Performance Table */}
              <div className="performance-table">
                <h3>Scheme-wise Performance</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Scheme</th>
                      <th>Invested</th>
                      <th>Current Value</th>
                      <th>Profit/Loss</th>
                      <th>Returns %</th>
                      <th>CAGR %</th>
                      <th>XIRR %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.breakdown.map(fund => (
                      <tr key={fund.schemeCode}>
                        <td className="scheme-name">{fund.schemeName}</td>
                        <td>{formatCurrency(fund.totalInvestment)}</td>
                        <td>{formatCurrency(fund.currentValue)}</td>
                        <td className={fund.profit > 0 ? 'positive' : 'negative'}>
                          {formatCurrency(fund.profit)}
                        </td>
                        <td className={fund.returnPercentage > 0 ? 'positive' : 'negative'}>
                          {fund.returnPercentage.toFixed(2)}%
                        </td>
                        <td className={fund.cagr > 0 ? 'positive' : 'negative'}>
                          {fund.cagr.toFixed(2)}%
                        </td>
                        <td>{fund.xirr ? fund.xirr.toFixed(2) + '%' : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Performance Highlights */}
              <div className="performance-highlights">
                <h3>🏆 Performance Highlights</h3>
                <div className="highlights-grid">
                  <div className="highlight-card best">
                    <div className="highlight-icon">🥇</div>
                    <div className="highlight-content">
                      <h4>Best Performer</h4>
                      <p className="scheme-name">{results.bestPerformer.schemeName}</p>
                      <p className="performance-value">{results.bestPerformer.cagr.toFixed(2)}% CAGR</p>
                    </div>
                  </div>
                  <div className="highlight-card worst">
                    <div className="highlight-icon">🥉</div>
                    <div className="highlight-content">
                      <h4>Lowest Performer</h4>
                      <p className="scheme-name">{results.worstPerformer.schemeName}</p>
                      <p className="performance-value">{results.worstPerformer.cagr.toFixed(2)}% CAGR</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Visualizations */}
              <PerformanceMetricsDashboard results={results} type="sip" />
            </div>
          )}

          {results.type === 'lumpsum' && (
            <div className="lumpsum-results">
              {/* Summary Cards */}
              <div className="summary-cards">
                <MetricCard
                  title="Total Investment"
                  value={formatCurrency(results.summary.totalInvestment)}
                  subtitle={`Invested on ${formatDate(lumpsumDate)}`}
                  color="#2E86AB"
                />
                <MetricCard
                  title="Current Value"
                  value={formatCurrency(results.summary.currentValue)}
                  subtitle={`As on ${formatDate(endDate)}`}
                  color="#6A994E"
                />
                <MetricCard
                  title="Absolute Profit"
                  value={formatCurrency(results.summary.profit)}
                  subtitle={`${results.summary.returnPercentage.toFixed(2)}% returns`}
                  color={results.summary.profit > 0 ? "#F18F01" : "#C73E1D"}
                />
              </div>

              {/* Performance Table */}
              <div className="performance-table">
                <h3>Scheme-wise Performance (Lump Sum)</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Scheme</th>
                      <th>Investment Date</th>
                      <th>Invested Amount</th>
                      <th>Current Value</th>
                      <th>Profit/Loss</th>
                      <th>Returns %</th>
                      <th>CAGR %</th>
                      <th>XIRR %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.breakdown.map(fund => (
                      <tr key={fund.schemeCode}>
                        <td className="scheme-name">{fund.schemeName}</td>
                        <td>{formatDate(fund.investmentDate)}</td>
                        <td>{formatCurrency(fund.lumpsumInvestment)}</td>
                        <td>{formatCurrency(fund.currentValue)}</td>
                        <td className={fund.profit > 0 ? 'positive' : 'negative'}>
                          {formatCurrency(fund.profit)}
                        </td>
                        <td className={fund.returnPercentage > 0 ? 'positive' : 'negative'}>
                          {fund.returnPercentage.toFixed(2)}%
                        </td>
                        <td className={fund.cagr > 0 ? 'positive' : 'negative'}>
                          {fund.cagr.toFixed(2)}%
                        </td>
                        <td>{fund.xirr ? fund.xirr.toFixed(2) + '%' : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts and Visualizations */}
              <PerformanceMetricsDashboard results={results} type="lumpsum" />
            </div>
          )}

          {results.type === 'rolling' && (
            <div className="rolling-results">
              <h3>Rolling Returns Analysis ({rollingWindow} days)</h3>
              
              <div className="rolling-schemes">
                {results.results.map((result, index) => (
                  <div key={result.schemeCode} className="rolling-scheme-card">
                    <h4>{result.schemeName}</h4>
                    <div className="rolling-stats">
                      <div className="stat-row">
                        <span>Mean Return:</span>
                        <span className={result.statistics.mean > 0 ? 'positive' : 'negative'}>
                          {result.statistics.mean.toFixed(2)}%
                        </span>
                      </div>
                      <div className="stat-row">
                        <span>Median Return:</span>
                        <span className={result.statistics.median > 0 ? 'positive' : 'negative'}>
                          {result.statistics.median.toFixed(2)}%
                        </span>
                      </div>
                      <div className="stat-row">
                        <span>Standard Deviation:</span>
                        <span>{result.statistics.std.toFixed(2)}%</span>
                      </div>
                      <div className="stat-row">
                        <span>Min Return:</span>
                        <span className="negative">{result.statistics.min.toFixed(2)}%</span>
                      </div>
                      <div className="stat-row">
                        <span>Max Return:</span>
                        <span className="positive">{result.statistics.max.toFixed(2)}%</span>
                      </div>
                      <div className="stat-row">
                        <span>Positive Periods:</span>
                        <span>{result.statistics.positivePeriods.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts and Visualizations */}
              <PerformanceMetricsDashboard results={results} type="rolling" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfolioAnalyzer;
