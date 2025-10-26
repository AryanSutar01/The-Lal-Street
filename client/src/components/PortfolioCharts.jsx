import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart } from 'recharts';

// Color palette
const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E', '#BC4B51', '#5C80BC'];

// Helper functions
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB');
};

// Custom tooltip for currency values
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-item" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Portfolio Growth Chart Component
export const PortfolioGrowthChart = ({ results, type = 'sip' }) => {
  if (!results || !results.breakdown) return null;

  // Prepare chart data
  const chartData = [];
  const schemes = results.breakdown;
  
  if (schemes.length === 0) return null;

  // Get all unique dates from all schemes
  const allDates = new Set();
  schemes.forEach(scheme => {
    if (scheme.growthData) {
      scheme.growthData.forEach(item => {
        allDates.add(item.date);
      });
    }
  });

  const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

  // Create data points for each date
  sortedDates.forEach(date => {
    const dataPoint = { date };
    let totalInvested = 0;
    let totalValue = 0;

    schemes.forEach((scheme, index) => {
      if (scheme.growthData) {
        const schemeData = scheme.growthData.find(item => item.date === date);
        if (schemeData) {
          dataPoint[scheme.schemeName] = schemeData.value;
          totalValue += schemeData.value;
          if (type === 'sip') {
            totalInvested += schemeData.invested || 0;
          }
        }
      }
    });

    if (type === 'sip') {
      dataPoint['Total Invested'] = totalInvested;
    }
    dataPoint['Total Value'] = totalValue;

    chartData.push(dataPoint);
  });

  return (
    <div className="chart-container">
      <h3>📈 Portfolio Growth Over Time</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(tick) => `₹${tick / 1000}k`}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {type === 'sip' && (
              <Line 
                type="monotone" 
                dataKey="Total Invested" 
                stroke="#888888" 
                strokeDasharray="5 5" 
                name="Total Invested" 
                dot={false}
                strokeWidth={2}
              />
            )}
            
            {schemes.map((scheme, index) => (
              <Line
                key={scheme.schemeCode}
                type="monotone"
                dataKey={scheme.schemeName}
                stroke={COLORS[index % COLORS.length]}
                name={scheme.schemeName}
                dot={false}
                strokeWidth={2.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Asset Allocation Pie Chart Component
export const AssetAllocationChart = ({ results }) => {
  if (!results || !results.breakdown) return null;

  const data = results.breakdown.map((scheme, index) => ({
    name: scheme.schemeName,
    value: scheme.currentValue,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="chart-container">
      <h3>🥧 Current Asset Allocation</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Returns Comparison Bar Chart Component
export const ReturnsComparisonChart = ({ results, metric = 'cagr' }) => {
  if (!results || !results.breakdown) return null;

  const data = results.breakdown.map((scheme, index) => ({
    name: scheme.schemeName.length > 20 ? 
      scheme.schemeName.substring(0, 20) + '...' : 
      scheme.schemeName,
    value: scheme[metric] || 0,
    color: COLORS[index % COLORS.length]
  }));

  const metricLabels = {
    cagr: 'CAGR (%)',
    returnPercentage: 'Returns (%)',
    xirr: 'XIRR (%)'
  };

  return (
    <div className="chart-container">
      <h3>📊 {metricLabels[metric]} Comparison</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
              width={120}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}%`, metricLabels[metric]]}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="value" fill="#2E86AB" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Profit/Loss Comparison Chart Component
export const ProfitLossChart = ({ results }) => {
  if (!results || !results.breakdown) return null;

  const data = results.breakdown.map((scheme, index) => ({
    name: scheme.schemeName.length > 20 ? 
      scheme.schemeName.substring(0, 20) + '...' : 
      scheme.schemeName,
    profit: scheme.profit,
    color: scheme.profit > 0 ? '#10b981' : '#ef4444'
  }));

  return (
    <div className="chart-container">
      <h3>💰 Profit/Loss Comparison</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(tick) => `₹${tick / 1000}k`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
              width={120}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Profit/Loss']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Investment Distribution Chart Component
export const InvestmentDistributionChart = ({ results, type = 'sip' }) => {
  if (!results || !results.breakdown) return null;

  const data = results.breakdown.map((scheme, index) => ({
    name: scheme.schemeName.length > 15 ? 
      scheme.schemeName.substring(0, 15) + '...' : 
      scheme.schemeName,
    value: type === 'sip' ? scheme.totalInvestment : scheme.lumpsumInvestment,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="chart-container">
      <h3>💼 Investment Distribution</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(tick) => `₹${tick / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Investment']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Rolling Returns Chart Component
export const RollingReturnsChart = ({ results }) => {
  if (!results || !results.results) return null;

  return (
    <div className="rolling-charts">
      <h3>📉 Rolling Returns Analysis</h3>
      <div className="rolling-charts-grid">
        {results.results.map((result, index) => (
          <div key={result.schemeCode} className="rolling-chart-container">
            <h4>{result.schemeName}</h4>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    fontSize={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={10}
                    tickFormatter={(tick) => `${tick.toFixed(1)}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(2)}%`, 'Rolling Return']}
                    labelFormatter={formatDate}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rollingReturn"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance Metrics Dashboard Component
export const PerformanceMetricsDashboard = ({ results, type = 'sip' }) => {
  if (!results || !results.breakdown) return null;

  const schemes = results.breakdown;
  const summary = results.summary;

  return (
    <div className="performance-dashboard">
      <h3>📊 Performance Metrics Dashboard</h3>
      
      {/* Portfolio Overview Charts */}
      <div className="dashboard-grid">
        <div className="dashboard-chart">
          <PortfolioGrowthChart results={results} type={type} />
        </div>
        <div className="dashboard-chart">
          <AssetAllocationChart results={results} />
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="dashboard-grid">
        <div className="dashboard-chart">
          <ReturnsComparisonChart results={results} metric="cagr" />
        </div>
        <div className="dashboard-chart">
          <ProfitLossChart results={results} />
        </div>
      </div>

      {/* Investment Distribution */}
      <div className="dashboard-chart">
        <InvestmentDistributionChart results={results} type={type} />
      </div>

      {/* Rolling Returns if available */}
      {results.type === 'rolling' && (
        <RollingReturnsChart results={results} />
      )}
    </div>
  );
};

export default PerformanceMetricsDashboard;




