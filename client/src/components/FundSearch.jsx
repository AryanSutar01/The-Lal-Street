// client/src/components/FundSearch.jsx
import React, { useState, useEffect } from 'react';
import { searchFunds, fetchNavsForBucket } from '../services/fundsApi'; // We still need this
import useDebounce from '../hooks/useDebounce';
import './FundSearch.css';
// --- NEW --- Import the dashboard
import ResultsDashboard from './ResultsDashboard'; 

// --- Helper functions (no change) ---
const getToday = () => new Date().toISOString().split('T')[0];
const findLatestDate = (dates) => dates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
const getEqualWeightedBucket = (bucket) => { /* ... no change ... */ 
  if (bucket.length === 0) return [];
  const weight = 100 / bucket.length;
  let remainder = 100 - (Math.floor(weight) * bucket.length);
  return bucket.map((fund, index) => ({
    ...fund,
    weight: Math.floor(weight) + (index === 0 ? remainder : 0),
  }));
};


function FundSearch() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bucket, setBucket] = useState([]);
  const [totalInvestment, setTotalInvestment] = useState(10000);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [minStartDate, setMinStartDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(getToday());
  const [showCalculator, setShowCalculator] = useState(false);
  
  // --- NEW --- State for our final results
  const [isCalculating, setIsCalculating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [showRollingAnalysis, setShowRollingAnalysis] = useState(false);
  const [rollingWindow, setRollingWindow] = useState(365);
  const [isRollingCalculating, setIsRollingCalculating] = useState(false);
  const [rollingResults, setRollingResults] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- Effects (no change) ---
  useEffect(() => { /* ... fetchFunds ... */
    const fetchFunds = async () => {
      if (debouncedSearchTerm) {
        setIsLoading(true);
        const data = await searchFunds(debouncedSearchTerm);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    };
    fetchFunds();
  }, [debouncedSearchTerm]);
  useEffect(() => { /* ... totalWeight ... */
    const sum = bucket.reduce((acc, fund) => acc + (fund.weight || 0), 0);
    setTotalWeight(sum);
  }, [bucket]);

  // --- HANDLERS ---
  const resetCalculator = () => {
    setShowCalculator(false);
    setMinStartDate('');
    setStartDate('');
    setEndDate(getToday());
    setSimulationResults(null);
  };

  const handleAddFund = (fund) => {
    if (bucket.length >= 5) { return; }
    if (bucket.find(item => item.schemeCode === fund.schemeCode)) { return; }
    const newBucket = [...bucket, { schemeCode: fund.schemeCode, schemeName: fund.schemeName, weight: 0 }];
    setBucket(getEqualWeightedBucket(newBucket));
    setSearchTerm('');
    setResults([]);
    setIsFocused(false);
    resetCalculator();
  };

  const handleRemoveFund = (schemeCode) => {
    const newBucket = bucket.filter(fund => fund.schemeCode !== schemeCode);
    setBucket(getEqualWeightedBucket(newBucket));
    resetCalculator();
  };

  const handleWeightChange = (changedIndex, newValue) => { /* ... no change ... */
    const newWeight = parseInt(newValue, 10) || 0;
    if (newWeight > 100) return;
    let newBucket = bucket.map((f, i) => i === changedIndex ? { ...f, weight: newWeight } : f);
    if (newBucket.length > 1) {
        const adjustIndex = (changedIndex === newBucket.length - 1) ? 0 : changedIndex + 1;
        const otherWeightsSum = newBucket.reduce((acc, f, i) => (i !== adjustIndex ? acc + f.weight : acc), 0);
        const adjustedWeight = 100 - otherWeightsSum;
        // This is the fix:
        newBucket[adjustIndex].weight = (adjustedWeight < 0 || isNaN(adjustedWeight)) ? 0 : adjustedWeight;
    }
    setBucket(newBucket);
    setSimulationResults(null);
  };

  const handleFetchNavData = async () => { /* ... no change to core logic ... */
    if (bucket.length === 0) { return; }
    setIsNavLoading(true);
    const schemeCodes = bucket.map(fund => fund.schemeCode);
    const data = await fetchNavsForBucket(schemeCodes);
    if (!data || data.length !== bucket.length) {
      alert('Failed to fetch data for one or more funds. Please try again.');
      setIsNavLoading(false);
      return;
    }
    setIsNavLoading(false);
    try {
      const inceptionDates = data.map(fund => fund.meta.scheme_start_date);
      const latestInceptionDate = findLatestDate(inceptionDates);
      setMinStartDate(latestInceptionDate);
      setStartDate(latestInceptionDate);
      setShowCalculator(true);
    } catch (error) {
      alert("Failed to read fund inception dates. Cannot proceed.");
    }
  };

  // --- UPDATED --- This is now our final calculation handler
  const handleRunSimulation = async () => {
    if (totalWeight !== 100) { /* ... validation ... */ return; }
    if (new Date(endDate) <= new Date(startDate)) { /* ... validation ... */ return; }

    const calculationPayload = {
      totalInvestment: totalInvestment,
      startDate: startDate,
      endDate: endDate,
      frequency: 'monthly',
      funds: bucket.map(fund => ({
        schemeCode: fund.schemeCode,
        weight: fund.weight,
      })),
    };
    
    setIsCalculating(true);
    setSimulationResults(null);
    try {
      const response = await fetch('http://localhost:5000/api/calculator/sip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Calculation failed on the server.');
      }

      const results = await response.json();
      setSimulationResults(results);

    } catch (error) {
      console.error('Simulation Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRunRollingAnalysis = async () => {
    if (bucket.length === 0) {
      alert('Please add funds to your portfolio first.');
      return;
    }

    setIsRollingCalculating(true);
    setRollingResults(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/calculator/rolling-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeCodes: bucket.map(fund => fund.schemeCode),
          windowDays: rollingWindow,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Rolling returns calculation failed.');
      }

      const results = await response.json();
      setRollingResults(results);
      setShowRollingAnalysis(true);

    } catch (error) {
      console.error('Rolling Analysis Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsRollingCalculating(false);
    }
  };

  const showResults = isFocused && searchTerm.length > 0 && !isLoading;

  return (
    <div className="fund-search-container">
      {/* --- Configuration Section --- */}
      <div className="config-section">
        <div className="section-header">
          <div className="step-number">1</div>
          <div className="step-content">
            <h2>Select & Configure Your Portfolio</h2>
            <p>Search and add up to 5 mutual funds to build your investment portfolio</p>
          </div>
        </div>
        <div className="search-section">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search mutual funds by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            />
            {isLoading && <div className="loading-spinner">⟳</div>}
            {!isLoading && searchTerm && <div className="search-icon">🔍</div>}
          </div>
          {showResults && results.length > 0 && (
            <div className="results-dropdown">
              {results.map(fund => (
                <div 
                  key={fund.schemeCode} 
                  className="result-item" 
                  onMouseDown={() => handleAddFund(fund)}
                >
                  <div className="fund-name">{fund.schemeName}</div>
                  <div className="fund-code">Code: {fund.schemeCode}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {bucket.length > 0 && (
          <div className="portfolio-section">
            <div className="section-header">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Configure Portfolio Allocation</h3>
                <p>Set the weight distribution and monthly investment amount</p>
              </div>
            </div>
            
            <div className="portfolio-grid">
              {bucket.map((fund, index) => (
                <div key={fund.schemeCode} className="fund-card">
                  <div className="fund-header">
                    <div className="fund-info">
                      <h4 className="fund-title">{fund.schemeName}</h4>
                      <span className="fund-code">Code: {fund.schemeCode}</span>
                    </div>
                    <button 
                      className="remove-fund-btn" 
                      onClick={() => handleRemoveFund(fund.schemeCode)}
                      title="Remove fund"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="weight-control">
                    <label htmlFor={`weight-${fund.schemeCode}`}>Allocation %</label>
                    <div className="weight-input-group">
                      <input 
                        type="number" 
                        id={`weight-${fund.schemeCode}`} 
                        className="weight-input" 
                        value={fund.weight} 
                        onChange={(e) => handleWeightChange(index, e.target.value)} 
                        min="0" 
                        max="100"
                      />
                      <span className="weight-suffix">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="portfolio-summary">
              <div className="weight-status">
                <span className="weight-label">Total Allocation:</span>
                <span className={`weight-value ${totalWeight !== 100 ? 'invalid' : 'valid'}`}>
                  {totalWeight}% / 100%
                </span>
              </div>
              {totalWeight !== 100 && (
                <div className="weight-warning">
                  ⚠️ Portfolio allocation must equal 100%
                </div>
              )}
            </div>
            
            <div className="investment-section">
              <label htmlFor="total-investment" className="investment-label">
                Monthly SIP Amount (₹)
              </label>
              <div className="investment-input-group">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  id="total-investment" 
                  className="investment-input" 
                  value={totalInvestment} 
                  onChange={(e) => setTotalInvestment(Number(e.target.value))} 
                  min="500"
                  step="100"
                />
              </div>
              <div className="investment-hint">
                Minimum ₹500 per month recommended
              </div>
            </div>

            {!showCalculator ? (
              <div className="action-section">
                <button 
                  className="primary-button" 
                  onClick={handleFetchNavData} 
                  disabled={isNavLoading || bucket.length === 0}
                >
                  {isNavLoading ? (
                    <>
                      <div className="spinner"></div>
                      Loading Fund Data...
                    </>
                  ) : (
                    <>
                      📊 Set Simulation Period
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="simulation-section">
                <div className="section-header">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Set Simulation Period</h3>
                    <p>Choose the investment period for your SIP simulation</p>
                  </div>
                </div>
                
                <div className="date-range-picker">
                  <div className="date-group">
                    <label htmlFor="start-date" className="date-label">Start Date</label>
                    <input 
                      type="date" 
                      id="start-date" 
                      className="date-input" 
                      value={startDate} 
                      min={minStartDate} 
                      max={getToday()} 
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <small className="date-hint">Earliest: {minStartDate}</small>
                  </div>
                  
                  <div className="date-separator">to</div>
                  
                  <div className="date-group">
                    <label htmlFor="end-date" className="date-label">End Date</label>
                    <input 
                      type="date" 
                      id="end-date" 
                      className="date-input" 
                      value={endDate} 
                      min={startDate} 
                      max={getToday()} 
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <small className="date-hint">Latest: {getToday()}</small>
                  </div>
                </div>
                
                <div className="simulation-buttons">
                  <button 
                    className="simulate-button" 
                    onClick={handleRunSimulation} 
                    disabled={totalWeight !== 100 || totalInvestment <= 0 || isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <div className="spinner"></div>
                        Calculating Returns...
                      </>
                    ) : (
                      <>
                        🚀 Run SIP Simulation
                      </>
                    )}
                  </button>
                  
                  <div className="rolling-analysis-section">
                    <div className="rolling-input-group">
                      <label htmlFor="rolling-window" className="rolling-label">
                        Rolling Window (days):
                      </label>
                      <input 
                        type="number" 
                        id="rolling-window" 
                        className="rolling-input" 
                        value={rollingWindow} 
                        onChange={(e) => setRollingWindow(Number(e.target.value))} 
                        min="30"
                        max="1095"
                        step="30"
                      />
                    </div>
                    
                    <button 
                      className="rolling-button" 
                      onClick={handleRunRollingAnalysis} 
                      disabled={isRollingCalculating}
                    >
                      {isRollingCalculating ? (
                        <>
                          <div className="spinner"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          📊 Rolling Returns Analysis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- SIP Simulation Results --- */}
      {simulationResults && (
        <ResultsDashboard results={simulationResults} />
      )}

      {/* --- Rolling Returns Analysis Results --- */}
      {showRollingAnalysis && rollingResults && (
        <div className="rolling-results-container">
          <h2>📉 Rolling Returns Analysis ({rollingWindow} days)</h2>
          
          <div className="rolling-summary">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Schemes</h3>
                <p>{rollingResults.summary.totalSchemes}</p>
              </div>
              <div className="summary-card">
                <h3>Successful</h3>
                <p className="success">{rollingResults.summary.successfulSchemes}</p>
              </div>
              <div className="summary-card">
                <h3>Failed</h3>
                <p className="error">{rollingResults.summary.failedSchemes}</p>
              </div>
            </div>
          </div>

          <div className="rolling-schemes">
            {rollingResults.results.map((result, index) => (
              <div key={result.schemeCode} className="rolling-scheme-card">
                <h3>{result.schemeName}</h3>
                {result.error ? (
                  <p className="error-message">❌ {result.error}</p>
                ) : (
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
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FundSearch;