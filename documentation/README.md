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
- **Axios** - HTTP client for external APIs
- **Node Cache** - In-memory caching for NAV data

### External APIs
- **MFAPI** - Mutual fund NAV data provider
- **RapidAPI (MF India)** - Fund search and metadata

## 📦 Installation

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Clone Repository

```bash
git clone https://github.com/yourusername/The-Lal-Street.git
cd The-Lal-Street
```

### Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development

# RapidAPI Configuration
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=latest-mutual-fund-nav.p.rapidapi.com

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 📁 Project Structure

```
The-Lal-Street/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── calculators/     # Calculator components
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── FundSearch.tsx   # Fund search component
│   │   │   └── FundBucket.tsx   # Portfolio management
│   │   ├── services/            # API service layer
│   │   ├── utils/               # Utility functions
│   │   ├── config/              # Configuration
│   │   └── styles/              # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend Node.js application
│   ├── controllers/             # Route controllers
│   ├── services/                # Business logic
│   ├── routes/                  # API routes
│   ├── middleware/              # Express middleware
│   ├── logic/                   # Financial calculations
│   ├── utils/                   # Utility functions
│   ├── server.js                # Entry point
│   └── package.json
│
├── vercel.json                  # Vercel deployment config
└── README.md                    # This file
```

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure Environment Variables** in Vercel Dashboard
   - Add all variables from `.env` files
   - Update `VITE_API_URL` to your Vercel API URL

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Alternative: GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
4. Add environment variables
5. Deploy

## 📖 Usage Guide

### 1. Search and Add Funds

- Use the search bar to find mutual funds by name or scheme code
- Add 2-5 funds to your bucket
- Adjust portfolio weightage (must total 100%)

### 2. Select Calculator

Choose from:
- **SIP**: Regular monthly investments
- **SIP + Lumpsum**: Combined strategy
- **Lumpsum**: One-time investment
- **Rolling Returns**: Historical performance analysis
- **SWP**: Systematic withdrawals

### 3. Configure Parameters

- Set investment amounts
- Select date ranges
- Choose distribution mode (for SIP+Lumpsum)

### 4. Analyze Results

View comprehensive metrics:
- Total invested vs current value
- Profit/loss with percentage returns
- CAGR and XIRR
- Individual fund performance
- Interactive performance charts

## 🔧 API Endpoints

### Fund Search
```
GET /api/funds/search?query=hdfc
```

### NAV Data
```
POST /api/calculator/nav
Body: {
  schemeCodes: ["119551", "120503"],
  startDate: "2020-01-01",
  endDate: "2024-10-30"
}
```

### Rolling Returns
```
POST /api/calculator/rolling
Body: {
  schemeCodes: ["119551"],
  windowDays: 365
}
```

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [MFAPI](https://www.mfapi.in/) for providing mutual fund NAV data
- [RapidAPI](https://rapidapi.com/) for fund search API
- [Recharts](https://recharts.org/) for beautiful chart components
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

⭐ **Star this repository if you find it helpful!**
