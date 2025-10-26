# 📈 Portfolio Analyzer Pro

A comprehensive mutual fund portfolio analysis tool with advanced SIP simulation, lump sum analysis, and rolling returns calculation. Built with React and modern financial analytics.

## ✨ Features

### 🚀 SIP Analysis
- **Monthly SIP Calculator** with precise NAV-based calculations
- **XIRR Calculation** for accurate internal rate of return
- **CAGR Analysis** for compounded annual growth rate
- **Portfolio Allocation** with customizable weight distribution
- **Performance Metrics** including profit/loss, returns percentage
- **Interactive Charts** showing portfolio growth over time

### 💰 Lump Sum Analysis
- **One-time Investment Calculator** with detailed analytics
- **Historical Performance** tracking from investment date
- **Comparative Analysis** across multiple schemes
- **Risk Assessment** with volatility and drawdown metrics

### 📊 Rolling Returns Analysis
- **Configurable Time Windows** (30-1095 days)
- **Statistical Analysis** including mean, median, standard deviation
- **Performance Consistency** metrics
- **Visual Charts** showing rolling returns over time

### 🎯 Portfolio Management
- **Multi-Scheme Support** (up to 5 mutual funds)
- **Preset Allocation Strategies**:
  - Equal Weight
  - Aggressive (Top Heavy)
  - Balanced
- **Custom Weight Distribution** with auto-normalization
- **Real-time Validation** ensuring 100% allocation

### 📈 Advanced Visualizations
- **Portfolio Growth Charts** with interactive tooltips
- **Asset Allocation Pie Charts** showing current distribution
- **Returns Comparison** bar charts (CAGR, XIRR, Returns %)
- **Profit/Loss Analysis** with color-coded indicators
- **Investment Distribution** charts
- **Rolling Returns** area charts for each scheme

## 🛠️ Technical Features

### Financial Calculations
- **XIRR Implementation** using Newton-Raphson method
- **CAGR Calculation** for annualized growth rates
- **Rolling Returns** with configurable time windows
- **Statistical Analysis** (mean, median, std dev, min/max)
- **Currency Formatting** in Indian Rupees (₹)

### UI/UX Features
- **Modern Design** with gradient backgrounds and smooth animations
- **Responsive Layout** optimized for desktop, tablet, and mobile
- **Interactive Elements** with hover effects and transitions
- **Real-time Validation** with helpful error messages
- **Loading States** with spinners and progress indicators
- **Accessibility** with proper ARIA labels and keyboard navigation

### Data Management
- **Debounced Search** for efficient fund lookup
- **State Management** with React hooks
- **Error Handling** with user-friendly messages
- **Data Validation** ensuring input accuracy

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Backend Setup
Make sure the backend server is running on `http://localhost:5000` with the following endpoints:
- `GET /api/funds/search` - Search mutual funds
- `POST /api/funds/navs` - Fetch NAV data for multiple schemes
- `POST /api/calculator/sip` - SIP calculation
- `POST /api/calculator/rolling-returns` - Rolling returns analysis

## 📱 Usage Guide

### 1. Fund Selection
- Use the search bar to find mutual funds by name
- Click on a fund to add it to your portfolio (max 5 funds)
- Remove funds using the ✕ button on each fund card

### 2. Portfolio Configuration
- Set your **Monthly SIP Investment** amount (minimum ₹500)
- Set your **Lump Sum Investment** amount for one-time analysis
- Choose **Start Date**, **Lump Sum Date**, and **End Date**
- Configure **Portfolio Allocation** using presets or custom weights

### 3. Allocation Strategies
- **Equal Weight**: Distributes investment equally across all schemes
- **Aggressive**: Top-heavy allocation (40%, 30%, 20%, 10%)
- **Balanced**: Moderate distribution (30%, 25%, 25%, 20%)
- **Custom**: Set individual weights and normalize to 100%

### 4. Running Analysis
- **SIP Analysis**: Click "Run SIP Analysis" to calculate monthly SIP performance
- **Lump Sum Analysis**: Click "Run Lump Sum Analysis" for one-time investment analysis
- **Rolling Returns**: Set window period and click "Run Rolling Returns Analysis"

