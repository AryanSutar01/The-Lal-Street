# 📊 Calculator Documentation - The Lal Street

**Version:** 1.0  
**Last Updated:** November 28, 2024

This document provides comprehensive documentation for all calculators available in The Lal Street platform. Each calculator is explained in detail, including inputs, calculation methods, outputs, and the meaning of financial metrics.

---

## Table of Contents

1. [SIP Calculator](#1-sip-calculator)
2. [Lumpsum Calculator](#2-lumpsum-calculator)
3. [SIP + Lumpsum Calculator](#3-sip--lumpsum-calculator)
4. [SWP Calculator](#4-swp-calculator-systematic-withdrawal-plan)
5. [Rolling Returns Calculator](#5-rolling-returns-calculator)
6. [Financial Terms Explained](#6-financial-terms-explained)

---

## 1. SIP Calculator

### 1.1 Overview

The **Systematic Investment Plan (SIP) Calculator** helps you calculate returns on a portfolio where you invest a fixed amount every month across multiple mutual funds. It's perfect for understanding how regular monthly investments grow over time.

**Use Case:** "I invest ₹10,000 every month in my portfolio. How much would it be worth today?"

---

### 1.2 Inputs

#### Required Inputs:

1. **Monthly Investment (₹)**
   - **What it is:** The fixed amount you invest every month
   - **Example:** ₹10,000
   - **Range:** Minimum ₹100 recommended
   - **How it's used:** This amount is divided across your selected funds based on their weightages

2. **Start Date**
   - **What it is:** The date when you start your SIP
   - **Format:** YYYY-MM-DD (e.g., 2020-01-01)
   - **Constraints:** 
     - Must be on or after the latest fund launch date
     - Cannot be in the future
   - **How it's used:** First SIP investment is attempted on this date (adjusted for holidays)

3. **End Date**
   - **What it is:** The date until which you want to calculate returns
   - **Format:** YYYY-MM-DD
   - **Constraints:**
     - Must be after start date
     - Cannot be in the future
   - **How it's used:** Final valuation date for your portfolio

4. **Fund Selection & Weightage**
   - **Funds:** Select 1-5 mutual funds from the search
   - **Weightage:** Percentage allocation for each fund (must total 100%)
   - **Example:** 
     - Fund A: 50%
     - Fund B: 30%
     - Fund C: 20%
   - **How it's used:** Monthly investment is split based on these percentages

---

### 1.3 How Calculations Are Performed

#### Step 1: Generate SIP Investment Dates

The calculator generates monthly investment dates starting from the start date:

- **Planned Date:** The intended investment date (same day each month)
- **Actual Date:** The next available NAV date (adjusts for holidays/weekends)

**Example:**
- Planned: 2020-01-01 (Wednesday)
- If that's a holiday: Actual investment on 2020-01-02 (Thursday)

#### Step 2: Calculate Units Purchased Each Month

For each SIP installment and each fund:

```
Fund Investment = Monthly Investment × (Fund Weightage / 100)
Units Purchased = Fund Investment / NAV on Investment Date
```

**Example:**
- Monthly Investment: ₹10,000
- Fund A Weightage: 50%
- Fund A Investment: ₹10,000 × 0.50 = ₹5,000
- NAV on that date: ₹100
- Units Purchased: ₹5,000 / ₹100 = 50 units

#### Step 3: Track Cumulative Units

Units accumulate over time:

```
Total Units = Sum of all units purchased up to that date
```

#### Step 4: Calculate Current Value

At the end date, using the latest NAV:

```
Current Value = Total Units × Latest NAV
```

#### Step 5: Calculate Returns

**Absolute Returns:**
```
Profit = Current Value - Total Invested
Profit % = (Profit / Total Invested) × 100
```

**CAGR (Compound Annual Growth Rate):**
```
CAGR = ((Current Value / Total Invested) ^ (1 / Years)) - 1
```

**XIRR (Extended Internal Rate of Return):**
- Uses actual investment dates (not just start/end)
- Considers timing of each cash flow
- More accurate for irregular investments
- Calculated using Newton-Raphson method

---

### 1.4 Outputs Explained

#### Portfolio-Level Outputs:

1. **Total Invested (₹)**
   - **What it means:** Sum of all your monthly investments
   - **Formula:** Monthly Investment × Number of Installments
   - **Example:** ₹10,000 × 60 months = ₹6,00,000

2. **Current Value (₹)**
   - **What it means:** Total worth of your portfolio today
   - **Formula:** Sum of (Units × Latest NAV) for all funds
   - **Example:** ₹8,50,000

3. **Profit/Loss (₹)**
   - **What it means:** How much you've gained or lost
   - **Formula:** Current Value - Total Invested
   - **Example:** ₹8,50,000 - ₹6,00,000 = ₹2,50,000 profit

4. **Profit Percentage (%)**
   - **What it means:** Returns as a percentage of investment
   - **Formula:** (Profit / Total Invested) × 100
   - **Example:** (₹2,50,000 / ₹6,00,000) × 100 = 41.67%

5. **CAGR (%)**
   - **What it means:** Average annual return if returns were constant
   - **Interpretation:** 
     - 12% CAGR = Your money doubles in ~6 years
     - Good for comparing investments of different durations
   - **Example:** 13.5% CAGR

6. **XIRR (%)**
   - **What it means:** Real annualized return considering exact timing
   - **Why it matters:** More accurate than CAGR for SIPs
   - **Difference from CAGR:** 
     - CAGR assumes single investment at start
     - XIRR considers each monthly investment separately
   - **Example:** 14.2% XIRR

7. **Installments (count)**
   - **What it means:** Number of monthly investments made
   - **Example:** 60 installments = 5 years of monthly SIP

#### Fund-Level Outputs:

For each fund, you see:
- Total Invested (that fund's portion)
- Units held in that fund
- Current Value (units × latest NAV)
- Profit/Loss for that fund
- CAGR and XIRR for that fund

---

### 1.5 Visual Outputs

1. **Performance Over Time Chart**
   - Shows portfolio value growth
   - Individual fund lines
   - Investment amount line (dashed)
   - Helps visualize growth trajectory

2. **Fund Details Table**
   - Side-by-side comparison
   - Shows which funds performed better
   - Weightage vs. performance analysis

---

## 2. Lumpsum Calculator

### 2.1 Overview

The **Lumpsum Calculator** calculates returns on a one-time investment made at the start date. It's useful for understanding single investment performance.

**Use Case:** "I invested ₹5,00,000 on Jan 1, 2020. What is it worth today?"

---

### 2.2 Inputs

1. **Total Investment (₹)**
   - **What it is:** One-time investment amount
   - **Example:** ₹5,00,000
   - **How it's used:** Split across funds based on weightage

2. **Start Date**
   - **What it is:** Investment date (when you bought the units)
   - **Constraints:** Must be after fund launch date

3. **End Date**
   - **What it is:** Valuation date (current date or future date)

4. **Fund Selection & Weightage**
   - Same as SIP calculator

---

### 2.3 How Calculations Are Performed

#### Step 1: Allocate Investment Across Funds

```
Fund Investment = Total Investment × (Fund Weightage / 100)
```

#### Step 2: Purchase Units at Start Date

For each fund:
```
Units Purchased = Fund Investment / NAV on Start Date
```

**Example:**
- Investment: ₹5,00,000
- Fund A (50%): ₹2,50,000
- NAV on 2020-01-01: ₹100
- Units: ₹2,50,000 / ₹100 = 2,500 units

#### Step 3: Calculate Current Value at End Date

```
Current Value = Units × NAV on End Date
```

#### Step 4: Calculate Returns

**Absolute Returns:**
```
Profit = Current Value - Investment
Profit % = (Profit / Investment) × 100
```

**CAGR:**
```
CAGR = ((Current Value / Investment) ^ (1 / Years)) - 1
```

---

### 2.4 Outputs Explained

1. **Total Investment (₹)**
   - Your one-time investment

2. **Current Bucket Value (₹)**
   - Total portfolio worth today

3. **Absolute Profit (₹ and %)**
   - Simple profit calculation
   - **Interpretation:** Shows total gains/losses

4. **CAGR (%)**
   - Annualized return rate
   - **Note:** For lumpsum, CAGR = XIRR (same thing)

#### Visual Outputs:

1. **Investment vs Current Value Bar Chart**
   - Side-by-side comparison
   - Shows growth for each fund
   - Portfolio total comparison

2. **Fund Performance Table**
   - Units purchased, NAV changes
   - Individual fund returns
   - Principal vs. profit breakdown

---

## 3. SIP + Lumpsum Calculator

### 3.1 Overview

The **SIP + Lumpsum Calculator** combines both investment strategies - regular monthly SIP investments plus additional one-time lumpsum investments. This is useful when you make both regular and occasional investments.

**Use Case:** "I invest ₹10,000 monthly, but also added ₹50,000 as lumpsum in June. What's my total portfolio worth?"

---

### 3.2 Inputs

#### SIP Inputs (Same as SIP Calculator):
- Monthly Investment
- Start Date
- End Date
- Fund Selection & Weightage

#### Lumpsum Inputs:

1. **Enable Lumpsum (Toggle)**
   - Turn on/off lumpsum component

2. **Lumpsum Amount (₹)**
   - One-time investment amount

3. **Lumpsum Date**
   - When you made the lumpsum investment
   - Must be between SIP start and end dates

4. **Lumpsum Distribution Mode:**
   - **By Weightage:** Split across all funds according to portfolio weightage
   - **Specific Fund:** Invest entire lumpsum in one fund

---

### 3.3 How Calculations Are Performed

#### Step 1: Calculate SIP Component
- Same as SIP calculator
- Generates monthly SIP investments

#### Step 2: Add Lumpsum Component
- On lumpsum date, add additional investment
- Units purchased = Lumpsum Amount / NAV on that date
- Units added to existing holdings

#### Step 3: Combined Portfolio
- Total Units = SIP Units + Lumpsum Units
- Track both separately for reporting

#### Step 4: Calculate Returns
- Uses combined cash flows (SIP + lumpsum)
- Calculates overall XIRR considering all investments
- Shows breakdown of SIP vs. Lumpsum contribution

---

### 3.4 Outputs Explained

1. **Total Invested**
   - SIP Invested + Lumpsum Invested

2. **SIP Invested (₹)**
   - Sum of all monthly SIP investments

3. **Lumpsum Invested (₹)**
   - One-time lumpsum amount

4. **Current Value (₹)**
   - Combined portfolio value

5. **Profit/Loss**
   - Total returns on combined investment

6. **CAGR & XIRR**
   - Returns on combined strategy

#### Separate Tracking:
- Shows SIP performance separately
- Shows Lumpsum performance separately
- Combined portfolio view

---

## 4. SWP Calculator (Systematic Withdrawal Plan)

### 4.1 Overview

The **SWP Calculator** simulates withdrawing a fixed amount periodically from your investment. It's useful for retirement planning or creating regular income from investments.

**Use Case:** "I have ₹50,00,000 invested. Can I withdraw ₹20,000 monthly for 20 years?"

---

### 4.2 Inputs

#### Three Calculation Modes:

**Mode 1: Normal Simulation**
- **Total Investment (₹):** Your initial corpus
- **Monthly Withdrawal (₹):** Amount to withdraw each period
- **Calculate:** How long your money will last

**Mode 2: I Have a Corpus**
- **Total Investment (₹):** Your corpus
- **Auto-calculates:** Safe withdrawal amount
- **Uses:** Safe Withdrawal Rate (SWR) formula

**Mode 3: I Have a Target Withdrawal**
- **Desired Monthly Withdrawal (₹):** Your income need
- **Auto-calculates:** Required corpus
- **Optional:** Duration (years) for finite withdrawals

#### Common Inputs:

1. **Investment Date**
   - When you made the initial investment

2. **SWP Start Date**
   - When withdrawals begin
   - Must be after investment date

3. **End Date**
   - End of withdrawal period

4. **Withdrawal Frequency**
   - Monthly
   - Quarterly
   - Custom (every N days)

5. **Withdrawal Strategy** (Advanced):
   - **Proportional:** Withdraw proportionally from all funds
   - **Overweight First:** Sell from funds above target weight (harvest gains)
   - **Risk Bucket:** Sell lowest risk funds first

6. **Risk Factor** (Advanced):
   - **What it is:** Safety multiplier for withdrawal rate
   - **Default:** 3
   - **Higher = More Conservative:** Lower withdrawal rate
   - **Example:** Risk factor 3 means withdrawing 1/3rd of annual return

---

### 4.3 How Calculations Are Performed

#### Step 1: Initial Purchase

```
For each fund:
Units Purchased = (Investment × Weightage) / NAV at Purchase Date
```

#### Step 2: Generate Withdrawal Schedule

- Creates list of withdrawal dates based on frequency
- Example: Monthly from Jan 2020 to Dec 2030

#### Step 3: Simulate Each Withdrawal

For each withdrawal date:

1. **Calculate Portfolio Value**
   ```
   Portfolio Value = Sum of (Units × NAV) for all funds
   ```

2. **Apply Withdrawal Strategy**

   **Proportional:**
   ```
   From each fund:
   Withdrawal Amount = Total Withdrawal × Fund Weightage
   Units Sold = Withdrawal Amount / NAV
   ```

   **Overweight First:**
   - Calculate current weight vs. target weight
   - Sell from funds that are overweight
   - Maintain target allocation

   **Risk Bucket:**
   - Sell from lowest risk funds first
   - Preserves higher risk assets longer

3. **Update Units**
   ```
   Remaining Units = Previous Units - Units Sold
   ```

4. **Check Depletion**
   - If portfolio value < withdrawal amount → Shortfall
   - Track when corpus depletes

#### Step 4: Calculate Metrics

**XIRR:**
- Uses all cash flows (initial investment + withdrawals)
- Negative: Initial investment and withdrawals
- Positive: Final corpus value

**Max Drawdown:**
```
Max Drawdown = ((Peak Value - Lowest Value) / Peak Value) × 100
```
- **What it means:** Worst decline from peak
- **Example:** 25% max drawdown = Portfolio dropped 25% from highest point

**Survival Months:**
- Number of months portfolio lasted
- Depleted on date (if applicable)

---

### 4.4 Outputs Explained

1. **Total Invested (₹)**
   - Initial corpus

2. **Total Withdrawn (₹)**
   - Sum of all withdrawals made

3. **Final Corpus Value (₹)**
   - Remaining portfolio value
   - Includes:
     - **Principal Remaining:** Original investment still intact
     - **Profit Remaining:** Gains still in portfolio

4. **XIRR (%)**
   - **What it means:** Annualized return considering withdrawals
   - **Interpretation:** 
     - Positive XIRR = Gains exceeded withdrawals
     - Negative XIRR = Lost money overall

5. **Max Drawdown (%)**
   - **What it means:** Worst decline from peak value
   - **Significance:**
     - 10% = Mild volatility
     - 25% = Moderate volatility
     - 50%+ = High volatility
   - **Example:** If portfolio peaked at ₹60L and dropped to ₹45L, drawdown = 25%

6. **Survival Duration (months)**
   - How long portfolio lasted
   - "Depleted on [date]" if money ran out

#### Safe Withdrawal Insights:

1. **Portfolio CAGR (%)**
   - Historical annual return of selected funds
   - Weighted by allocation

2. **Annualized Volatility (%)**
   - **What it means:** How much returns fluctuate
   - **Significance:**
     - Low (5-10%): Stable returns
     - Medium (15-20%): Moderate swings
     - High (25%+): Large fluctuations
   - **Example:** 18% volatility = Returns can swing ±18% in a year

3. **Safe Withdrawal Rate (Annual)**
   ```
   SWR = Portfolio CAGR / Risk Factor
   ```
   - **Default Risk Factor:** 3
   - **Example:** 12% CAGR / 3 = 4% safe withdrawal rate
   - **Meaning:** Can safely withdraw 4% annually

4. **Safe Monthly Withdrawal (₹)**
   ```
   Safe Monthly = Investment × (SWR / 12)
   ```
   - **Example:** ₹50L × (4% / 12) = ₹16,667/month

5. **Required Corpus for Target**
   - **Indefinite:** Corpus needed for perpetual withdrawals
   - **Fixed Horizon:** Corpus for N years of withdrawals

#### Visual Outputs:

1. **Portfolio Value Chart**
   - Shows portfolio value over time
   - Investment line (dashed)
   - Withdrawal line
   - Individual fund values

2. **Withdrawal Ledger Table**
   - Detailed record of each withdrawal
   - Which funds were sold
   - Units redeemed
   - Color-coded by withdrawal date

---

## 5. Rolling Returns Calculator

### 5.1 Overview

The **Rolling Returns Calculator** analyzes performance consistency across different time periods. It shows how returns vary over rolling windows, helping understand volatility and consistency.

**Use Case:** "What was my 3-year return starting from each month? How consistent are the returns?"

---

### 5.2 Inputs

1. **Monthly Investment (₹)**
   - Used as lumpsum per window (if lumpsum strategy)
   - Used as monthly SIP amount (if SIP strategy)

2. **Start Date & End Date**
   - Analysis period

3. **Rolling Window**
   - **Value:** Number (e.g., 1, 3, 5)
   - **Unit:** Months or Years
   - **Example:** "3 Years" = 36-month rolling window

4. **Investment Strategy:**
   - **Lumpsum:** Single investment per window
     - Invest the monthly investment amount once at the start of each rolling window
     - Example: For 3-year window, invest ₹10,000 once at the start, calculate return after 3 years
   - **SIP:** Monthly investments throughout each rolling window
     - Invest the monthly investment amount every month for the duration of the window
     - Example: For 3-year window, invest ₹10,000 each month for 36 months

5. **Rolling Period:**
   - **Daily Rolling:** Window moves by one NAV date at a time (for lumpsum strategy only)
     - More granular analysis, shows every possible start date
   - **Monthly Rolling:** Window moves by one month (default for SIP strategy)
     - Shows returns starting from the 1st of each month
     - More practical for monthly investment analysis

---

### 5.3 How Calculations Are Performed

#### Rolling Returns Concept

A rolling return calculates the return for a specific period (e.g., 3 years) starting from different dates. Instead of just one 3-year period, you get multiple 3-year periods, each starting at a different time.

**Example with 3-Year Rolling Window:**
- Period 1: Jan 2020 → Jan 2023 (return: 15%)
- Period 2: Feb 2020 → Feb 2023 (return: 14.5%)
- Period 3: Mar 2020 → Mar 2023 (return: 16.2%)
- ... and so on

This creates a distribution of returns showing consistency.

#### For Lumpsum Strategy:

**Step 1: Generate Rolling Start Dates**
```
Starting from start date, generate all possible window start dates
For daily rolling: Every NAV date
For monthly rolling: 1st of each month
```

**Step 2: For Each Rolling Window**

```
1. Start Date = Rolling window start
2. End Date = Start Date + Window Duration (e.g., 3 years)
3. If End Date > Analysis End Date, skip this window

4. Calculate Investment:
   - Investment Amount = Monthly Investment Amount (used as lumpsum)
   - Split by fund weightage

5. For each fund:
   - Get NAV at Start Date
   - Get NAV at End Date
   - Calculate Annualized Return:
     Return = ((End NAV / Start NAV) ^ (1 / Years)) - 1
```

**Step 3: Aggregate Portfolio Returns**
```
For each rolling window:
- Calculate portfolio value at start
- Calculate portfolio value at end
- Portfolio Return = Weighted average of fund returns
```

#### For SIP Strategy:

**Step 1: Generate Monthly Rolling Start Dates**
```
Create list of month start dates from start date to end date
Only include dates where window can complete (end date within analysis period)
```

**Step 2: For Each Rolling Window**

```
1. Generate monthly SIP dates within the window
   - Start from window start date
   - Continue monthly until window end date

2. For each SIP installment:
   - Invest monthly amount × fund weightage
   - Purchase units at that month's NAV

3. Track cumulative units across all SIPs in the window

4. At window end date:
   - Calculate final value = Total Units × End NAV
   - Create cash flow array with all SIP investments and final value
   - Calculate XIRR for this window
```

**Step 3: Calculate Statistics**
```
For all rolling windows, calculate:
- Mean (average return)
- Median (middle value)
- Max (best period)
- Min (worst period)
- Standard Deviation (volatility measure)
- Positive Periods % (how many windows had positive returns)
```

---

### 5.4 Outputs Explained

#### Rolling Returns Chart

**What it shows:**
- X-axis: Window start dates
- Y-axis: Annualized return percentage (%)
- Line: Return for each rolling window

**How to read:**
- **Smooth line:** Consistent returns (good)
- **Jagged/volatile line:** Inconsistent returns (high volatility)
- **Above zero:** Positive returns for that period
- **Below zero:** Negative returns for that period

#### Statistics Table

1. **Mean (%)**
   - **What it means:** Average return across all rolling windows
   - **Interpretation:** Expected return over similar periods
   - **Example:** 12.5% mean = On average, you'd get 12.5% annual return

2. **Median (%)**
   - **What it means:** Middle value when all returns are sorted
   - **Why it matters:** Less affected by extreme values than mean
   - **Interpretation:** Typical return (half periods better, half worse)
   - **Example:** 12% median vs 12.5% mean = Slightly skewed by good periods

3. **Max (%)**
   - **What it means:** Best performing rolling period
   - **Interpretation:** Best-case scenario return
   - **Example:** 18.5% max = Best 3-year period returned 18.5% annually

4. **Min (%)**
   - **What it means:** Worst performing rolling period
   - **Interpretation:** Worst-case scenario return
   - **Example:** 5.2% min = Worst 3-year period returned 5.2% annually
   - **Significance:** Shows downside risk

5. **Standard Deviation (%)**
   - **What it means:** Measure of volatility (how much returns vary)
   - **Interpretation:**
     - Low (2-5%): Very consistent returns
     - Medium (5-10%): Moderate variation
     - High (10%+): High volatility, returns swing widely
   - **Example:** 3.2% std dev = Returns typically vary ±3.2% around the mean
   - **Significance:** Lower is better (more predictable)

6. **Positive Periods (%)**
   - **What it means:** Percentage of rolling windows with positive returns
   - **Interpretation:**
     - 100% = All periods were profitable
     - 85% = 85 out of 100 periods made money
     - 50% = Coin flip (not ideal)
   - **Example:** 85.5% positive = 85.5% of all periods had positive returns
   - **Significance:** Higher is better (more reliable)

#### Individual Fund Statistics

The calculator shows the same statistics for:
- **Bucket (All Funds Combined):** Portfolio-level performance
- **Individual Funds:** Each fund's performance separately

This helps identify:
- Which funds are more consistent
- Which funds drive portfolio volatility
- Diversification benefits

---

### 5.5 How to Use Rolling Returns

**Why Rolling Returns Matter:**

1. **Understand Consistency**
   - A fund with 12% mean but high volatility might have been -5% in some periods
   - Helps see if returns are reliable or luck-based

2. **Compare Investments**
   - Fund A: 13% mean, 8% std dev
   - Fund B: 13% mean, 3% std dev
   - Fund B is better (same return, lower risk)

3. **Set Expectations**
   - If min return is 5%, you know worst-case is still positive
   - If min return is -10%, you're prepared for losses

4. **Time Period Analysis**
   - 1-year rolling: Short-term volatility
   - 3-year rolling: Medium-term consistency
   - 5-year rolling: Long-term stability

---

## 6. Financial Terms Explained

This section explains all financial terms used in the calculators in simple, easy-to-understand language.

---

### 6.1 NAV (Net Asset Value)

**What it is:**
- The price per unit of a mutual fund
- Like the share price of a stock

**How it works:**
- NAV changes daily based on the value of the fund's investments
- You buy/sell mutual fund units at NAV

**Example:**
- NAV = ₹100 means 1 unit costs ₹100
- If you invest ₹10,000, you get 100 units

**In calculations:**
- Used to determine how many units you can buy
- Used to value your existing units
- Historical NAV data is essential for all calculations

---

### 6.2 Units

**What it is:**
- Your ownership stake in a mutual fund
- Like shares in a company

**How it works:**
- Units = Investment Amount / NAV
- You don't lose units (unless you sell), but NAV changes
- Portfolio Value = Units × Current NAV

**Example:**
- Invest ₹10,000 when NAV = ₹100
- You get 100 units
- If NAV becomes ₹120, your 100 units = ₹12,000

**Key Point:**
- More units = More ownership
- NAV changes, units stay (unless redeemed)

---

### 6.3 Absolute Returns

**What it is:**
- Simple profit/loss calculation
- Total gain or loss in rupees and percentage

**Formula:**
```
Absolute Profit = Current Value - Investment
Absolute Profit % = (Profit / Investment) × 100
```

**Example:**
- Invested: ₹1,00,000
- Current Value: ₹1,50,000
- Absolute Profit: ₹50,000 (50%)

**When to use:**
- Quick check of gains/losses
- Short-term investments (< 1 year)

**Limitation:**
- Doesn't consider time period
- ₹50k profit over 1 year vs. 10 years is very different

---

### 6.4 CAGR (Compound Annual Growth Rate)

**What it is:**
- Annualized return rate assuming constant compounding
- "What annual return would give me this result?"

**Formula:**
```
CAGR = ((Final Value / Initial Value) ^ (1 / Years)) - 1
```

**Example:**
- Invested: ₹1,00,000
- After 5 years: ₹2,00,000
- CAGR = ((2,00,000 / 1,00,000) ^ (1/5)) - 1 = 14.87%

**Interpretation:**
- 14.87% CAGR means your money grew 14.87% every year
- Money doubles in approximately: 72 / CAGR years
- 14.87% CAGR ≈ Doubles in ~5 years

**When to use:**
- Comparing investments of different durations
- Understanding long-term growth rate
- Lumpsum investments (single investment)

**Limitation:**
- Assumes single investment at start
- Less accurate for multiple investments (use XIRR)

---

### 6.5 XIRR (Extended Internal Rate of Return)

**What it is:**
- Annualized return considering exact timing of each cash flow
- Most accurate return metric for multiple investments/withdrawals

**How it works:**
- Takes every investment date and amount
- Calculates the rate that makes all cash flows balance
- Uses iterative mathematical methods (Newton-Raphson)

**Example:**
```
Investment 1: -₹10,000 on 2020-01-01
Investment 2: -₹10,000 on 2020-02-01
Investment 3: -₹10,000 on 2020-03-01
Final Value: ₹50,000 on 2023-12-31
XIRR = 12.5% (annualized return considering all dates)
```

**When to use:**
- SIP investments (multiple dates)
- Irregular investments
- Investments with withdrawals (SWP)
- Any scenario with multiple cash flows

**Why it's better than CAGR:**
- CAGR assumes investment at start date
- XIRR considers actual investment dates
- More realistic for real-world scenarios

**Interpretation:**
- Same as CAGR: Annual return percentage
- 12% XIRR = 12% annual return

---

### 6.6 Volatility

**What it is:**
- Measure of how much returns fluctuate
- Higher volatility = More unpredictable returns

**Standard Deviation:**
- Most common volatility measure
- Shows typical variation from average return

**Example:**
- Mean Return: 12%
- Standard Deviation: 5%
- Interpretation: Returns typically range from 7% to 17% (12% ± 5%)

**Volatility Levels:**
- **Low (5-10%):** Stable, predictable returns (e.g., debt funds)
- **Medium (10-20%):** Moderate swings (e.g., balanced funds)
- **High (20%+):** Large fluctuations (e.g., equity funds)

**Significance:**
- **High Volatility:**
  - Can see big gains or big losses
  - Requires long investment horizon
  - Emotional stress from swings
  
- **Low Volatility:**
  - Predictable returns
  - Less stress
  - Lower potential returns typically

**Annualized Volatility:**
- Converted to annual basis for comparison
- Monthly volatility × √12 = Annual volatility
- Standardizes across different time periods

**How it's calculated:**
```
1. Calculate monthly returns
2. Find average return
3. Calculate variance (average of squared deviations)
4. Standard Deviation = √Variance
5. Annualize: Monthly Std Dev × √12
```

---

### 6.7 Maximum Drawdown

**What it is:**
- Worst decline from peak value
- Measures the biggest drop your portfolio experienced

**Formula:**
```
Max Drawdown = ((Peak Value - Lowest Value) / Peak Value) × 100
```

**Example:**
- Portfolio peaked at ₹60,00,000
- Dropped to ₹45,00,000
- Max Drawdown = ((60L - 45L) / 60L) × 100 = 25%

**Interpretation:**
- 25% drawdown = Portfolio lost 25% from its highest point
- Shows worst-case loss from peak

**Drawdown Levels:**
- **5-10%:** Mild decline (normal market fluctuation)
- **10-20%:** Moderate decline (market correction)
- **20-30%:** Significant decline (bear market)
- **30%+:** Severe decline (major crash)

**Significance:**
- **High Drawdown:**
  - More emotional stress
  - Takes longer to recover
  - Requires strong risk tolerance
  
- **Low Drawdown:**
  - Smoother ride
  - Less stress
  - More suitable for conservative investors

**Why it matters:**
- Helps set expectations for worst-case scenarios
- Important for retirement planning (can't afford large drops)
- Measures portfolio resilience

---

### 6.8 Safe Withdrawal Rate (SWR)

**What it is:**
- Percentage of portfolio you can safely withdraw annually
- Designed to prevent running out of money

**Formula:**
```
SWR = Portfolio CAGR / Risk Factor
Safe Monthly Withdrawal = Portfolio Value × (SWR / 12)
```

**Default Risk Factor:**
- Typically 3 (conservative)
- Means withdrawing 1/3rd of annual return
- Leaves 2/3rd to fight inflation and market downturns

**Example:**
- Portfolio CAGR: 12%
- Risk Factor: 3
- SWR = 12% / 3 = 4%
- Portfolio: ₹50,00,000
- Safe Annual Withdrawal: ₹50L × 4% = ₹2,00,000
- Safe Monthly Withdrawal: ₹2L / 12 = ₹16,667

**Interpretation:**
- 4% rule is famous in retirement planning
- If you withdraw 4% annually, portfolio should last indefinitely
- Accounts for market volatility and inflation

**Risk Factor Significance:**
- **Risk Factor 2:** More aggressive (withdraw 6% if CAGR 12%)
- **Risk Factor 3:** Conservative (withdraw 4% if CAGR 12%)
- **Risk Factor 4:** Very conservative (withdraw 3% if CAGR 12%)

**Why it matters:**
- Prevents over-withdrawal
- Ensures sustainable income
- Accounts for bad market periods

---

### 6.9 Positive Periods Percentage

**What it is:**
- Percentage of time periods with positive returns
- Measures consistency and reliability

**How it's calculated:**
```
Positive Periods % = (Number of Positive Periods / Total Periods) × 100
```

**Example:**
- Analyzed 100 rolling 3-year periods
- 85 periods had positive returns
- Positive Periods % = (85 / 100) × 100 = 85%

**Interpretation:**
- **100%:** Every period was profitable (very rare)
- **85%:** 85% of periods made money (good consistency)
- **50%:** Coin flip (50% chance of profit)
- **<50%:** More losing periods than winning (poor)

**Significance:**
- **High Percentage:**
  - More reliable returns
  - Lower probability of losses
  - Better for conservative investors
  
- **Low Percentage:**
  - Less reliable
  - Higher chance of losses
  - Requires long investment horizon

**Real-world meaning:**
- 85% positive periods means:
  - Out of 10 similar periods, 8-9 will be profitable
  - 1-2 periods might lose money
  - Helps set realistic expectations

---

### 6.10 Standard Deviation (in Statistics)

**What it is:**
- Measure of spread or variability
- Shows how much values deviate from the average

**Simple Explanation:**
- If returns are: 10%, 12%, 11%, 13%, 12%
- Mean = 11.6%
- Standard Deviation ≈ 1.14%
- Low deviation = Consistent returns

- If returns are: 5%, 20%, -5%, 15%, 10%
- Mean = 9%
- Standard Deviation ≈ 8.66%
- High deviation = Volatile returns

**In Rolling Returns:**
- Low Standard Deviation = Consistent performance across periods
- High Standard Deviation = Inconsistent, volatile performance

**How to interpret:**
- **Mean = 12%, Std Dev = 2%:**
  - Most returns between 10% - 14%
  - Very consistent
  
- **Mean = 12%, Std Dev = 8%:**
  - Returns can be anywhere from 4% - 20%
  - High volatility

**Rule of Thumb:**
- 68% of values fall within 1 standard deviation of mean
- 95% fall within 2 standard deviations
- 99.7% fall within 3 standard deviations

---

### 6.11 Mean vs. Median

**Mean (Average):**
- Sum of all values divided by count
- Affected by extreme values (outliers)

**Median (Middle Value):**
- Middle value when sorted
- Not affected by extreme values

**Example:**
Returns: 10%, 11%, 12%, 13%, 50%
- Mean: (10+11+12+13+50) / 5 = 19.2%
- Median: 12% (middle value)

**When they differ:**
- **Mean > Median:** Skewed toward higher values (one very good period pulled up the average)
- **Mean < Median:** Skewed toward lower values (one very bad period pulled down the average)
- **Mean ≈ Median:** Symmetrical distribution (balanced)

**Why it matters:**
- **Median is better** when you have outliers or skewed data
- **Mean is better** when data is normally distributed
- Both together give a complete picture

**In Rolling Returns:**
- If Mean (12.5%) > Median (12%), some periods were exceptional
- If Mean (12%) < Median (12.5%), some periods were very bad
- Median tells you the "typical" return

---

### 6.12 Weightage (Portfolio Allocation)

**What it is:**
- Percentage allocation of your investment across different funds
- Must total 100% for all funds combined

**Example:**
- Fund A: 50% (half your investment)
- Fund B: 30% (30% of investment)
- Fund C: 20% (20% of investment)
- Total: 100%

**How it's used:**
- Monthly SIP: ₹10,000 × 50% = ₹5,000 in Fund A
- Lumpsum: ₹5,00,000 × 30% = ₹1,50,000 in Fund B

**Significance:**
- Determines how much you invest in each fund
- Affects overall portfolio risk and return
- Higher weightage = More impact on portfolio performance

**Portfolio-level calculations:**
- Weighted Average Return = Sum of (Fund Return × Fund Weightage)
- Portfolio Risk = Weighted average of fund risks

---

### 6.13 Portfolio Value

**What it is:**
- Total current worth of all your investments
- Sum of values across all funds in your portfolio

**Formula:**
```
Portfolio Value = Sum of (Units × Current NAV) for all funds
```

**Example:**
- Fund A: 1,000 units × ₹120 NAV = ₹1,20,000
- Fund B: 500 units × ₹80 NAV = ₹40,000
- Fund C: 800 units × ₹100 NAV = ₹80,000
- **Portfolio Value = ₹2,40,000**

**Key Points:**
- Changes daily with NAV fluctuations
- Not just sum of investments (includes gains/losses)
- Represents current market value

---

### 6.14 Principal vs. Profit

**Principal:**
- Your original investment amount
- Money you actually put in
- Doesn't change (unless you invest more)

**Profit/Loss:**
- Gains or losses on your investment
- Current Value - Principal
- Can be positive (profit) or negative (loss)

**Example:**
- **Principal:** ₹1,00,000 (what you invested)
- **Current Value:** ₹1,50,000 (what it's worth now)
- **Profit:** ₹50,000 (gain)

**In SWP Calculator:**
- **Principal Remaining:** How much of your original investment is still intact
- **Profit Remaining:** How much of your gains are still in the portfolio
- **Total Value = Principal Remaining + Profit Remaining**

---

### 6.15 Installments (SIP Count)

**What it is:**
- Number of monthly SIP investments made
- Count of how many times you invested

**Example:**
- SIP starting Jan 2020, ending Dec 2024
- 60 installments (5 years × 12 months)

**How it's used:**
- Total Invested = Monthly Amount × Installments
- Helps track investment discipline
- Shows investment duration

---

### 6.16 Investment Date Handling

**Holiday/Weekend Adjustment:**
- Mutual funds don't trade on holidays/weekends
- Investment dates are adjusted to next available NAV date

**Next Available NAV:**
- If planned date is a holiday, use NAV from next working day
- Ensures realistic calculation
- Example: Planned Jan 1 (holiday) → Actual Jan 2

**Latest NAV Before Date:**
- For end date valuation
- Uses most recent NAV on or before the date
- Example: If Dec 31 is holiday, use Dec 30 NAV

**Why it matters:**
- More accurate than assuming ideal dates
- Reflects real-world investment scenarios
- Important for precise return calculations

---

### 6.17 Risk Factor (SWR)

**What it is:**
- Safety multiplier for calculating safe withdrawal rate
- Higher factor = More conservative withdrawal

**Formula:**
```
Safe Withdrawal Rate = Portfolio CAGR / Risk Factor
```

**Common Values:**
- **Risk Factor 2:** Aggressive (withdraw 6% if CAGR 12%)
- **Risk Factor 3:** Conservative (withdraw 4% if CAGR 12%) - **Default**
- **Risk Factor 4:** Very conservative (withdraw 3% if CAGR 12%)

**Interpretation:**
- Factor of 3 means: Withdraw only 1/3rd of annual return
- Leaves 2/3rd to fight inflation and market downturns
- Ensures portfolio sustainability

**When to adjust:**
- **Lower factor (2):** If you have shorter time horizon or accept more risk
- **Higher factor (4):** If you want extra safety or longer withdrawal period

---

### 6.18 Withdrawal Strategy

**1. Proportional:**
- **What it means:** Withdraw from all funds proportionally to their weightage
- **Example:** If Fund A is 50% of portfolio, withdraw 50% of withdrawal from Fund A
- **Pros:** Maintains target allocation automatically
- **Use when:** You want to keep portfolio balanced

**2. Overweight First:**
- **What it means:** Sell from funds that are above target weight
- **Example:** If Fund A target is 50% but current is 60%, sell from Fund A first
- **Pros:** Harvests gains, rebalances portfolio
- **Use when:** You want to lock in gains from outperforming funds

**3. Risk Bucket:**
- **What it means:** Sell from lowest risk funds first
- **Order:** Liquid → Debt → Hybrid → Equity (Large) → Equity (Mid) → Equity (Small)
- **Pros:** Preserves higher-risk, higher-return assets longer
- **Use when:** You want to maximize long-term growth

---

### 6.19 Rolling Window

**What it is:**
- Fixed time period that "rolls" or moves forward
- Calculates returns for that period starting at different dates

**Example (3-Year Rolling Window):**
- Window 1: Jan 2020 → Jan 2023 (36 months)
- Window 2: Feb 2020 → Feb 2023 (36 months)
- Window 3: Mar 2020 → Mar 2023 (36 months)
- ... continues rolling forward

**Why use rolling windows:**
- Shows consistency across different start dates
- Eliminates timing bias (not dependent on specific start/end dates)
- Provides distribution of returns, not just one number

**Common Windows:**
- **1 Year:** Short-term performance
- **3 Years:** Medium-term consistency
- **5 Years:** Long-term stability

---

### 6.20 CAGR vs. XIRR - When to Use Which?

**Use CAGR when:**
- Single investment (lumpsum)
- Simple start-to-end calculation
- No intermediate cash flows
- Quick comparison of investments

**Use XIRR when:**
- Multiple investments (SIP)
- Irregular investment dates
- Withdrawals involved (SWP)
- Need precise calculation

**Key Difference:**
- **CAGR:** Assumes all money invested at start date
- **XIRR:** Considers actual investment/withdrawal dates

**Example:**
- **CAGR:** "If I invested everything on Jan 1, what would return be?"
- **XIRR:** "Given I invested on these specific dates, what's my actual return?"

**For SIP:** XIRR is always more accurate

---

## 7. Understanding Calculator Results

### 7.1 Reading Performance Cards

Performance cards show key metrics at a glance:

**Color Coding:**
- **Green:** Positive returns (profit)
- **Red:** Negative returns (loss)
- **Blue/Indigo:** Neutral information (invested amounts)

**Card Types:**
1. **Total Invested:** Shows your capital deployed
2. **Current Value:** Shows portfolio worth today
3. **Profit/Loss:** Shows gains/losses with percentage
4. **CAGR:** Annualized growth rate
5. **XIRR:** Time-weighted return

---

### 7.2 Interpreting Charts

**Line Charts (Performance Over Time):**
- **Upward Trend:** Portfolio growing (good)
- **Steep Line:** Fast growth (higher returns)
- **Smooth Line:** Consistent growth (lower volatility)
- **Downward Trend:** Portfolio declining (check timeframe)
- **Jagged Line:** High volatility (large swings)

**Bar Charts (Comparison):**
- **Bar Height:** Represents value
- **Side-by-side:** Compare investment vs. current value
- **Color Coding:** Different colors for different funds

**Rolling Returns Chart:**
- **Above Zero Line:** Positive returns for that period
- **Below Zero Line:** Negative returns for that period
- **Smooth Line:** Consistent returns (good)
- **Wide Swings:** High volatility (risky)

---

### 7.3 When to Trust Results

**Results are reliable when:**
- ✅ Sufficient historical data available
- ✅ Funds have long track record
- ✅ NAV data is complete for the period
- ✅ Investment dates are realistic

**Results may be less reliable when:**
- ⚠️ Very short time periods (< 1 year)
- ⚠️ New funds with limited history
- ⚠️ Extreme market conditions not captured
- ⚠️ Missing NAV data for some dates

**Remember:**
- Past performance ≠ Future returns
- Calculations show historical data
- Real results may vary due to market conditions

---

### 7.4 Common Questions

**Q: Why is XIRR different from CAGR?**
A: XIRR considers exact investment dates. For SIPs, money is invested monthly, not all at once. XIRR is more accurate.

**Q: My profit percentage is 50%, but CAGR is 12%. Why?**
A: Profit % is absolute (50% over entire period). CAGR is annualized (12% per year). Over 5 years, 12% CAGR ≈ 76% total return.

**Q: Why do I have negative returns sometimes?**
A: Market fluctuations are normal. Short-term losses are expected in equity investments. Focus on long-term performance.

**Q: What if my portfolio value drops?**
A: This is normal market volatility. NAV fluctuates daily. Long-term investors should focus on overall trend.

**Q: How often should I recalculate?**
A: Monthly or quarterly for tracking. Not necessary to check daily due to normal market fluctuations.

---