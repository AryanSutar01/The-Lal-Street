# 📈 The Lal Street - Mutual Fund Portfolio Calculator

A comprehensive web application for analyzing mutual fund portfolio performance using real-time NAV data. Calculate SIP returns, lumpsum investments, rolling returns, and systematic withdrawal plans with industry-standard financial metrics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### 🧮 Advanced Calculators

- **SIP Calculator** - Systematic Investment Plan with monthly contributions
- **SIP + Lumpsum Calculator** - Combined strategy with flexible lumpsum distribution
- **Lumpsum Calculator** - One-time investment analysis
- **Rolling Returns Calculator** - Historical performance analysis with custom windows
- **SWP Calculator** - Systematic Withdrawal Plan simulations

### 📊 Financial Metrics

- **XIRR (Extended Internal Rate of Return)** - Accurate returns considering cashflow timing
- **CAGR (Compound Annual Growth Rate)** - Annualized growth percentage
- **Absolute Returns** - Total profit/loss in rupees and percentage
- **Unit Tracking** - Precise NAV-based unit calculations
- **Multi-Fund Portfolio** - Support for 2-5 funds with custom weightage allocation

### 📈 Visualization

- **Interactive Charts** - Line charts with Recharts library
- **Performance Comparison** - Individual fund vs portfolio performance
- **Time-Series Data** - Month-by-month investment and valuation tracking
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS

## 🚀 Live Demo

[View Live Application](https://your-vercel-app.vercel.app) _(Update with your Vercel URL)_

## 🛠️ Tech Stack

### Frontend (`client`)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Chart visualizations
- **Lucide React** - Icon library

### Backend (`server`)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **RapidAPI** - NAV data provider

## 📁 Project Structure

```
The-Lal-Street/
├── client/          # React frontend application
├── server/          # Node.js backend API
└── documentation/   # All project documentation (see below)
```

## 📚 Documentation

All detailed documentation is available in the [`documentation/`](./documentation/) directory:

### Setup & Deployment
- **[Deployment Guide](./documentation/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Quick Start Guide](./documentation/QUICK_START_SEPARATE_DEPLOY.md)** - Quick deployment setup
- **[Environment Variables](./documentation/ENVIRONMENT_VARIABLES.md)** - Configuration guide
- **[Vercel Deployment Guide](./documentation/VERCEL_DEPLOYMENT_GUIDE.md)** - Frontend deployment
- **[Render Setup](./documentation/RENDER_SETUP_INSTRUCTIONS.md)** - Backend deployment

### API & Features
- **[API Documentation](./documentation/API_DOCUMENTATION.md)** - API endpoints and usage
- **[Calculator Documentation](./documentation/CALCULATOR_DOCUMENTATION.md)** - Calculator features and formulas
- **[SWP Strategies](./documentation/swp_strategies_simulator.md)** - SWP calculator documentation

### Admin & Security
- **[Admin Panel Guide](./documentation/ADMIN_PANEL_GUIDE.md)** - Admin features and setup
- **[Admin Authentication](./documentation/ADMIN_AUTHENTICATION_SETUP.md)** - Authentication setup
- **[Admin Access Guide](./documentation/ADMIN_ACCESS_GUIDE.md)** - Access management
- **[Security Protocols](./documentation/SECURITY_PROTOCOLS.md)** - Security best practices

### Development & Maintenance
- **[Testing Guide](./documentation/TESTING_GUIDE.md)** - Testing procedures
- **[Troubleshooting](./documentation/TROUBLESHOOTING_MAINTENANCE.md)** - Common issues and solutions
- **[Suggested Buckets Implementation](./documentation/SUGGESTED_BUCKETS_IMPLEMENTATION.md)** - Feature documentation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install client dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contributing guidelines here]