### 5. Interpreting Results
- **Summary Cards**: Key metrics at a glance
- **Performance Table**: Detailed scheme-wise breakdown
- **Charts**: Visual representation of portfolio growth and allocation
- **Highlights**: Best and worst performing schemes

## 🎨 Design System

### Color Palette
- **Primary**: #2E86AB (Modern Blue)
- **Success**: #6A994E (Green)
- **Warning**: #F18F01 (Orange)
- **Danger**: #C73E1D (Red)
- **Accent**: #A23B72 (Purple)
- **Info**: #5C80BC (Light Blue)

### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings**: 1.5rem - 2.5rem, font-weight: 600-700
- **Body**: 0.9rem - 1rem, font-weight: 400-500
- **Labels**: 0.85rem, font-weight: 600

### Components
- **Cards**: Rounded corners (12px), subtle shadows, hover effects
- **Buttons**: Gradient backgrounds, smooth transitions
- **Inputs**: Clean borders, focus states, validation feedback
- **Charts**: Responsive, interactive tooltips, consistent colors

## 📊 Financial Metrics Explained

### SIP Analysis
- **Total Investment**: Sum of all monthly SIP installments
- **Current Value**: Current market value of all units
- **Absolute Profit**: Current Value - Total Investment
- **Returns %**: (Profit / Total Investment) × 100
- **CAGR**: Compounded Annual Growth Rate
- **XIRR**: Extended Internal Rate of Return (accounts for timing)

### Lump Sum Analysis
- **Investment Amount**: One-time investment made
- **Current Value**: Current market value of investment
- **Profit/Loss**: Current Value - Investment Amount
- **Returns %**: (Profit / Investment) × 100
- **CAGR**: Annualized growth rate over investment period

### Rolling Returns
- **Mean Return**: Average return over the specified window
- **Median Return**: Middle value of all returns
- **Standard Deviation**: Measure of volatility/risk
- **Min/Max Return**: Lowest and highest returns observed
- **Positive Periods**: Percentage of periods with positive returns

## 🔧 Customization

### Adding New Allocation Presets
Edit the `ALLOCATION_PRESETS` object in `PortfolioAnalyzer.jsx`:

```javascript
const ALLOCATION_PRESETS = {
  'Custom Preset': (count) => {
    // Your custom allocation logic
    return [40, 30, 20, 10]; // Example: 4 schemes
  }
};
```

### Modifying Color Scheme
Update the `COLORS` array in `PortfolioCharts.jsx`:

```javascript
const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E', '#BC4B51', '#5C80BC'];
```

### Adding New Chart Types
Create new chart components in `PortfolioCharts.jsx` and import them in the dashboard.

## 🐛 Troubleshooting

### Common Issues

1. **"Weights must sum to 100%"**
   - Use the "Normalize to 100%" button
   - Or manually adjust weights to total exactly 100%

2. **"No valid data for analysis"**
   - Ensure NAV data is loaded for all selected schemes
   - Check that the date range contains valid data
   - Verify fund codes are correct

3. **Charts not displaying**
   - Check browser console for JavaScript errors
   - Ensure Recharts library is properly installed
   - Verify data format matches chart expectations

4. **Search not working**
   - Check backend API connectivity
   - Verify search endpoint is responding
   - Check network tab for failed requests

### Performance Optimization

- **Large Datasets**: Consider pagination for search results
- **Chart Rendering**: Use `ResponsiveContainer` for better performance
- **State Updates**: Debounce input changes to reduce re-renders
- **Memory Management**: Clear unused data from state

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Recharts** for beautiful, responsive charts
- **React** for the component-based architecture
- **Financial calculation algorithms** based on industry standards
- **Modern UI/UX patterns** inspired by leading financial applications

## 📞 Support

For support, email support@thelalstreet.com or create an issue in the repository.

---

**Built with ❤️ by The Lal Street Team**