// client/src/components/ResultsDashboard.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ResultsDashboard.css';

// Helper to format currency
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

// Component for the top metric cards
const MetricCard = ({ title, value, subtitle, color = "#2563eb" }) => (
  <div className="metric-card" style={{ '--card-color': color }}>
    <div className="metric-title">{title}</div>
    <div className="metric-value" style={{ color: color }}>{value}</div>
    <div className="metric-subtitle">{subtitle}</div>
  </div>
);

function ResultsDashboard({ results }) {
  if (!results) return null;

  const { summary, breakdown, chartData } = results;

  // Colors for the chart lines
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <div className="results-container">
      <h2>📊 Portfolio Performance Summary</h2>
      
      {/* --- Metric Cards --- */}
      <div className="metric-grid">
        <MetricCard title="Total Investment" value={formatCurrency(summary.totalInvestment)} subtitle="Across all schemes" color="#2563eb" />
        <MetricCard title="Current Value" value={formatCurrency(summary.currentValue)} subtitle="Latest portfolio value" color="#10b981" />
        <MetricCard title="Absolute Profit" value={formatCurrency(summary.profit)} subtitle={`${summary.returnPercentage.toFixed(2)}% returns`} color={summary.profit > 0 ? "#10b981" : "#ef4444"} />
        <MetricCard title="Portfolio CAGR" value={`${summary.cagr.toFixed(2)}%`} subtitle="Compounded Annual Growth" color="#8b5cf6" />
        <MetricCard title="Portfolio XIRR" value={summary.xirr ? `${summary.xirr.toFixed(2)}%` : 'N/A'} subtitle="Internal Rate of Return" color="#f59e0b" />
        <MetricCard title="Volatility" value={`${summary.volatility ? summary.volatility.toFixed(2) : 'N/A'}%`} subtitle="Annualized volatility" color="#06b6d4" />
        <MetricCard title="Sharpe Ratio" value={summary.sharpeRatio ? summary.sharpeRatio.toFixed(2) : 'N/A'} subtitle="Risk-adjusted returns" color="#84cc16" />
        <MetricCard title="Max Drawdown" value={`${summary.maxDrawdown ? summary.maxDrawdown.toFixed(2) : 'N/A'}%`} subtitle="Maximum decline" color="#f97316" />
      </div>

      {/* --- Interactive Chart --- */}
      <h3>📈 Portfolio Growth Over Time</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(tick) => `₹${tick / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="totalInvested" stroke="#888888" strokeDasharray="5 5" name="Total Invested" dot={false} />
            {breakdown.map((fund, index) => (
              <Line
                key={fund.schemeCode}
                type="monotone"
                dataKey={fund.schemeName}
                stroke={COLORS[index % COLORS.length]}
                name={fund.schemeName}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* --- Detailed Table --- */}
      <h3>📋 Scheme-wise Performance</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Scheme Name</th>
              <th>Invested</th>
              <th>Current Value</th>
              <th>Profit/Loss</th>
              <th>Returns %</th>
              <th>CAGR %</th>
              <th>XIRR %</th>
              <th>Volatility %</th>
              <th>Sharpe Ratio</th>
              <th>Max Drawdown %</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map(fund => (
              <tr key={fund.schemeCode}>
                <td className="scheme-name">{fund.schemeName}</td>
                <td>{formatCurrency(fund.totalInvested)}</td>
                <td>{formatCurrency(fund.currentValue)}</td>
                <td className={fund.profit > 0 ? 'positive' : 'negative'}>{formatCurrency(fund.profit)}</td>
                <td className={fund.returnPercentage > 0 ? 'positive' : 'negative'}>{fund.returnPercentage.toFixed(2)}%</td>
                <td className={fund.cagr > 0 ? 'positive' : 'negative'}>{fund.cagr.toFixed(2)}%</td>
                <td>{fund.xirr ? fund.xirr.toFixed(2) + '%' : 'N/A'}</td>
                <td>{fund.volatility ? fund.volatility.toFixed(2) + '%' : 'N/A'}</td>
                <td>{fund.sharpeRatio ? fund.sharpeRatio.toFixed(2) : 'N/A'}</td>
                <td className="negative">{fund.maxDrawdown ? fund.maxDrawdown.toFixed(2) + '%' : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Performance Highlights --- */}
      {summary.bestPerformer && summary.worstPerformer && (
        <div className="performance-highlights">
          <h3>🏆 Performance Highlights</h3>
          <div className="highlights-grid">
            <div className="highlight-card best">
              <div className="highlight-icon">🥇</div>
              <div className="highlight-content">
                <h4>Best Performer</h4>
                <p className="scheme-name">{summary.bestPerformer.name}</p>
                <p className="performance-value">{summary.bestPerformer.cagr.toFixed(2)}% CAGR</p>
              </div>
            </div>
            <div className="highlight-card worst">
              <div className="highlight-icon">🥉</div>
              <div className="highlight-content">
                <h4>Lowest Performer</h4>
                <p className="scheme-name">{summary.worstPerformer.name}</p>
                <p className="performance-value">{summary.worstPerformer.cagr.toFixed(2)}% CAGR</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ResultsDashboard;   