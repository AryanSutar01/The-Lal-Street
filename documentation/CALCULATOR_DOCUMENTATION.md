# Complete Website Documentation - The Lal Street

**Version:** 2.0  
**Prepared For:** The Lal Street  
**Prepared By:** Development Team  
**Date:** November 28, 2024  
**Last Updated:** December 2024

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Features Documentation](#3-features-documentation)
4. [API Documentation](#4-api-documentation)
5. [Admin Panel Guide](#5-admin-panel-guide)
6. [Deployment Details](#6-deployment-details)
7. [Environment Variables](#7-environment-variables)
8. [Security Protocols](#8-security-protocols)
9. [Analytics & SEO](#9-analytics--seo)
10. [Maintenance & Support](#10-maintenance--support)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Recent Enhancements & Updates](#12-recent-enhancements--updates)
13. [Future Scope & Scalability](#13-future-scope--scalability)
14. [Appendix](#14-appendix)

---

## 1. Project Overview

### 1.1 Introduction

This document provides a complete overview of The Lal Street website, including its architecture,
features, technology stack, deployment details, admin usage, troubleshooting, and maintenance
guidelines.

The Lal Street is a comprehensive web application for analyzing mutual fund portfolio performance
using real-time NAV data. It enables users to calculate SIP returns, lumpsum investments, rolling
returns, and systematic withdrawal plans with industry-standard financial metrics.

### 1.2 Project Summary

**Website Type:** Financial Planning & Portfolio Analysis Platform

**Technology Stack:**

```
Frontend: React 18.3.1 + TypeScript + Vite
Backend: Node.js + Express.js 5.1.
UI Framework: Tailwind CSS + Radix UI
Database: JSON file-based storage (server/data/suggestedBuckets.json)
External APIs: MFAPI (NAV data) + RapidAPI (Fund search)
```
**Hosting Platform:**

```
Frontend: Vercel (Static Site Hosting)
Backend: Render.com (Express Server)
API Functions: Vercel Serverless Functions (for some endpoints)
```

**Purpose:**

```
Provide comprehensive mutual fund portfolio analysis tools
Enable users to calculate returns using various investment strategies
Offer personalized financial planning recommendations
Display curated investment portfolios (Suggested Buckets)
```
### 1.3 Key Deliverables

- Fully responsive React website
- 5 advanced financial calculators
- Admin dashboard for managing suggested portfolios
- Authentication system (admin password-based)
- Real-time NAV data integration
- Financial planning recommendations
- PDF report generation
- Suggested portfolios with auto-recalculation
- City-based locality selection with zone mapping
- Server health monitoring and warm-up mechanism
- Deployment on Vercel + Render
- Comprehensive error handling and loading states
- Mobile-responsive design

## 2. System Architecture

### 2.1 Recent Updates & Enhancements

**Documentation Structure:**
```
All documentation files moved to documentation/ directory
Centralized documentation management
Main README.md points to documentation directory
```

**New Components:**
```
SimpleRollingReturnCard - Displays 3-year mean rolling return in calculators
BucketPerformanceReport - Comprehensive performance analysis modal
SuggestedBucketCard - Enhanced bucket card with projected returns
Background recalculation service - Automatic performance updates
Logger utility - Conditional logging (development/production)
```

**Calculator Enhancements:**
```
Simple Rolling Return Card integrated into all calculators
Bucket performance indicator alongside calculation results
Removed separate performance tabs (integrated into results)
"Total Invested" line added to SIP and SIP+Lumpsum charts
Individual fund lines preserved in SWP and Lumpsum calculators
```

**UI/UX Improvements:**
```
Dark theme hero section with glowing dashboard
Professional 3D graph visualization
Enhanced suggested bucket card design
Projected returns visualization
Improved loading states and error handling
```

**Infrastructure:**
```
CORS configuration improvements for multiple deployments
Background recalculation service
Caching mechanism for suggested buckets
Server health monitoring
Logger utility for production-ready logging
```

### 2.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Browser (Frontend) │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ React App (Vercel) │ │
│ │ - HomePage │ │
│ │ - Investment Plan Calculators │ │
│ │ - Retirement Plan Calculators │ │
│ │ - Financial Planning │ │
│ │ - Admin Panel │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
│ HTTPS API Calls
```

```
▼
┌─────────────────────────────────────────────────────────────┐
│ Express.js Server (Render.com) │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ API Routes: │ │
│ │ - /api/funds/search │ │
│ │ - /api/funds/get-nav-bucket │ │
│ │ - /api/suggested-buckets │ │
│ │ - /api/health │ │
│ │ - /api/calculator/* │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
│ HTTP Requests
▼
┌─────────────────────────────────────────────────────────────┐
│ External APIs │
│ ┌──────────────────────┐ ┌────────────────────────────┐ │
│ │ MFAPI (NAV Data) │ │ RapidAPI (Fund Search) │ │
│ │ api.mfapi.in │ │ Latest Mutual Fund NAV │ │
│ └──────────────────────┘ └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
### 2.3 Frontend Architecture

**Framework:** React 18.3.1 with TypeScript

**Routing Structure:**

```
Client-side routing using hash-based navigation (#home, #investment-plan , etc.)
Page types: home, investment-plan, retirement-plan, financial-planning,
admin
```
**State Management:**

```
React hooks (useState, useEffect)
Component-level state management
LocalStorage for admin authentication tokens
```
**UI Framework:**

```
Tailwind CSS - Utility-rst CSS framework
```

```
Radix UI - Accessible component primitives (48+ components)
Lucide React - Icon library
```
**API Communication:**

```
Native fetch API for HTTP requests
Service layer abstraction (navService.ts, suggestedBucketsService.ts)
Axios used in serverless functions only
```
**Component Structure:**

```
client/src/
├── components/
│ ├── calculators/ # Calculator components
│ │ ├── SIPCalculator.tsx (with SimpleRollingReturnCard)
│ │ ├── LumpsumCalculator.tsx (with SimpleRollingReturnCard)
│ │ ├── SIPLumpsumCalculator.tsx (with SimpleRollingReturnCard)
│ │ ├── SWPCalculator.tsx (with SimpleRollingReturnCard)
│ │ └── RollingCalculator.tsx
│ ├── ui/ # Reusable UI components (Radix UI)
│ ├── HomePage.tsx (with dark theme hero, background recalculation)
│ ├── InvestmentPlanPage.tsx
│ ├── RetirementPlanPage.tsx
│ ├── FinancialPlanningPage.tsx
│ ├── AdminPage.tsx
│ ├── SuggestedBuckets.tsx # Suggested buckets display
│ ├── SuggestedBucketCard.tsx # Enhanced bucket card
│ ├── BucketPerformanceReport.tsx # Performance analysis modal
│ ├── SimpleRollingReturnCard.tsx # Rolling return card for calculators
│ └── ...
├── services/ # API service layer
│ ├── navService.ts
│ └── suggestedBucketsService.ts
├── utils/ # Utility functions
│ ├── bucketPerformanceCalculator.ts
│ ├── bucketRecalculationService.ts
│ ├── logger.ts # Conditional logging utility
│ └── ...
├── config/ # Configuration
└── types/ # TypeScript type definitions
│ └── suggestedBucket.ts
```
**Key Frontend Features:**

```
Server warm-up mechanism on page load
Loading states with spinners and skeleton cards
Error handling and user feedback
Responsive design (mobile-first)
Debounced search for fund lookup
Background recalculation service for bucket performance
Caching mechanism to prevent reloads on tab changes
Conditional logging (development only, errors always)
Simple Rolling Return Card in all calculators
Bucket performance integration in calculator results
```
### 2.4 Backend Architecture


**Runtime:** Node.js (Express.js 5.1.0)

**Server Structure:**

```
server/
├── controllers/ # Request handlers
│ ├── funds.controller.js
│ ├── calculator.controller.js
│ └── suggestedBuckets.controller.js
├── services/ # Business logic
│ ├── navApi.service.js # NAV data fetching
│ ├── fundList.service.js # Fund search
│ └── suggestedBuckets.service.js # Bucket CRUD operations
├── routes/ # API route definitions
│ ├── funds.routes.js
│ ├── calculator.routes.js
│ └── suggestedBuckets.routes.js
├── middleware/ # Express middlewares
│ ├── auth.js # Admin authentication
│ └── validation.js # Input validation
├── logic/ # Financial calculations
│ ├── financialCalculations.js
│ └── sipSimulator.js
├── data/ # JSON file storage
│ └── suggestedBuckets.json
├── utils/ # Utility functions
│ └── logger.js
└── server.js # Entry point
```
**API Design Pattern:**

```
RESTful API design
JSON request/response format
Standardized error responses
```
**Middlewares Used:**

```
CORS - Cross-origin resource sharing conguration
express.json() - JSON body parser
Rate Limiting - express-rate-limit
General API: 100 requests per 15 minutes
```

```
Calculator routes: 20 requests per 5 minutes
Admin Authentication - JWT token-based (via middleware/auth.js)
Error Handling - Centralized error logging
```
**Security Measures:**

```
CORS protection (whitelist-based)
Rate limiting to prevent abuse
Admin password authentication
Input validation on all endpoints
Error message sanitization
```
### 2.5 Database Architecture

**Storage Type:** File-based JSON storage

**Data File:** server/data/suggestedBuckets.json

**Schema Structure:**

```json
{
  "buckets": [
    {
      "id": "unique-uuid",
      "name": "Bucket Name",
      "description": "Description",
      "category": "investment" | "retirement" | "both",
      "riskLevel": "low" | "moderate" | "high",
      "funds": [
        {
          "id": "scheme-code",
          "name": "Fund Name",
          "weightage": 50
        }
      ],
      "performance": {
        "rollingReturns": {
          "bucket": {
            "mean": 12.5,
            "median": 12.0,
            "max": 18.5,
            "min": 5.2,
            "stdDev": 3.2,
            "positivePercentage": 85.0
          },
          "funds": [...]
        },
        "analysisStartDate": "2020-01-01",
        "analysisEndDate": "2024-11-28"
      },
      "isActive": true,
      "createdAt": "2024-11-28T10:00:00.000Z",
      "updatedAt": "2024-11-28T10:00:00.000Z",
      "lastCalculationDate": "2024-11-28T10:00:00.000Z"
    }
  ]
}
```
**Data Access Pattern:**

```
Read entire le on GET requests
Write entire le on CREATE/UPDATE/DELETE operations
File locking via service layer to prevent race conditions
```
**Indexes:** N/A (in-memory ltering)

**Backup Strategy:**

```
JSON le stored in repository (version controlled)
Render.com provides automatic backups for service les
```
## 3. Features Documentation

### 3.1 User Features

**3.1.1 Home Page**

**Features:**

```
Hero section with dark theme, glowing dashboard, and professional 3D graph
Feature highlights (6 key features)
"How It Works" section (3-step guide)
Recommended Portfolios (Suggested Buckets)
Displays curated investment portfolios with enhanced card design
Shows performance metrics (3-year rolling returns)
Projected returns visualization with investment/value/returns bars
Import to Investment or Retirement plan
Background recalculation service for bucket performance
Caching mechanism to prevent reloads on tab changes
```

```
Loading interface with skeleton cards
Server warm-up on page load
Call-to-action buttons
Real-time performance updates
```
**User Actions:**

```
Navigate to different sections
Scroll through recommended portfolios
View detailed performance reports
Import portfolios to calculators
Browse bucket performance with live returns
```
**3.1.2 Investment Plan**

**Features:**

```
Fund selection (2-5 funds)
Portfolio weightage allocation (must total 100%)
Three calculator options:
SIP Calculator
Lumpsum Calculator
SIP + Lumpsum Calculator
```
**SIP Calculator:**

```
Monthly investment amount
Start date and end date
Portfolio weightage per fund
Results:
Total invested vs current value
Absolute prot/loss
CAGR (Compound Annual Growth Rate)
XIRR (Extended Internal Rate of Return)
Fund-wise performance breakdown
Interactive growth charts with "Total Invested" line
Monthly investment timeline
Simple Rolling Return Card (3-year mean return)
Bucket performance indicator alongside calculation results
```
**Lumpsum Calculator:**

```
One-time investment amount
Start date and end date
Portfolio weightage per fund
Results:
Total investment vs current value
Absolute returns (₹ and %)
CAGR calculation
Fund-wise performance with individual fund bars
Individual fund growth indicators
Performance comparison charts
Simple Rolling Return Card (3-year mean return)
Bucket performance indicator alongside calculation results
```
**SIP + Lumpsum Calculator:**

```
Monthly SIP amount
Total lumpsum amount
Lumpsum distribution strategy:
Upfront (at start)
Back-loaded (at end)
Distributed (monthly)
Results: Combined analysis of SIP + Lumpsum strategies
Interactive growth charts with "Total Invested" line
Simple Rolling Return Card (3-year mean return)
Bucket performance indicator alongside calculation results
```
**3.1.3 Retirement Plan**

**Features:**

```
Fund selection (2-5 funds)
Portfolio weightage allocation
Two calculator options:
SWP Calculator (Systematic Withdrawal Plan)
Rolling Returns Calculator
```
**SWP Calculator:**

```
Three modes:
Normal Simulation: Fixed investment and withdrawal
I Have a Corpus: Calculate safe withdrawal amount
I Have a Target Withdrawal: Calculate required corpus
Parameters:
Purchase date
SWP start date
End date
Withdrawal amount/frequency
Withdrawal strategy (Proportional, Sequential, Risk-based)
Results:
Total invested vs withdrawn
Final corpus remaining (principal vs profit breakdown)
XIRR calculation
Max drawdown
Survival months
Withdrawal ledger (color-coded by date)
Portfolio value charts with individual fund lines
Fund-wise breakdown
Rolling returns table (3-year window)
Fund selection dropdown for chart view
Simple Rolling Return Card (3-year mean return)
Bucket performance indicator alongside calculation results
```
**Rolling Returns Calculator:**

```
Investment strategy: SIP or Lumpsum
Rolling period: Monthly or Daily
Window size (in months)
Results:
Rolling returns statistics
Distribution charts
Fund-wise comparison
```
**3.1.4 Financial Planning**

**Features:**

```
Comprehensive financial planning form
Input elds:
Personal details (age, marital status, DOB)
Income and expenses
Dependents (spouse, kids with DOBs)
Existing investments
Loans and liabilities
City/Locality selection (with zone mapping)
Calculations:
Term Insurance Coverage
Based on age, marital status, kids
Coverage until age 60 or kids turn 30
Inated expense-based calculation
Health Insurance Coverage
Zone-based recommendations (1, 2, 3)
Income-based coverage amounts
Emergency Fund
6-12 months of expenses
SIP Recommendations
Based on income, expenses, and existing investments
Results:
```

```
Personalized recommendations
Detailed breakdown of each component
PDF report generation (print dialog)
Actionable financial advice
```
**3.1.5 Fund Search**

**Features:**

```
Real-time fund search
Search by name or scheme code
Debounced search (300ms delay)
Loading indicator
Fund details display:
Scheme code
Fund name
Category
Launch date
Add to portfolio functionality
```
### 3.2 Suggested Buckets Feature

**3.2.1 Suggested Buckets Overview**

**Purpose:**
```
Pre-configured investment portfolios curated by administrators
Displayed on home page for user discovery
One-click import to Investment or Retirement plans
Comprehensive performance analytics
```

**3.2.2 Suggested Bucket Card Features**

**Visual Design:**
```
Enhanced card design with gradient accents
Projected returns visualization (3-year)
Investment/Value/Returns bar chart
Risk level badges (Low/Moderate/High)
Top funds preview
Key metrics display (Avg Return, Positive Periods, Fund Count)
Time period selector (3Y/5Y)
```

**Performance Metrics:**
```
3-year rolling returns (mean, median, max, min, std dev)
Positive period percentage
Projected returns based on mean rolling return
Live returns calculation (Lumpsum & SIP)
```

**3.2.3 Bucket Performance Report**

**Comprehensive Performance Analysis:**

**Portfolio Performance (3-Year Rolling Window):**
```
Positive period percentage
Maximum return
Minimum return
CAGR (5-year)
Rolling returns statistics (mean, median, max, min, std dev)
```

**Individual Fund Performance:**
```
Current NAV
CAGR (3-year & 5-year)
Positive period percentage
Maximum return
Minimum return
Fund-wise breakdown table
```

**Live Returns Calculation:**
```
Lumpsum Investment:
- Standard investment: ₹1,00,000 (3 years ago)
- Current value calculation
- Returns in ₹ and %
- CAGR calculation

SIP Investment:
- Monthly SIP: ₹1,000 for 3 years
- Total invested: ₹36,000
- Current value calculation
- XIRR (annualized returns)
- Returns percentage
```

**Reference Comparison:**
```
Total Investment vs Bucket Value vs Returns
Visual comparison bars
Percentage breakdown
```

**3.2.4 Background Recalculation Service**

**Automatic Performance Updates:**
```
Daily background recalculation of bucket performance
Server load detection (skips if memory > 80%)
5-day threshold for recalculation
Non-blocking background process
Caching to prevent UI reloads on tab changes
```

**Recalculation Process:**
```
Check server health status
Verify last calculation date
Fetch latest NAV data
Calculate rolling returns (3-year window)
Update bucket performance data
Update lastCalculationDate timestamp
```

**3.2.5 Bucket Import Functionality**

**One-Click Import:**
```
Import to Investment Plan: Loads bucket funds into Investment calculators
Import to Retirement Plan: Loads bucket funds into Retirement calculators
Automatic fund selection and weightage allocation
Seamless navigation to respective plan pages
```

### 3.3 Admin Features

**3.3.1 Admin Access**

**Access Methods:**

```
. URL hash: #admin (e.g., https://yoursite.com/#admin)
. Browser console: window.location.hash = 'admin'
. Hidden button on home page (bottom right corner, 2% opacity)
```
**Authentication:**

```
Password-based authentication
Token stored in localStorage
Protected API endpoints
JWT token-based authentication
```
**3.3.2 Admin Dashboard**

**Features:**

```
View all suggested buckets (active and inactive)
Create new buckets with performance calculation
Edit existing buckets
Delete buckets
Activate/Deactivate buckets
Manual performance recalculation trigger
Bucket performance monitoring
```
**3.3.3 Suggested Bucket Management**

**Create Bucket:**

```
. Enter bucket name and description
. Select category (Investment, Retirement, or Both)
. Set risk level (Low, Moderate, High)
. Add funds (1-5 funds)
. Set weightages (must total 100%)
. Click "Create & Calculate Performance"
. System automatically calculates 3-year rolling returns
. Performance calculation includes:
  - Portfolio-level rolling returns (mean, median, max, min, std dev, positive %)
  - Individual fund-level rolling returns
  - Analysis date range (latest fund launch date to today)
  - Daily lumpsum strategy for rolling returns
```
**Edit Bucket:**

```
. Select bucket to edit
. Modify elds (name, description, funds, etc.)
. Recalculate performance if funds changed
. Save changes
```
**Delete Bucket:**

```
Permanently removes bucket from system
Cannot be undone
```
**Activate/Deactivate:**

```
Only active buckets appear on home page
Deactivated buckets remain in admin panel
```
**3.3.4 Performance Calculation**

**Automatic Features:**

```
3-year rolling returns calculation (1095 days window)
Analysis from latest fund launch date to today
Daily lumpsum investment strategy
Statistics: mean, median, max, min, std dev, positive periods %
Both bucket-level and fund-level metrics
Auto-recalculation every 5 days (if server not under load)
Background recalculation service
Caching mechanism to prevent constant reloads
```

**Manual Recalculation:**

```
Triggered when editing bucket (if funds changed)
Triggered when creating new bucket
Can be manually triggered from admin panel
Performance preserved if funds unchanged
```

**Performance Calculation Details:**

```
Rolling Window: 3 years (1095 days)
Method: Daily Lumpsum
Date Range: Latest fund launch date to today
Frequency: Daily rolling (one calculation per day)
Metrics Calculated:
  - Mean return (%)
  - Median return (%)
  - Maximum return (%)
  - Minimum return (%)
  - Standard deviation (%)
  - Positive periods (%)
Both bucket-level and individual fund-level metrics
```
## 4. API Documentation

### 4.1 Base URL

**Production Backend:** https://the-lal-street-1.onrender.com/api

**Local Development:** [http://localhost:5000/api](http://localhost:5000/api)

### 4.2 Authentication

**Admin Authentication:**

```
Uses password-based authentication
Password stored in environment variable ( ADMIN_PASSWORD)
JWT token generated on successful login
Token included in Authorization header: Bearer <token>
Protected endpoints: POST, PUT, DELETE on /api/suggested-buckets
```
**Token Flow:**

```
. Admin enters password in frontend
. Frontend sends password to backend
. Backend validates password against ADMIN_PASSWORD
. Backend generates JWT token
. Token stored in localStorage
. Token included in subsequent admin API requests
```
### 4.3 API Endpoints

**4.3.1 Health Check**

**GET** /api/health

**Description:** Check server health and status

**Authentication:** Not required


**Response:**

```json
{
  "status": "ok",
  "message": "Backend server is running successfully!",
  "uptime": "3600s",
  "timestamp": "2024-11-28T12:00:00.000Z",
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "60MB",
    "rss": "120MB"
  },
  "stats": {
    "totalRequests": 150,
    "errorCount": 2,
    "successRate": "98.67%"
  }
}
```
**Use Cases:**

```
Server warm-up mechanism
Health monitoring
Load detection
```
**4.3.2 Fund Search**

**GET** /api/funds/search

**Description:** Search for mutual funds by name or scheme code

**Authentication:** Not required

**Query Parameters:**

```
q (string, required) - Search query
```
**Example Request:**

```
GET /api/funds/search?q=hdfc
```
**Response:**

```json
[
  {
    "schemeCode": "119551",
    "schemeName": "HDFC Equity Fund - Growth",
    "category": "Equity",
    "fundHouse": "HDFC Mutual Fund"
  },
  {
    "schemeCode": "120503",
    "schemeName": "HDFC Top 100 Fund - Growth",
    "category": "Equity",
    "fundHouse": "HDFC Mutual Fund"
  }
]
```
**Error Responses:**

```
400 Bad Request - Missing query parameter
500 Internal Server Error - Server error
```
**Rate Limit:** 100 requests per 15 minutes per IP

**4.3.3 Get NAV Data (Bucket)**

**POST** /api/funds/get-nav-bucket

**Description:** Fetch historical NAV (Net Asset Value) data for multiple funds

**Authentication:** Not required

**Request Body:**

```json
{
  "schemeCodes": ["119551", "120503", "119552"]
}
```
**Request Body Schema:**

```
schemeCodes (array of strings, required) - Array of fund scheme codes
Maximum 20 funds per request
Minimum 1 fund required
```

**Example Request:**

```
POST /api/funds/get-nav-bucket
Content-Type: application/json
```
```
{
"schemeCodes": ["119551", "120503"]
}
```
**Response:**

```json
[
  {
    "schemeCode": "119551",
    "schemeName": "HDFC Equity Fund - Growth",
    "navData": [
      {
        "date": "2024-11-28",
        "nav": 1250.50
      },
      {
        "date": "2024-11-27",
        "nav": 1248.75
      }
    ],
    "meta": {
      "scheme_start_date": "2000-01-01",
      "scheme_end_date": "2024-11-28"
    }
  }
]
```
**Response Schema:**

```
schemeCode (string) - Fund scheme code
schemeName (string) - Fund name
navData (array) - Array of NAV entries
date (string, YYYY-MM-DD) - NAV date
nav (number) - Net Asset Value
meta (object) - Fund metadata
scheme_start_date (string) - Earliest available NAV date
```

```
scheme_end_date (string) - Latest available NAV date
```
**Error Responses:**

```
400 Bad Request - Missing or invalid schemeCodes array
400 Bad Request - More than 20 funds requested
503 Service Unavailable - External NAV API unavailable
500 Internal Server Error - Server error
```
**Rate Limit:** 100 requests per 15 minutes per IP

**Notes:**

```
NAV data is cached for performance
Data fetched from MFAPI (api.mfapi.in)
Returns data in descending date order (newest rst)
```
**4.3.4 SIP Calculation**

**POST** /api/calculator/sip

**Description:** Calculate SIP (Systematic Investment Plan) returns for a portfolio

**Authentication:** Not required

**Request Body:**

```json
{
  "funds": [
    {
      "schemeCode": "119551",
      "weightage": 50
    },
    {
      "schemeCode": "120503",
      "weightage": 50
    }
  ],
  "monthlyInvestment": 10000,
  "startDate": "2020-01-01",
  "endDate": "2024-11-28"
}
```

**Request Body Schema:**

```
funds (array, required) - Array of fund objects
schemeCode (string, required) - Fund scheme code
weightage (number, required) - Portfolio weight (must total 100)
monthlyInvestment (number, required) - Monthly SIP amount
startDate (string, required, YYYY-MM-DD) - SIP start date
endDate (string, required, YYYY-MM-DD) - Calculation end date
```
**Response:**

```json
{
  "totalInvested": 580000,
  "currentValue": 850000,
  "absoluteProfit": 270000,
  "absoluteProfitPercent": 46.55,
  "cagr": 12.5,
  "xirr": 13.2,
  "fundBreakdown": [...],
  "monthlyData": [...]
}
```
**Error Responses:**

```
400 Bad Request - Invalid input validation
503 Service Unavailable - NAV data unavailable
500 Internal Server Error - Calculation error
```
**Rate Limit:** 20 requests per 5 minutes per IP

**4.3.5 Rolling Returns**

**POST** /api/calculator/rolling-returns

**Description:** Calculate rolling returns for one or more funds

**Authentication:** Not required

**Request Body:**

```json
{
  "schemeCodes": ["119551"],
  "windowDays": 365
}
```
**Request Body Schema:**

```
schemeCodes (array, required) - Array of fund scheme codes
windowDays (number, required) - Rolling window size in days
```
**Response:**

```json
{
  "windowDays": 365,
  "results": [
    {
      "schemeCode": "119551",
      "schemeName": "HDFC Equity Fund",
      "rollingReturns": [...],
      "statistics": {
        "mean": 12.5,
        "median": 12.0,
        "max": 18.5,
        "min": 5.2,
        "stdDev": 3.2
      }
    }
  ],
  "summary": {
    "totalSchemes": 1,
    "successfulSchemes": 1,
    "failedSchemes": 0
  }
}
```
**Error Responses:**

```
400 Bad Request - Invalid input validation
503 Service Unavailable - NAV data unavailable
500 Internal Server Error - Calculation error
```
**Rate Limit:** 20 requests per 5 minutes per IP


**4.3.6 Get All Suggested Buckets**

**GET** /api/suggested-buckets

**Description:** Get all suggested investment buckets

**Authentication:** Not required

**Query Parameters:**

```
activeOnly (boolean, optional) - Filter only active buckets (default: false)
```
**Example Request:**

```
GET /api/suggested-buckets?activeOnly=true
```
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "name": "Conservative Portfolio",
      "description": "Low-risk portfolio for stable returns",
      "category": "investment",
      "riskLevel": "low",
      "funds": [...],
      "performance": {...},
      "isActive": true,
      "createdAt": "2024-11-28T10:00:00.000Z",
      "updatedAt": "2024-11-28T10:00:00.000Z"
    }
  ],
  "count": 1
}
```
**Error Responses:**

```
500 Internal Server Error - Server error
```

**4.3.7 Get Suggested Bucket by ID**

**GET** /api/suggested-buckets/:id

**Description:** Get a single suggested bucket by ID

**Authentication:** Not required

**Path Parameters:**

```
id (string, required) - Bucket UUID
```
**Example Request:**

```
GET /api/suggested-buckets/uuid-123
```
**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Conservative Portfolio",
    ...
  }
}
```
**Error Responses:**

```
404 Not Found - Bucket not found
500 Internal Server Error - Server error
```
**4.3.8 Create Suggested Bucket (Admin Only)**

**POST** /api/suggested-buckets

**Description:** Create a new suggested investment bucket

**Authentication:** Required (Admin token)

**Request Headers:**


```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Request Body:**

```json
{
  "name": "Aggressive Growth Portfolio",
  "description": "High-risk, high-return portfolio",
  "category": "investment",
  "riskLevel": "high",
  "funds": [
    {
      "id": "119551",
      "name": "HDFC Equity Fund",
      "weightage": 50
    },
    {
      "id": "120503",
      "name": "HDFC Top 100 Fund",
      "weightage": 50
    }
  ]
}
```
**Request Body Schema:**

```
name (string, required) - Bucket name
description (string, optional) - Bucket description
category (string, required) - "investment" | "retirement" | "both"
riskLevel (string, required) - "low" | "moderate" | "high"
funds (array, required) - Array of fund objects
id (string, required) - Fund scheme code
name (string, required) - Fund name
weightage (number, required) - Portfolio weight (must total 100)
```
**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-uuid-456",
    "name": "Aggressive Growth Portfolio",
    ...
  },
  "message": "Suggested bucket created successfully"
}
```
**Error Responses:**

```
400 Bad Request - Missing required elds or invalid data
401 Unauthorized - Invalid or missing admin token
500 Internal Server Error - Server error
```
**4.3.9 Update Suggested Bucket (Admin Only)**

**PUT** /api/suggested-buckets/:id

**Description:** Update an existing suggested bucket

**Authentication:** Required (Admin token)

**Path Parameters:**

```
id (string, required) - Bucket UUID
```
**Request Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Request Body:**

```json
{
  "name": "Updated Portfolio Name",
  "isActive": false
}
```
**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Updated Portfolio Name",
    ...
  },
  "message": "Suggested bucket updated successfully"
}
```
**Error Responses:**

```
400 Bad Request - Invalid data
401 Unauthorized - Invalid or missing admin token
404 Not Found - Bucket not found
500 Internal Server Error - Server error
```
**Notes:**

```
Cannot update id or createdAt elds
Performance will be recalculated if funds are changed
```
**4.3.10 Delete Suggested Bucket (Admin Only)**

**DELETE** /api/suggested-buckets/:id

**Description:** Delete a suggested bucket permanently

**Authentication:** Required (Admin token)

**Path Parameters:**

```
id (string, required) - Bucket UUID
```
**Request Headers:**

```
Authorization: Bearer <admin_token>
```
**Response:**

```json
{
  "success": true,
  "message": "Suggested bucket deleted successfully"
}
```

**Error Responses:**

```
401 Unauthorized - Invalid or missing admin token
404 Not Found - Bucket not found
500 Internal Server Error - Server error
```
**Notes:**

```
This action cannot be undone
Bucket is permanently removed from storage
```
### 4.4 Error Codes

**HTTP Status Codes:**

```
200 OK - Request successful
201 Created - Resource created successfully
400 Bad Request - Invalid request parameters
401 Unauthorized - Authentication required
404 Not Found - Resource not found
405 Method Not Allowed - HTTP method not supported
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
503 Service Unavailable - External service unavailable
```
**Error Response Format:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```
### 4.5 Rate Limiting

**General API Routes:**

```
Limit: 100 requests per 15 minutes per IP
Applies to: All /api/* routes except health check
```

**Calculator Routes:**

```
Limit: 20 requests per 5 minutes per IP
Applies to: /api/calculator/* routes
```
**Rate Limit Headers:**
Response includes rate limit information:^

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701172800
```
**Rate Limit Exceeded Response:**

### 4.6 CORS Configuration

**Allowed Origins:**

```
Production frontend URL (Vercel)
Local development URLs: http://localhost:5173 , http://localhost:3000
Congured via ALLOWED_ORIGINS environment variable
```
**CORS Headers:**

```
Access-Control-Allow-Origin: Congured origins
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```
### 4.7 External API Integration

**MFAPI (NAV Data):**

```
Base URL: https://api.mfapi.in/mf/
Endpoint: /{schemeCode}
```
```json
{
  "status": 429,
  "message": "Too many requests from this IP, please try again after 15 minutes"
}
```

```
Returns: Historical NAV data for a fund
Caching: Implemented via LRU cache (1 hour TTL)
Retry Logic: 3 retries with exponential backoff
```
**RapidAPI (Fund Search):**

```
Used for fund metadata and search
Returns: Fund names, scheme codes, categories
```
**Timeout:**

```
NAV API requests: 10 seconds timeout
Total request timeout: 30 seconds (for serverless functions)
```
## 5. Admin Panel Guide

### 5.1 Admin Login

**Access URL:** yourwebsite.com/#admin

**Alternative Access Methods:**

```
. Direct URL hash: Add #admin to your website URL
. Browser console: Run window.location.hash = 'admin'
. Hidden button: Bottom right corner of home page (2% opacity)
```
**Login Process:**

```
. Navigate to admin URL
. Enter admin password (congured in ADMIN_PASSWORD environment variable)
. Click "Login"
. Token stored in browser localStorage
. Redirected to admin dashboard
```
**Security Notes:**

```
Password is never stored in frontend code
Password must match ADMIN_PASSWORD on backend server
Token expires after session (can be congured)
```
### 5.2 Dashboard Overview

**Main Features:**


```
View all suggested buckets
Create new buckets
Edit existing buckets
Delete buckets
Activate/Deactivate buckets
```
**Dashboard Layout:**

```
Header with admin controls
Bucket list/table view
Create/Edit form modal
Performance calculation status
```
### 5.3 How to Add/Edit/Delete Content

**5.3.1 Creating a Suggested Bucket**

**Steps:**

```
. Click "Create New Bucket" button
. Fill in required elds:
Name: Portfolio name (e.g., "Conservative Portfolio")
Description: Brief description (optional)
Category: Select from dropdown
Investment
Retirement
Both
Risk Level: Select from dropdown
Low
Moderate
High
. Add Funds:
Click "Add Fund" button
Search for fund by name or scheme code
Select fund from search results
Enter weightage percentage (must total 100%)
Add up to 5 funds
. Click "Create & Calculate Performance"
. System automatically:
Validates fund data
```

```
Fetches NAV data
Calculates 3-year rolling returns
Saves bucket to database
```
**Performance Calculation:**

```
Automatic upon bucket creation
Uses latest fund launch date to today
Daily lumpsum strategy
1095 days (3 years) rolling window
Calculates: mean, median, max, min, std dev, positive periods %
```
**Validation Rules:**

```
Name: Required, max 200 characters
Funds: Minimum 1, maximum 5
Weightages: Must total exactly 100%
All funds must have valid scheme codes
```
**5.3.2 Editing a Suggested Bucket**

**Steps:**

```
. Click "Edit" button on bucket card/row
. Modify elds as needed:
Name, description, category, risk level
Add/remove funds
Update weightages
. Click "Save Changes"
. If funds changed, performance is automatically recalculated
```
**Performance Recalculation:**

```
Triggered automatically when funds list changes
Can take 10-30 seconds depending on data
Shows loading indicator during calculation
```
**Notes:**

```
Cannot change id or createdAt elds
updatedAt timestamp is automatically updated
Performance data is preserved if funds unchanged
```

**5.3.3 Deleting a Suggested Bucket**

**Steps:**

```
. Click "Delete" button on bucket card/row
. Conrm deletion in dialog
. Bucket is permanently removed
```
**Warning:**

```
This action cannot be undone
Bucket will be removed from all displays
Associated performance data is deleted
```
**5.3.4 Activating/Deactivating Buckets**

**Purpose:** Control which buckets appear on home page

**Steps:**

```
. Toggle "Active" switch on bucket
. Active buckets appear in "Recommended Portfolios" section
. Inactive buckets remain in admin panel but hidden from users
```
**Use Cases:**

```
Temporarily hide buckets without deleting
Seasonal portfolio recommendations
Testing new portfolios before public release
```
### 5.4 File Upload Guidelines

**Note:** The Lal Street does not currently support le uploads. All data is managed through the admin
interface:

```
Funds: Added via search (uses external API)
Performance data: Calculated automatically
Bucket metadata: Entered via forms
```
**Future Considerations:**

```
CSV import for bulk bucket creation
Image uploads for bucket thumbnails
```

```
Export buckets as JSON
```
### 5.5 Performance Calculation Details

**5.5.1 Calculation Parameters**

**Rolling Window:** 3 years (1095 days)
**Method:** Daily Lumpsum^
**Date Range:** Latest fund launch date to today^
**Frequency:** Daily rolling (one calculation per day)^

**5.5.2 Metrics Calculated**

**Bucket-Level:**

```
Mean return (%)
Median return (%)
Maximum return (%)
Minimum return (%)
Standard deviation (%)
Positive periods (%)
```
**Fund-Level:**

```
Same metrics for each individual fund
Weighted portfolio calculations
```
**5.5.3 Auto-Recalculation**

**Trigger Conditions:**

```
Automatic every 5 days (if server not under load)
When bucket is edited (funds changed)
Manual trigger from admin panel
```
**Server Load Detection:**

```
Checks server memory usage
Skips if memory usage > 80%
Non-blocking background process
```
**Recalculation Process:**


```
. Check server health
. Verify last calculation date
. Fetch latest NAV data
. Calculate rolling returns
. Update bucket performance data
. Update lastCalculationDate timestamp
```
### 5.6 Best Practices

**Bucket Naming:**

```
Use clear, descriptive names
Include risk level in name (optional)
Keep names under 50 characters
```
**Fund Selection:**

```
Include 2-5 funds for diversication
Ensure funds have sucient history (3+ years)
Balance across fund categories
```
**Weightage Distribution:**

```
Ensure total equals exactly 100%
Distribute based on risk tolerance
Consider fund correlation
```
**Performance Review:**

```
Review metrics before activating
Monitor performance over time
Update buckets when needed
```
### 5.7 Troubleshooting Admin Issues

**Issue: Cannot Login**

```
Cause: Wrong password or missing ADMIN_PASSWORD env variable
Solution: Verify password matches backend environment variable
```
**Issue: Performance Calculation Fails**

```
Cause: Insucient NAV data or invalid fund codes
```

```
Solution: Check fund launch dates, verify scheme codes are valid
```
**Issue: Buckets Not Appearing on Home Page**

```
Cause: Bucket is inactive or server error
Solution: Check isActive status, verify server logs
```
**Issue: Token Expired**

```
Cause: Session timeout or cleared localStorage
Solution: Re-login to admin panel
```
### 5.8 Admin API Endpoints Summary

**Public Endpoints (No Auth):**

```
GET /api/suggested-buckets - View all buckets
GET /api/suggested-buckets/:id - View single bucket
```
**Protected Endpoints (Admin Auth Required):**

```
POST /api/suggested-buckets - Create bucket
PUT /api/suggested-buckets/:id - Update bucket
DELETE /api/suggested-buckets/:id - Delete bucket
```
**Authentication:**

```
Password: Stored in ADMIN_PASSWORD environment variable
Token: JWT token in Authorization header
Token Storage: Browser localStorage
```
## 6. Deployment Details

### 6.1 Frontend Deployment

**Platform:** Vercel

**Build Command:** npm run build (runs from client directory)

**Output Directory:** client/dist

**Node Version:** 18.x or higher


**Build Configuration:**

```
Framework: Vite
Build tool: Vite (congured in client/vite.config.js)
TypeScript compilation: Enabled
Environment variables: Congured in Vercel dashboard
```
**Environment Variables (Frontend):**

```
VITE_API_URL=https://the-lal-street-1.onrender.com/api
```
**Deployment Process:**

```
. Push code to GitHub repository
. Vercel automatically detects changes
. Runs build command: cd client && npm run build
. Deploys static les to Vercel CDN
. Provides HTTPS URL automatically
```
**Vercel Configuration (vercel.json):**

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
**Serverless Functions:**
Some API endpoints are deployed as Vercel serverless functions:^

```
Location: api/ directory in root
Runtime: Node.js
Functions:
api/funds/search.js
api/funds/get-nav-bucket.js
```

**CDN Configuration:**

```
Automatic CDN distribution via Vercel Edge Network
Global edge locations for fast content delivery
Automatic HTTPS/SSL certicates
Custom domain support
```
**Build Performance:**

```
Typical build time: 30-60 seconds
Cached dependencies for faster rebuilds
Incremental builds supported
```
### 6.2 Backend Deployment

**Platform:** Render.com

**Service Type:** Web Service

**Runtime:** Node.js 18.x or higher

**Build Command:** cd server && npm install

**Start Command:** cd server && node server.js

**Environment Variables (Backend):**

```
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
ADMIN_PASSWORD=your-secure-password-here
RAPIDAPI_KEY=your-rapidapi-key
```
**Render Configuration (render.yaml):**

```
services:
```
- type: web
name: the-lal-street-api
runtime: node
buildCommand: cd server && npm install
startCommand: cd server && node server.js
envVars:


- key: PORT
value: 5000
- key: NODE_ENV
value: production
- key: ALLOWED_ORIGINS
value: https://your-vercel-app.vercel.app

**Server Configuration:**

```
Auto-deploy: Enabled (deploys on git push)
Health check: /api/health endpoint
Startup timeout: 180 seconds
Idle timeout: 300 seconds (for free tier)
```
**Scaling Options:**

```
Free Tier: 1 instance, sleeps after 15 minutes of inactivity
Starter Tier: Always-on option available
Standard/Pro: Auto-scaling based on load
```
**Cold Start Mitigation:**

```
Health check endpoint for warm-up
Server warm-up on frontend page load
10-second timeout for warm-up requests
```
**Database/Storage:**

```
JSON le storage: server/data/suggestedBuckets.json
Persistent disk: Provided by Render (survives deployments)
Backup: Version controlled in Git repository
```
**Logs & Monitoring:**

```
Built-in log aggregation in Render dashboard
Real-time log streaming
Error tracking available
```
### 6.3 Database

**Storage Type:** File-based JSON storage

**Database File:** server/data/suggestedBuckets.json


**Location:** Persistent disk on Render.com

**Structure:**

```json
{
  "buckets": [
    {
      "id": "uuid",
      "name": "...",
      "funds": [...],
      "performance": {...},
      ...
    }
  ]
}
```
**Backup Strategy:**

```
. Git Version Control: JSON file committed to repository
. Render Persistence: File stored on persistent disk
. Manual Backup: Export via admin panel (future feature)
```
**Migration Considerations:**

```
Can migrate to MongoDB/PostgreSQL in future
Current structure supports easy migration
No schema changes needed for file-based approach
```
**Backup Process:**

```
. Download suggestedBuckets.json from Render dashboard
. Commit to Git repository
. Store in separate backup location (optional)
```
### 6.4 Domain Configuration

**Custom Domain Setup:**

**Frontend (Vercel):**

```
. Go to Vercel project settings
. Navigate to "Domains"
. Add custom domain (e.g., http://www.thelalstreet.com )
```

```
. Congure DNS records as instructed by Vercel:
A record: Points to Vercel IP
CNAME record: Points to Vercel domain
. SSL certicate auto-provisioned
```
**Backend (Render):**

```
. Go to Render service settings
. Navigate to "Custom Domain"
. Add domain (e.g., api.thelalstreet.com)
. Update CORS ALLOWED_ORIGINS to include custom domain
. SSL certicate auto-provisioned
```
**DNS Records Example:**

```
Type Name Value
A @ 76.76.21.21
CNAME www cname.vercel-dns.com
CNAME api render-service.onrender.com
```
### 6.5 Continuous Deployment

**GitHub Integration:**

**Frontend (Vercel):**

```
Connected to GitHub repository
Auto-deploys on push to main branch
Preview deployments for pull requests
Branch-based deployments available
```
**Backend (Render):**

```
Connected to GitHub repository
Auto-deploys on push to main branch
Manual deploy option available
Rollback to previous deployment supported
```
**Deployment Workow:**

```
. Developer pushes code to GitHub
. Vercel automatically builds and deploys frontend
```

```
. Render automatically builds and deploys backend
. Both deployments complete in parallel
. Health checks verify successful deployment
```
**Rollback Process:**

```
. Vercel: Go to Deployments → Select previous deployment → Promote to Production
. Render: Go to Deployments → Select previous deployment → Rollback
```
### 6.6 Environment-Specific Configuration

**Development:**

```
Frontend: http://localhost:5173
Backend: http://localhost:5000
API URL: http://localhost:5000/api
```
**Staging (Optional):**

```
Create separate Vercel and Render services
Use branch-based deployments
Test before production merge
```
**Production:**

```
Frontend: Vercel production URL
Backend: Render production URL
All environment variables congured
```
### 6.7 Performance Optimization

**Frontend:**

```
Code splitting via Vite
Lazy loading for routes
Image optimization (if added)
Minication and compression
```
**Backend:**

```
Response caching (NAV data)
Connection pooling (if database added)
```

```
Rate limiting to prevent abuse
Chunked processing for large calculations
```
**CDN:**

```
Vercel Edge Network
Global distribution
Automatic compression
HTTP/2 support
```
### 6.8 Monitoring & Alerts

**Health Checks:**

```
Endpoint: /api/health
Monitors: Server status, memory usage, uptime
Alert threshold: Congured in Render dashboard
```
**Error Tracking:**

```
Render built-in error logs
Vercel function logs
Browser console errors (client-side)
```
**Uptime Monitoring:**

```
Render provides basic uptime metrics
Third-party services (UptimeRobot, Pingdom) can be added
Alert on downtime via email/SMS
```
### 6.9 Troubleshooting Deployment

**Issue: Frontend Build Fails**

```
Check Node.js version compatibility
Verify all dependencies in package.json
Check build logs in Vercel dashboard
Test build locally: cd client && npm run build
```
**Issue: Backend Deployment Fails**

```
Check environment variables are set
```

```
Verify startCommand is correct
Check server logs in Render dashboard
Test locally: cd server && node server.js
```
**Issue: API Connection Errors**

```
Verify VITE_API_URL matches backend URL
Check CORS conguration in backend
Verify ALLOWED_ORIGINS includes frontend URL
Check network tab in browser DevTools
```
**Issue: Environment Variables Not Working**

```
Verify variables are set in platform dashboard
Check variable names match code exactly
Restart service after adding variables
Check for typos in variable values
```
### 6.10 Deployment Checklist

**Pre-Deployment:**

```
All tests passing (if test suite exists)
Environment variables congured
API URLs updated
CORS origins updated
Admin password set
Build commands veried
```
**Deployment:**

```
Push code to GitHub
Verify Vercel build succeeds
Verify Render deployment succeeds
Check health endpoint responds
Test frontend loads correctly
```
**Post-Deployment:**

```
Test all major features
Verify API endpoints work
Check admin panel access
```

```
Test on mobile devices
Monitor error logs
Check performance metrics
```
### 6.11 Scaling Considerations

**Current Limits:**

```
Free tier: 1 instance, sleep after inactivity
File-based storage: Suitable for small-medium data
No database: Limits concurrent writes
```
**Future Scaling Options:**

**Backend:**

```
Upgrade Render tier for always-on
Add database (MongoDB Atlas, PostgreSQL)
Implement connection pooling
Add Redis for caching
```
**Frontend:**

```
Vercel automatically scales
Edge functions for API routes
Image optimization service
```
**Database Migration:**

```
Migrate from JSON to MongoDB/PostgreSQL
Maintain backward compatibility
Implement proper indexes
Add database connection pooling
```
## 7. Environment Variables

### 7.1 Frontend Environment Variables

**Location:** .env le in client/ directory (for local development)

**File:** client/.env (not committed to Git - use .env.example )

**Variables:**


```
# API Base URL (Required for production)
VITE_API_URL=https://the-lal-street-1.onrender.com/api
```
```
# Development Mode (auto-detected)
VITE_MODE=development
```
**Environment-Specic Values:**

**Development (Local):**

```
VITE_API_URL=http://localhost:5000/api
```
**Production (Vercel):**

```
VITE_API_URL=https://the-lal-street-1.onrender.com/api
```
**Usage in Code:**

```
// client/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
(import.meta.env.MODE === 'production'
? 'https://the-lal-street-1.onrender.com/api'
: 'http://localhost:5000/api');
```
**Vercel Configuration:**

```
Set in Vercel Dashboard → Project Settings → Environment Variables
Available for all environments (Production, Preview, Development)
```
### 7.2 Backend Environment Variables

**Location:** .env le in server/ directory (for local development)

**File:** server/.env (not committed to Git - use .env.example )

**Variables:**

```
# Server Configuration
PORT=5000
NODE_ENV=production
```

**Variable Descriptions:**

```
Variable Required Default Description
```
```
PORT No 5000 Server port number (Render auto-assigns)
```
```
NODE_ENV Yes production Environment mode(production/development)
```
```
ALLOWED_ORIG
INS Yes
```
```
http://localhost:
5173
```
```
CORS allowed origins (comma-
separated)
ADMIN_PASSWO
RD Yes - Password for admin authentication
RAPIDAPI_KEY No - API key for RapidAPI services (if used)
```
**Render Configuration:**

```
Set in Render Dashboard → Service → Environment
Can be congured per environment (Production/Preview)
Values are encrypted at rest
```
### 7.3 Environment Variable Setup

**7.3.1 Local Development Setup**

**Frontend:**

```
. Create client/.env le:
```
```
cd client
touch .env
```
```
# CORS Configuration (Comma-separated origins)
ALLOWED_ORIGINS=https://the-lal-street.vercel.app,http://localhost:5173
```
```
# Admin Authentication
ADMIN_PASSWORD=your-secure-password-here
```
```
# External API Keys (if needed)
RAPIDAPI_KEY=your-rapidapi-key-here
```

```
. Add variables:
```
```
VITE_API_URL=http://localhost:5000/api
```
```
. Restart dev server if running
```
**Backend:**

```
. Create server/.env le:
```
```
cd server
touch .env
```
```
. Add variables:
```
```
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
ADMIN_PASSWORD=dev-password-123
```
```
. Restart server
```
**Git Ignore:**
Ensure .env^ les are in .gitignore:

```
# Environment variables
.env
.env.local
.env.production
.env.*.local
```
**7.3.2 Vercel (Frontend) Setup**

**Via Dashboard:**

```
. Go to Vercel Dashboard
. Select your project
. Go to Settings → Environment Variables
. Add variables:
Key: VITE_API_URL
Value: https://the-lal-street-1.onrender.com/api
```

```
Environment: Production, Preview, Development
. Save and redeploy
```
**Via CLI:**

```
vercel env add VITE_API_URL production
# Enter value when prompted
```
**Check Variables:**

```
vercel env ls
```
**7.3.3 Render (Backend) Setup**

**Via Dashboard:**

```
. Go to Render Dashboard
. Select your service
. Go to Environment tab
. Add variables one by one:
NODE_ENV = production
ALLOWED_ORIGINS = https://your-
app.vercel.app,http://localhost:5173
ADMIN_PASSWORD = your-secure-password
. Service will auto-restart after changes
```
**Via** render.yaml **:**

```
envVars:
```
- key: NODE_ENV
value: production
- key: ALLOWED_ORIGINS
value: https://your-app.vercel.app

**Note:** Secrets like ADMIN_PASSWORD should be set manually, not in YAML

### 7.4 Environment Variable Examples

**7.4.1 Development Environment**


**Frontend (** client/.env **):**

```
VITE_API_URL=http://localhost:5000/api
```
**Backend (** server/.env **):**

**PORT=5000**

```
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ADMIN_PASSWORD=dev-admin-123
RAPIDAPI_KEY=dev-key-if-needed
```
**7.4.2 Production Environment**

**Frontend (Vercel):**

```
VITE_API_URL=https://the-lal-street-1.onrender.com/api
```
**Backend (Render):**

```
NODE_ENV=production
ALLOWED_ORIGINS=https://the-lal-street.vercel.app
ADMIN_PASSWORD=secure-production-password-here
RAPIDAPI_KEY=production-api-key
```
### 7.5 Security Best Practices

**Do:**

```
✅ Use strong, unique passwords for ADMIN_PASSWORD
✅ Keep .env les in .gitignore
✅ Use different passwords for dev and production
✅ Rotate passwords periodically
✅ Use environment variables for all secrets
✅ Encrypt sensitive values in production
```
**Don't:**

```
❌ Commit .env les to Git
```

```
❌ Share environment variables in chat/email
❌ Use default or weak passwords
❌ Hardcode secrets in source code
❌ Log environment variable values
```
### 7.6 Troubleshooting

**Issue: Environment Variables Not Working**

**Frontend:**

```
Variables must start with VITE_ to be exposed to client
Restart dev server after adding variables
Check variable names match exactly (case-sensitive)
Verify variables are set in Vercel dashboard
```
**Backend:**

```
Check .env le is in correct directory ( server/)
Restart server after adding variables
Verify variables are set in Render dashboard
Check for typos in variable names
```
**Issue: CORS Errors**

```
Verify ALLOWED_ORIGINS includes your frontend URL
Check for trailing slashes (should be: https://app.vercel.app)
Ensure comma-separated format is correct
Restart backend after changing CORS settings
```
**Issue: Admin Login Fails**

```
Verify ADMIN_PASSWORD matches on backend
Check for extra spaces or hidden characters
Ensure password is set in Render environment variables
Clear browser localStorage and re-login
```
### 7.7 Environment Variable Reference

**Complete List:**

**Frontend (Client):**


```
VITE_API_URL - Backend API base URL
```
**Backend (Server):**

```
PORT - Server port (default: 5000)
NODE_ENV - Environment mode (production/development)
ALLOWED_ORIGINS - CORS allowed origins (comma-separated)
ADMIN_PASSWORD - Admin authentication password
RAPIDAPI_KEY - Optional RapidAPI key
```
**Optional/Future:**

```
DATABASE_URL - Database connection string (if migrated)
REDIS_URL - Redis connection (if caching added)
SESSION_SECRET - Session encryption key (if sessions added)
JWT_SECRET - JWT token secret (if JWT implemented)
```
### 7.8 Migration Checklist

When setting up a new environment:

```
Copy .env.example to .env
Fill in all required variables
Set strong passwords
Congure CORS origins
Test locally rst
Set variables in hosting platform
Verify values are correct
Test deployment
Remove .env from Git (if accidentally committed)
```
## 8. Security Protocols

### 8.1 Authentication

**8.1.1 Admin Authentication**

**Method:** Password-based authentication with JWT tokens

**Flow:**


```
. Admin enters password in frontend login form
. Password sent to backend /api/admin/login endpoint
. Backend validates password against ADMIN_PASSWORD environment variable
. If valid, JWT token is generated and returned
. Token stored in browser localStorage
. Token included in Authorization header for protected requests: Bearer <token>
```
**Password Storage:**

```
Password stored in backend environment variable (ADMIN_PASSWORD)
Never stored in frontend code
Different passwords for development and production
```
**Token Generation:**

```
// Backend JWT token generation
const jwt = require('jsonwebtoken');
const token = jwt.sign(
{ admin: true, timestamp: Date.now() },
process.env.ADMIN_PASSWORD, // Secret key
{ expiresIn: '24h' }
);
```
**Token Validation:**

```
// Middleware validation
const token = req.headers.authorization?.split(' ')[ 1 ];
jwt.verify(token, process.env.ADMIN_PASSWORD);
```
**Best Practices:**

```
✅ Use strong, unique passwords (minimum 16 characters)
✅ Store password in environment variables only
✅ Use different passwords for dev and production
✅ Rotate passwords periodically (every 90 days)
✅ Never log or expose passwords
✅ Use HTTPS in production
```
**8.1.2 Token Expiration**


**Current Implementation:**

```
Token expires after 24 hours
Admin must re-login after expiration
Token invalidated on logout
```
**Token Refresh (Future Enhancement):**

```
Implement refresh token mechanism
Extend session without re-entering password
More secure token rotation
```
### 8.2 Data Validation

**8.2.1 Input Sanitization**

**Frontend Validation:**

```
Form validation using HTML5 constraints
Type checking for numeric inputs
Date range validation
Required eld checks
```
**Backend Validation:**

```
Input validation middleware ( server/middleware/validation.js)
Schema validation for request bodies
Type checking and range validation
Sanitization of user inputs
```
**Example Validation:**

```
// Request body validation
if (!req.body.schemeCodes || !Array.isArray(req.body.schemeCodes)) {
return res.status( 400 ).json({ error: 'Invalid schemeCodes' });
}
```
```
if (req.body.schemeCodes.length > 20 ) {
return res.status( 400 ).json({ error: 'Maximum 20 funds allowed' });
}
```
**Sanitization Rules:**


```
Trim whitespace from strings
Validate numeric ranges (e.g., weightages 0-100)
Validate date formats (YYYY-MM-DD)
Limit array sizes (max 20 funds per request)
Validate scheme codes (numeric strings)
```
**8.2.2 XSS Protection**

**Frontend:**

```
React automatically escapes content in JSX
No direct innerHTML usage
Sanitize user inputs before display
Use dangerouslySetInnerHTML only when necessary
```
**Backend:**

```
JSON responses (no HTML injection)
Content-Type headers set correctly
No user input in HTML responses
```
**Content Security Policy (Future):**

```
Implement CSP headers
Restrict inline scripts
Whitelist trusted sources
```
**8.2.3 SQL Injection Prevention**

**Current Implementation:**

```
No SQL database (file-based JSON storage)
Not applicable to current architecture
```
**Future (If Database Added):**

```
Use parameterized queries
ORM libraries (Prisma, Mongoose)
Input validation before queries
Escape special characters
```

### 8.3 CORS Protection

**Configuration:**

**Allowed Origins:**

```
Congured via ALLOWED_ORIGINS environment variable
Comma-separated list of frontend URLs
Example: https://app.vercel.app,http://localhost:5173
```
**Security Features:**

```
✅ Whitelist-based CORS (only specied origins allowed)
✅ Credentials allowed for authenticated requests
✅ Blocked origins logged for monitoring
✅ Development mode allows localhost
```
**Best Practices:**

```
✅ Only add trusted origins
✅ Remove unused origins
✅ Use HTTPS URLs in production
✅ Review CORS logs regularly
```
### 8.4 Rate Limiting

**General API Routes:**

```
const allowedOrigins = process.env.ALLOWED_ORIGINS
? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
: ['http://localhost:5173'];
```
```
app.use(cors({
origin: function(origin, callback) {
if (!origin) return callback(null, true); // Allow no-origin requests
if (allowedOrigins.includes(origin)) {
callback(null, true);
} else {
callback(new Error('Not allowed by CORS'));
}
},
credentials: true
}));
```

```
const generalLimiter = rateLimit({
windowMs: 15 * 60 * 1000 , // 15 minutes
max: 100 , // 100 requests per window
message: 'Too many requests from this IP, please try again later.',
standardHeaders: true,
legacyHeaders: false,
});
```
**Calculator Routes:**

```
const calculatorLimiter = rateLimit({
windowMs: 5 * 60 * 1000 , // 5 minutes
max: 20 , // 20 requests per window
message: 'Too many calculator requests, please wait.',
});
```
**Rate Limit Headers:**

```
X-RateLimit-Limit : Maximum requests allowed
X-RateLimit-Remaining : Remaining requests
X-RateLimit-Reset : Time when limit resets
```
**Benets:**

```
✅ Prevents abuse and DoS attacks
✅ Protects backend resources
✅ Fair usage for all users
✅ Reduces server load
```
### 8.5 Password Security

**Storage:**

```
Passwords stored in environment variables
Never hardcoded in source code
Different passwords per environment
```
**Password Requirements:**

```
Minimum 16 characters (recommended)
Mix of uppercase, lowercase, numbers, symbols
```

```
Unique passwords per environment
Changed every 90 days
```
**Hashing (Future Enhancement):**

```
Use bcrypt for password hashing (if storing in database)
Salt rounds: 10-12
Never store plaintext passwords
```
**Current Implementation:**

```
Direct comparison with environment variable
Acceptable for single admin user
Should implement hashing if multiple admins added
```
### 8.6 SSL/HTTPS

**Production:**

```
✅ Automatic HTTPS via Vercel (frontend)
✅ Automatic HTTPS via Render (backend)
✅ SSL certicates auto-provisioned
✅ HTTP to HTTPS redirect enabled
```
**Development:**

```
HTTP used for local development
Localhost considered safe for development
```
**Certicate Management:**

```
Vercel: Automatic Let's Encrypt certicates
Render: Automatic SSL certicates
Auto-renewal handled by platforms
```
**Best Practices:**

```
✅ Always use HTTPS in production
✅ Redirect HTTP to HTTPS
✅ Use HSTS headers (future enhancement)
✅ Verify certicate validity
```
### 8.7 Error Handling


**Error Message Sanitization:**

```
// Development: Full error messages
// Production: Generic error messages only
```
```
const errorResponse = {
success: false,
message: 'An error occurred',
error: process.env.NODE_ENV === 'development'
? error.message
: undefined
};
```
**Security Benets:**

```
✅ No sensitive information in production errors
✅ Detailed errors only in development
✅ Error logging without exposing details
✅ Prevents information disclosure
```
**Error Logging:**

```
Errors logged server-side
User-facing messages are generic
Sensitive data never logged
Log rotation implemented
```
### 8.8 API Security

**Authentication:**

```
JWT tokens for admin endpoints
Token validation on each request
Token expiration enforced
```
**Authorization:**

```
Role-based access (admin vs public)
Protected endpoints require authentication
Public endpoints rate-limited
```
**Request Validation:**


```
Validate all request bodies
Check request sizes (prevent large payloads)
Validate content types
Sanitize all inputs
```
**Response Security:**

```
JSON responses only
No sensitive data in responses
Proper HTTP status codes
Secure headers set
```
### 8.9 Security Headers

**Current Headers:**

```
CORS headers congured
Content-Type set to application/json
Rate limit headers included
```
**Recommended Headers (Future):**

```
// Security headers middleware
app.use((req, res, next) => {
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Strict-Transport-Security', 'max-age=31536000');
res.setHeader('Content-Security-Policy', "default-src 'self'");
next();
});
```
**Header Descriptions:**

```
X-Content-Type-Options : Prevents MIME type sning
X-Frame-Options : Prevents clickjacking
X-XSS-Protection : Enables XSS lter
Strict-Transport-Security : Forces HTTPS
Content-Security-Policy: Restricts resource loading
```

### 8.10 Data Protection

**Sensitive Data:**

```
Admin passwords: Environment variables only
API keys: Environment variables only
User data: Currently minimal (no PII stored)
```
**Data Storage:**

```
JSON le storage (read-only for users)
No database with sensitive user data
All data is portfolio/financial calculations
```
**Data Privacy:**

```
No personal information collected
No user accounts or proles
No tracking or analytics (currently)
Calculations performed client-side
```
**GDPR Compliance (If Needed):**

```
No user data collection
No cookies for tracking
Clear privacy policy needed if data collected
```
### 8.11 Security Audit Checklist

**Authentication:**

```
Strong admin passwords
JWT token implementation
Token expiration
Password hashing (if multiple admins)
Refresh token mechanism
```
**Authorization:**

```
Protected admin endpoints
Public endpoints rate-limited
Role-based access (if multiple roles)
```
**Input Validation:**


```
Request body validation
Input sanitization
Type checking
Range validation
```
**CORS:**

```
Whitelist-based CORS
Environment-based configuration
Logging of blocked requests
```
**Rate Limiting:**

```
General API rate limiting
Calculator-specic rate limiting
Rate limit headers
```
**HTTPS:**

```
Automatic SSL certicates
HTTP to HTTPS redirect
HSTS headers
```
**Error Handling:**

```
Error message sanitization
Error logging
Generic production errors
```
**Monitoring:**

```
Security event logging
Failed login attempts tracking
Rate limit violations monitoring
Error rate monitoring
```
### 8.12 Security Incident Response

**If Security Breach Suspected:**

```
. Immediate Actions:
```
```
Change ADMIN_PASSWORD immediately
Review access logs
```

```
Check for unauthorized changes
Invalidate all active tokens
```
```
. Investigation:
```
```
Review server logs
Check Render/Vercel access logs
Identify affected endpoints
Determine scope of breach
```
```
. Remediation:
```
```
Patch vulnerabilities
Update dependencies
Implement additional security measures
Notify users if data compromised
```
```
. Prevention:
```
```
Review security practices
Update documentation
Implement additional monitoring
Conduct security audit
```
### 8.13 Security Best Practices Summary

**Do:**

```
✅ Use environment variables for all secrets
✅ Implement rate limiting
✅ Validate all inputs
✅ Use HTTPS in production
✅ Keep dependencies updated
✅ Monitor error logs
✅ Use strong passwords
✅ Rotate credentials regularly
```
**Don't:**

```
❌ Commit secrets to Git
❌ Expose sensitive data in errors
❌ Allow unlimited API requests
❌ Trust client-side validation alone
```

```
❌ Use default passwords
❌ Log sensitive information
❌ Ignore security warnings
❌ Deploy without testing
```
## 9. Analytics & SEO

### 9.1 Google Analytics Setup

**Current Status:** Not implemented

**Future Implementation:**

```
Google Analytics 4 (GA4) integration
Event tracking for calculator usage
Page view tracking
User interaction tracking
```
**Setup Steps (When Implemented):**

```
. Create Google Analytics property
. Get tracking ID (G-XXXXXXXXXX)
. Add to client/index.html :
```
```
. Congure tracking events in components
```
### 9.2 SEO Implementation

**Current Implementation:**

```
Meta title and description in index.html
Semantic HTML structure
Descriptive page titles
```
**Meta Tags (** client/index.html **):**

```
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX
```
```
<title>The Lal Street - Mutual Fund Portfolio Analysis</title>
<meta name="description" content="Comprehensive mutual fund portfolio ana
```

**Future Enhancements:**

```
Open Graph tags for social sharing
Twitter Card tags
Structured data (JSON-LD)
Sitemap.xml generation
Robots.txt conguration
```
**SEO Best Practices:**

```
✅ Descriptive page titles
✅ Meta descriptions
✅ Semantic HTML
⏳ Sitemap (future)
⏳ Structured data (future)
⏳ Open Graph tags (future)
```
## 10. Maintenance & Support

### 10.1 Backup Strategy

**Current Backups:**

**1. Git Version Control:**

```
All code committed to Git repository
suggestedBuckets.json tracked in repository
Full version history available
Remote repository on GitHub
```
**2. Render Persistent Disk:**

```
server/data/suggestedBuckets.json on persistent disk
Survives service restarts
Backed up by Render infrastructure
```
**Manual Backup Process:**

```
. Download JSON le:
```
```
Via Render dashboard: Access service shell
Download server/data/suggestedBuckets.json
```

```
Store in backup location
```
```
. Git Commit:
```
```
git add server/data/suggestedBuckets.json
git commit -m "Backup: Suggested buckets data"
git push origin main
```
**Backup Frequency:**

```
Recommended: Weekly or before major changes
Automated: Consider GitHub Actions for scheduled backups
```
**Backup Locations:**

```
Primary: Git repository
Secondary: Local backup folder
Tertiary: Cloud storage (Google Drive, Dropbox)
```
### 10.2 Logs Access

**Backend Logs (Render):**

```
. Go to Render Dashboard
. Select your service
. Click "Logs" tab
. View real-time or historical logs
. Filter by date/time range
. Download logs as needed
```
**Frontend Logs (Vercel):**

```
. Go to Vercel Dashboard
. Select your project
. Go to "Deployments"
. Click on deployment
. View "Build Logs" and "Function Logs"
. Check "Runtime Logs" for serverless functions
```
**Client-Side Logs:**

```
Browser DevTools Console (F12)
```

```
Network tab for API requests
Application tab for localStorage/sessionStorage
```
**Log Types:**

```
Access Logs: Request/response information
Error Logs: Exceptions and errors
Application Logs: Custom log messages
Build Logs: Deployment/build information
```
**Log Retention:**

```
Render: 30 days (free tier), longer on paid tiers
Vercel: 30 days for function logs
Git: Permanent (for committed logs)
```
### 10.3 Update Guidelines

**10.3.1 Content Updates**

**Suggested Buckets:**

```
Access admin panel (#admin )
Create/edit/delete buckets via UI
Changes saved automatically
Performance recalculated if funds changed
```
**Calculation Parameters:**

```
Modify calculator logic in:
client/src/utils/financialCalculations.ts
server/logic/financialCalculations.js
Test thoroughly before deployment
Update documentation if formulas change
```
**10.3.2 Code Updates**

**Process:**

```
. Create feature branch: git checkout -b feature-name
. Make changes locally
. Test thoroughly
```

```
. Commit changes: git commit -m "Description"
. Push branch: git push origin feature-name
. Create pull request on GitHub
. Review and merge to main
. Auto-deploy to production (Vercel + Render)
```
**Testing Checklist:**

```
All calculators work correctly
Fund search functions
Admin panel accessible
Mobile responsiveness maintained
No console errors
API endpoints respond correctly
Performance calculations accurate
```
**10.3.3 Dependency Updates**

**Check for Updates:**

```
cd client && npm outdated
cd server && npm outdated
```
**Update Process:**

```
. Update dependencies one at a time
. Test after each update
. Review changelog for breaking changes
. Update lock les: npm install
. Commit and deploy
```
**Security Updates:**

```
Review npm audit results
Prioritize security patches
Update immediately for critical vulnerabilities
```
**Update Frequency:**

```
Monthly: Review and update dependencies
Weekly: Check for security patches
As needed: Major feature updates
```

**10.3.4 System Update Cycle**

**Weekly:**

```
Review error logs
Check server health
Monitor performance metrics
```
**Monthly:**

```
Update dependencies
Review and optimize code
Backup data
Update documentation
```
**Quarterly:**

```
Security audit
Performance optimization
Feature planning
User feedback review
```
### 10.4 Support Contact

**For Technical Issues:**

```
Check logs rst (Render/Vercel dashboards)
Review troubleshooting guide (Section 11)
Check GitHub issues
Contact development team
```
**For Content Updates:**

```
Use admin panel for bucket management
Check admin guide (Section 5)
```
**For Feature Requests:**

```
Submit via GitHub issues
Document use case and requirements
```
## 11. Troubleshooting Guide


### 11.1 Common Issues

**Issue 1: Website Not Loading**

**Symptoms:**

```
Blank page or 404 error
Connection timeout
```
**Possible Causes:**

```
Frontend deployment failed
Incorrect build configuration
Missing environment variables
```
**Solutions:**

```
. Check Vercel deployment status
. Review build logs in Vercel dashboard
. Verify vercel.json configuration
. Check environment variables are set
. Test build locally: cd client && npm run build
```
**Issue 2: API Down / Cannot Connect**

**Symptoms:**

```
"Failed to fetch" errors
Calculator not working
Fund search not loading
```
**Possible Causes:**

```
Backend service down or sleeping
Cold start delay (free tier)
CORS configuration issue
Incorrect API URL
```
**Solutions:**

```
. Check Render service status
. Verify backend URL in VITE_API_URL
. Test health endpoint: https://your-backend.onrender.com/api/health
```

```
. Check CORS configuration in backend
. Verify ALLOWED_ORIGINS includes frontend URL
. Wait 30 seconds for cold start (free tier)
```
**Cold Start Mitigation:**

```
Use /api/health endpoint for warm-up
Implemented in HomePage.tsx
Can manually trigger: fetch('https://backend-url/api/health')
```
**Issue 3: Database Error / Suggested Buckets Missing**

**Symptoms:**

```
Suggested buckets not showing
"Failed to load buckets" error
Empty portfolio list
```
**Possible Causes:**

```
JSON le corrupted or missing
File permission issues
Disk space full (Render)
```
**Solutions:**

```
. Check Render service logs
. Verify server/data/suggestedBuckets.json exists
. Check le permissions
. Restore from Git backup if corrupted:
```
```
git checkout server/data/suggestedBuckets.json
```
```
. Verify disk space in Render dashboard
. Recreate buckets via admin panel if needed
```
**Issue 4: Images Not Uploading**

**Status:** Not applicable - No le upload feature currently

**If Implemented:**


```
Check le size limits
Verify le type allowed
Check storage service configuration
Review error logs
```
**Issue 5: Admin Login Not Working**

**Symptoms:**

```
"Unauthorized" error
Cannot access admin panel
Token expired
```
**Possible Causes:**

```
Wrong password
ADMIN_PASSWORD not set in environment
Token expired or invalid
localStorage cleared
```
**Solutions:**

```
. Verify password matches ADMIN_PASSWORD on backend
. Check environment variable is set in Render
. Clear browser localStorage and re-login
. Check browser console for errors
. Verify admin endpoint is accessible
```
**Debug Steps:**

```
// Check localStorage in browser console
localStorage.getItem('adminToken')
```
```
// Clear and re-login
localStorage.removeItem('adminToken')
window.location.hash = 'admin'
```
**Issue 6: Performance Calculation Fails**

**Symptoms:**


```
"Error calculating performance"
Calculation stuck/loading forever
Page becomes unresponsive
```
**Possible Causes:**

```
Insucient NAV data for funds
Server timeout
Too many funds in bucket
External API unavailable
```
**Solutions:**

```
. Check fund launch dates (need 3+ years of data)
. Verify NAV API is accessible
. Reduce number of funds in bucket (max 5)
. Check server logs for timeout errors
. Verify fund scheme codes are valid
. Try calculation again after a few minutes
```
**Issue 7: CORS Errors**

**Symptoms:**

```
"Access to fetch blocked by CORS policy"
Network errors in browser console
API requests failing
```
**Possible Causes:**

```
Frontend URL not in ALLOWED_ORIGINS
CORS configuration incorrect
Missing credentials ag
```
**Solutions:**

```
. Verify frontend URL in ALLOWED_ORIGINS:
```
```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```
```
. Check no trailing slash in URL
. Restart backend service after CORS change
```

```
. Verify CORS middleware is enabled
. Check browser console for specic CORS error
```
**Issue 8: Rate Limit Exceeded**

**Symptoms:**

```
"Too many requests" error
429 status code
API requests blocked
```
**Possible Causes:**

```
Exceeded 100 requests per 15 minutes
Too many calculator requests (20 per 5 min)
Shared IP address with other users
```
**Solutions:**

```
. Wait for rate limit window to reset
. Check rate limit headers in response
. Reduce frequency of API calls
. Implement client-side caching
. Consider upgrading to paid tier (if needed)
```
**Issue 9: Build Fails on Deployment**

**Symptoms:**

```
Deployment fails in Vercel/Render
Build errors in logs
Missing dependencies
```
**Possible Causes:**

```
Missing dependencies in package.json
Build command incorrect
Node version mismatch
TypeScript compilation errors
```
**Solutions:**


```
. Check build logs for specic error
. Verify all dependencies in package.json
. Test build locally: npm run build
. Check Node version matches platform
. Fix TypeScript errors if any
. Verify build commands in platform settings
```
**Issue 10: Mobile Responsiveness Issues**

**Symptoms:**

```
UI broken on mobile devices
Text overlapping
Buttons not clickable
Layout misaligned
```
**Possible Causes:**

```
Missing responsive CSS classes
Fixed widths instead of responsive
Missing viewport meta tag
CSS media queries incorrect
```
**Solutions:**

```
. Check viewport meta tag in index.html
. Test on actual mobile device or DevTools
. Verify Tailwind responsive classes used
. Check for xed pixel widths
. Use sm:, md:, lg: breakpoints
. Test on multiple screen sizes
```
### 11.2 Error Code Reference

**HTTP Status Codes:**

```
200 OK - Request successful
201 Created - Resource created
400 Bad Request - Invalid request parameters
401 Unauthorized - Authentication required
```

```
404 Not Found - Resource not found
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
503 Service Unavailable - External service unavailable
```
**Error Messages:**

```
"Failed to fetch" - Network/CORS issue
"Invalid admin token" - Authentication failed
"Too many requests" - Rate limit exceeded
"Fund not found" - Invalid scheme code
"Insucient data" - Not enough NAV history
```
### 11.3 Debugging Steps

**1. Check Browser Console:**

```
Open DevTools (F12)
Check Console tab for errors
Review Network tab for failed requests
Check Application tab for localStorage
```
**2. Check Server Logs:**

```
Render dashboard → Service → Logs
Vercel dashboard → Project → Logs
Filter by date/time
Look for error patterns
```
**3. Test API Endpoints:**

```
# Health check
curl https://your-backend.onrender.com/api/health
```
```
# Fund search
curl "https://your-backend.onrender.com/api/funds/search?q=hdfc"
```
```
# Check CORS
curl -H "Origin: https://your-frontend.vercel.app" \
https://your-backend.onrender.com/api/health
```

**4. Verify Environment Variables:**

```
Check Vercel dashboard for frontend vars
Check Render dashboard for backend vars
Verify values are correct
No typos or extra spaces
```
**5. Test Locally:**

```
Run npm run dev2 for full stack
Test in localhost
Compare behavior with production
Check local logs
```
### 11.4 Performance Issues

**Symptoms:**

```
Slow page load
Calculations taking too long
UI freezing
```
**Diagnosis:**

```
. Check browser Performance tab
. Monitor Network requests
. Check server response times
. Review calculation algorithms
```
**Solutions:**

```
Enable chunked processing (already implemented)
Add loading indicators (already implemented)
Implement caching (NAV data cached)
Optimize calculations (future enhancement)
Use server warm-up (already implemented)
```
## 12. Recent Enhancements & Updates

### 12.1 Suggested Buckets Feature (Complete Implementation)

**12.1.1 Overview**

The Suggested Buckets feature provides administrators with the ability to create curated investment portfolios that users can discover, analyze, and import directly into their Investment or Retirement plans.

**Key Features:**
```
✅ Pre-configured portfolios with performance metrics
✅ Enhanced card design with projected returns visualization
✅ Comprehensive performance reports
✅ Live returns calculation (Lumpsum & SIP)
✅ One-click import to calculators
✅ Background recalculation service
✅ Caching mechanism to prevent reloads
```

**12.1.2 Suggested Bucket Card**

**Component:** `SuggestedBucketCard.tsx`

**Features:**
```
- Enhanced visual design with gradient accents
- Projected returns visualization (3-year)
- Investment/Value/Returns bar chart
- Risk level badges (Low/Moderate/High)
- Top funds preview (first 2 funds)
- Key metrics display:
  * Average Return (mean rolling return)
  * Positive Periods Percentage
  * Number of Funds
- Time period selector (3Y/5Y - UI ready)
- One-click import buttons
- View detailed performance button
```

**Performance Calculation:**
```
- Uses 3-year mean rolling return for projection
- Standard investment: ₹1,00,000
- Projects over 3 years using compound interest
- Displays: Investment, Value, Returns (₹ and %)
```

**12.1.3 Bucket Performance Report**

**Component:** `BucketPerformanceReport.tsx`

**Comprehensive Analysis Sections:**

**1. Portfolio Performance (3-Year Rolling Window):**
```
- Positive period percentage
- Maximum return
- Minimum return
- CAGR (5-year)
- Rolling returns statistics table
```

**2. Individual Fund Performance:**
```
- Current NAV
- CAGR (3-year & 5-year)
- Positive period percentage
- Maximum return
- Minimum return
- Fund-wise breakdown table
```

**3. Live Returns:**
```
Lumpsum Investment:
- Investment: ₹1,00,000 (3 years ago)
- Current value calculation
- Returns in ₹ and %
- CAGR calculation

SIP Investment:
- Monthly SIP: ₹1,000 for 3 years
- Total invested: ₹36,000
- Current value calculation
- XIRR (annualized returns)
- Returns percentage

Reference Comparison:
- Total Investment vs Bucket Value vs Returns
- Visual comparison bars
```

**12.1.4 Background Recalculation Service**

**Component:** `bucketRecalculationService.ts`

**Purpose:**
```
Automatically recalculate bucket performance daily
Prevent UI reloads on tab changes
Optimize server load
Maintain fresh performance data
```

**How It Works:**
```
1. Checks server health status
2. Verifies last calculation date (5-day threshold)
3. Checks server memory usage (skips if > 80%)
4. Fetches latest NAV data for all buckets
5. Calculates rolling returns (3-year window)
6. Updates bucket performance data
7. Updates lastCalculationDate timestamp
8. Only updates UI if data actually changed
```

**Caching Mechanism:**
```
- 5-minute TTL for suggested buckets data
- Prevents constant API calls
- Background updates don't trigger UI reloads
- Only updates when actual changes occur
```

**12.1.5 Integration with Calculators**

**Simple Rolling Return Card:**
```
Component: SimpleRollingReturnCard.tsx
Integrated into all calculators:
- SIP Calculator
- Lumpsum Calculator
- SIP + Lumpsum Calculator
- SWP Calculator

Features:
- Displays 3-year mean rolling return
- Calculates automatically when funds are selected
- Shows loading state during calculation
- Error handling with user-friendly messages
- Consistent design across all calculators
```

**Display Location:**
```
- Appears alongside calculation results
- Integrated into results grid
- No separate performance tab needed
- Calculations shown first, performance loads when ready
```

### 12.2 Calculator UI Enhancements

**12.2.1 Chart Improvements**

**SIP Calculator:**
```
- Added "Total Invested" line to chart
- Shows cumulative investment over time
- Helps visualize investment vs returns
- Individual fund lines removed (shows only bucket total)
```

**SIP + Lumpsum Calculator:**
```
- Added "Total Invested" line to chart
- Shows combined SIP + Lumpsum investment
- Individual fund lines removed
```

**Lumpsum Calculator:**
```
- Individual fund bars preserved
- Individual fund growth indicators maintained
- Shows fund-wise performance clearly
```

**SWP Calculator:**
```
- Individual fund lines preserved
- Fund selection dropdown for chart view
- Bucket view vs Individual fund view
- Rolling returns table below safe withdrawal insights
- Principal vs profit breakdown in final corpus
```

**12.2.2 Performance Integration**

**Removed:**
```
- Separate performance tabs
- CalculatorPerformanceTab component
- CalculatorBucketPerformance component
- BucketPerformanceCards component (from top of calculators)
```

**Added:**
```
- SimpleRollingReturnCard in results grid
- Integrated performance display
- Calculations shown first
- Performance loads asynchronously
```

### 12.3 Logger Utility

**Component:** `client/src/utils/logger.ts`

**Purpose:**
```
Conditional logging for development/production
Suppress console logs in production
Always log errors for debugging
```

**API:**
```typescript
logger.log(...args)    // Only in development
logger.warn(...args)   // Only in development
logger.info(...args)   // Only in development
logger.debug(...args)  // Only in development
logger.error(...args)  // Always (production too)
```

**Usage:**
```
Replaced all console.log with logger.log
Replaced console.warn with logger.warn
Replaced console.error with logger.error
Errors always logged for production debugging
Development logs help with debugging
```

**Benefits:**
```
- Cleaner production console
- Better performance (no unnecessary logging)
- Errors still tracked in production
- Development experience unchanged
```

### 12.4 Documentation Organization

**New Structure:**
```
Root directory:
├── README.md (points to documentation/)
└── documentation/
    ├── PROJECT_DOCUMENTATION.md
    ├── CALCULATOR_DOCUMENTATION.md (this file)
    ├── API_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    ├── ENVIRONMENT_VARIABLES.md
    ├── ADMIN_PANEL_GUIDE.md
    ├── SUGGESTED_BUCKETS_COMPLETE.md
    ├── CORS_FIX_NEW_DEPLOYMENT.md
    └── ... (other documentation files)
```

**Benefits:**
```
- Centralized documentation
- Easier to maintain
- Better organization
- Clear structure for client handover
```

### 12.5 CORS Configuration Improvements

**Multiple Deployment Support:**
```
- Support for multiple deployment pairs
- Configurable ALLOWED_ORIGINS
- Better error messages
- Improved logging
```

**Configuration:**
```
ALLOWED_ORIGINS=https://client1.vercel.app,https://client2.vercel.app
```

**Error Handling:**
```
- Clear error messages
- Logs blocked origins
- Lists allowed origins in error
- Helps with troubleshooting
```

### 12.6 Hero Section Redesign

**New Design:**
```
- Dark theme with glowing dashboard
- Professional 3D graph visualization
- Two-column layout
- Growth visualization with up/down movements
- Modern, professional aesthetic
```

**Features:**
```
- Animated background
- 3D transform effects
- Glowing dashboard elements
- Professional chart display
- Responsive design
```

## 13. Future Scope & Scalability

### 13.1 Planned Features

**Short Term:**


```
User accounts and proles
Save calculator results
Email reports
More chart visualizations
```
**Medium Term:**

```
Database migration (MongoDB/PostgreSQL)
Advanced portfolio analytics
Fund comparison tools
Tax calculation features
```
**Long Term:**

```
Mobile app (React Native)
Multi-language support
Real-time notications
AI-based recommendations
```
### 13.2 Scalability Considerations

**Current Limitations:**

```
File-based storage (not scalable)
Single server instance
No database connection pooling
Limited caching
```
**Future Improvements:**

**Database Migration:**

```
Move to MongoDB Atlas or PostgreSQL
Implement connection pooling
Add proper indexing
Enable horizontal scaling
```
**Caching Layer:**

```
Add Redis for caching
Cache NAV data longer
Cache calculation results
Reduce external API calls
```

**Load Balancing:**

```
Multiple backend instances
Load balancer conguration
Session management
Health checks
```
**CDN Optimization:**

```
Static asset caching
Global edge locations
Image optimization
Code splitting
```
### 13.3 Technology Upgrades

**Consider:**

```
GraphQL API (alternative to REST)
WebSocket for real-time updates
Server-side rendering (Next.js)
Microservices architecture
Containerization (Docker)
```
## 14. Appendix

### 14.1 Folder Structure

**Complete Project Structure:**

```
The-Lal-Street/
├── client/ # Frontend React app
│ ├── src/
│ │ ├── components/ # React components
│ │ │ ├── calculators/ # Calculator components
│ │ │ ├── ui/ # Reusable UI components
│ │ │ └── ...
│ │ ├── services/ # API service layer
│ │ ├── utils/ # Utility functions
│ │ ├── config/ # Configuration files
```

```
│ │ ├── hooks/ # Custom React hooks
│ │ └── types/ # TypeScript types
│ ├── public/ # Static assets
│ ├── dist/ # Build output
│ ├── package.json
│ ├── vite.config.js
│ └── tsconfig.json
│
├── server/ # Backend Express app
│ ├── controllers/ # Request handlers
│ ├── services/ # Business logic
│ ├── routes/ # API route definitions
│ ├── middleware/ # Express middlewares
│ ├── logic/ # Financial calculations
│ ├── data/ # JSON data storage
│ ├── utils/ # Utility functions
│ ├── server.js # Entry point
│ └── package.json
│
├── api/ # Vercel serverless functions
│ └── funds/ # API function files
│
├── vercel.json # Vercel configuration
├── render.yaml # Render configuration
├── package.json # Root package.json
└── README.md
```
### 14.2 Libraries Used

**Frontend Dependencies:**

```
react (18.3.1) - UI framework
react-dom (18.3.1) - React DOM rendering
typescript (^5.0.0) - Type checking
vite (^5.0.0) - Build tool
tailwindcss (^3.4.0) - CSS framework
@radix-ui/* - UI component primitives
lucide-react - Icon library
recharts - Chart library
```

```
date-fns - Date utilities
```
**Backend Dependencies:**

```
express (^5.1.0) - Web framework
cors - CORS middleware
express-rate-limit - Rate limiting
dotenv - Environment variables
axios - HTTP client
jsonwebtoken - JWT tokens (if implemented)
```
**Dev Dependencies:**

```
@types/react - TypeScript types
@types/node - Node.js types
typescript - TypeScript compiler
vite - Development server
```
### 14.3 Key Files Reference

**Configuration Files:**

```
client/vite.config.js - Vite configuration
client/tailwind.config.js - Tailwind CSS configuration
client/tsconfig.json - TypeScript cong
vercel.json - Vercel deployment cong
render.yaml - Render deployment cong
```
**Entry Points:**

```
client/src/main.tsx - Frontend entry
client/index.html - HTML template
server/server.js - Backend entry
```
**Data Files:**

```
server/data/suggestedBuckets.json - Bucket storage
```
**Documentation:**

```
README.md - Project overview (points to documentation/)
documentation/
├── PROJECT_DOCUMENTATION.md - Complete project documentation
├── CALCULATOR_DOCUMENTATION.md - This file (complete website docs)
├── API_DOCUMENTATION.md - API reference
├── DEPLOYMENT_GUIDE.md - Deployment instructions
├── ENVIRONMENT_VARIABLES.md - Configuration guide
├── ADMIN_PANEL_GUIDE.md - Admin features
├── SUGGESTED_BUCKETS_COMPLETE.md - Suggested buckets feature
├── CORS_FIX_NEW_DEPLOYMENT.md - CORS troubleshooting
└── ... (other documentation files)
```


