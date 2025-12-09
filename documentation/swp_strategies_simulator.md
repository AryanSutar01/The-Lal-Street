# SWP Portfolio Simulator (JavaScript) — Three Withdrawal Strategies

> Drop this into Cursor to get started. The code blocks below are production‑ready ES modules (Node 18+ / modern browsers). No external libraries required.

---

## What this does

Simulate a **Systematic Withdrawal Plan (SWP)** on a multi‑fund portfolio using **historical daily NAVs**.  
You choose one of three withdrawal strategies:

1. **S1 — Proportional**: sell each month according to *target* weights.  
2. **S2 — Overweight‑First**: sell first from funds currently *overweight* vs targets (profit‑harvest).  
3. **S3 — Risk‑Bucket**: sell from low‑risk buckets first (e.g., Liquid → Debt → Equity).

The engine:
- Buys initial units on a **purchase date** by target weight.  
- On each scheduled **withdrawal date**, it finds the appropriate NAV(s) and sells units according to the strategy.  
- Tracks portfolio value, remaining units, cash withdrawn, and key stats.

---

## Data model (inputs)

```ts
// Portfolio configuration
type PortfolioConfig = {
  initialAmount: number;                 // e.g., 10000
  purchaseDate: string;                  // "YYYY-MM-DD"
  withdrawalDay: number;                 // day-of-month, e.g., 5
  monthlyWithdrawal: number;             // e.g., 1000
  targetWeights: Record<string, number>; // e.g., {F1: 0.4, F2: 0.3, F3: 0.2, F4: 0.1}
  strategy: "PROPORTIONAL" | "OVERWEIGHT_FIRST" | "RISK_BUCKET";
  // Only for S3:
  riskOrder?: string[]; // lower risk first, e.g., ["LIQUID","DEBT","HYBRID","EQUITY_L","EQUITY_M","EQUITY_S"]
  fundRisk?: Record<string, string>; // map fundId -> risk bucket key present in riskOrder
};

// NAV history: per fund a *sorted* array of { date, nav }
type NavPoint = { date: string; nav: number };
type FundNavSeries = Record<string, NavPoint[]>;
```

**Notes**
- NAV arrays **must** be sorted by ascending date.  
- If a withdrawal date is a holiday/missing, the engine uses the **latest prior date** with NAV (same month if possible, otherwise earlier).  
- If a sale would need more units than available, it sells whatever is left (graceful depletion).

---

## Output summary

```ts
type SimulationResult = {
  timeline: Array<{
    date: string;
    portfolioValue: number;
    totalUnits: Record<string, number>;
    action?: {
      type: "WITHDRAWAL" | "INIT_BUY";
      amount?: number;
      perFund?: Array<{ fundId: string; unitsSold: number; amount: number; navDate: string; nav: number }>;
    };
  }>;
  totals: {
    withdrawn: number;
    endingValue: number;
    monthsRun: number;
    depletedOn?: string | null;
    maxDrawdown: number;     // over monthly closes
    peakValue: number;
  };
};
```

---

## `swp-simulator.js` (core engine + strategies)

```js
// swp-simulator.js
// ES Module

// ---------- Date helpers (no dependencies) ----------
const d = (s) => new Date(s + "T00:00:00");
const yyyy_mm_dd = (date) =>
  date.toISOString().slice(0, 10);

function addMonthsKeepDOM(date, months, dom) {
  // Add months but clamp to last day if needed, then set desired DOM
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const base = new Date(Date.UTC(y, m + months, 1));
  const lastDayOfTargetMonth = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
  const day = Math.min(dom, lastDayOfTargetMonth);
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), day));
}

function prevAvailableNavDate(fundSeries, targetDate) {
  // Binary search the last date <= targetDate in fundSeries
  const t = +targetDate;
  let lo = 0, hi = fundSeries.length - 1, best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cur = +d(fundSeries[mid].date);
    if (cur <= t) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  return best >= 0 ? fundSeries[best] : null;
}

function navOnOrBeforeDate(navSeriesByFund, fundId, dateISO) {
  const series = navSeriesByFund[fundId];
  if (!series || series.length === 0) return null;
  return prevAvailableNavDate(series, d(dateISO));
}

// ---------- Math helpers ----------
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

// Sum current portfolio value at given date using latest available NAVs up to that date
function portfolioValue(dateISO, unitsByFund, navSeriesByFund) {
  let v = 0;
  for (const [fundId, units] of Object.entries(unitsByFund)) {
    if (units <= 0) continue;
    const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, dateISO);
    if (!navPoint) continue;
    v += units * navPoint.nav;
  }
  return v;
}

function totalUnits(unitsByFund) {
  const out = {};
  for (const [k, v] of Object.entries(unitsByFund)) out[k] = v;
  return out;
}

// ---------- Initial purchase ----------
function initialBuy({ initialAmount, purchaseDate, targetWeights }, navSeriesByFund) {
  const units = {};
  const perFundActions = [];
  for (const [fundId, w] of Object.entries(targetWeights)) {
    const amount = initialAmount * w;
    const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, purchaseDate);
    if (!navPoint) throw new Error(`No NAV for ${fundId} on/Before ${purchaseDate}`);
    const u = amount / navPoint.nav;
    units[fundId] = (units[fundId] || 0) + u;
    perFundActions.push({
      fundId, unitsBought: u, amount, navDate: navPoint.date, nav: navPoint.nav,
    });
  }
  return { units, perFundActions };
}

// ---------- Strategy S1: Proportional ----------
function withdrawProportional({ monthlyWithdrawal, targetWeights }, asOfDate, units, navSeriesByFund) {
  const sales = [];
  let remaining = monthlyWithdrawal;

  for (const [fundId, w] of Object.entries(targetWeights)) {
    const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, asOfDate);
    if (!navPoint) continue;
    const demand = monthlyWithdrawal * w;
    const maxSellAmount = (units[fundId] || 0) * navPoint.nav;
    const amount = Math.min(demand, maxSellAmount, remaining); // clamp
    const unitsToSell = amount / navPoint.nav;
    if (unitsToSell > 0) {
      units[fundId] = (units[fundId] || 0) - unitsToSell;
      sales.push({ fundId, unitsSold: unitsToSell, amount, navDate: navPoint.date, nav: navPoint.nav });
      remaining = round2(remaining - amount);
    }
  }

  // If still short (due to depleted funds), sell proportionally by *remaining values*
  if (remaining > 0.005) {
    // compute weights by current value
    const vals = {};
    let sum = 0;
    for (const fundId of Object.keys(targetWeights)) {
      const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, asOfDate);
      if (!navPoint) continue;
      const val = (units[fundId] || 0) * navPoint.nav;
      vals[fundId] = val; sum += val;
    }
    if (sum > 0) {
      for (const [fundId, val] of Object.entries(vals)) {
        if (remaining <= 0) break;
        const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, asOfDate);
        const share = remaining * (val / sum);
        const maxSellAmount = (units[fundId] || 0) * (navPoint?.nav ?? 0);
        const amount = Math.min(share, maxSellAmount, remaining);
        const unitsToSell = navPoint && navPoint.nav > 0 ? amount / navPoint.nav : 0;
        if (unitsToSell > 0) {
          units[fundId] -= unitsToSell;
          sales.push({ fundId, unitsSold: unitsToSell, amount, navDate: navPoint.date, nav: navPoint.nav });
          remaining = round2(remaining - amount);
        }
      }
    }
  }
  return { sales, shortfall: Math.max(0, remaining) };
}

// ---------- Strategy S2: Overweight‑First ----------
function withdrawOverweightFirst({ monthlyWithdrawal, targetWeights }, asOfDate, units, navSeriesByFund) {
  // compute current and target values
  const currentVals = {};
  let portVal = 0;
  for (const [fundId, w] of Object.entries(targetWeights)) {
    const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, asOfDate);
    const val = navPoint ? (units[fundId] || 0) * navPoint.nav : 0;
    currentVals[fundId] = val;
    portVal += val;
  }
  const targetVals = {};
  for (const [fundId, w] of Object.entries(targetWeights)) targetVals[fundId] = portVal * w;
  const overweight = Object.entries(currentVals).map(([fundId, cur]) => ({
    fundId,
    overweight: cur - targetVals[fundId],
  }));
  overweight.sort((a, b) => b.overweight - a.overweight);

  const sales = [];
  let remaining = monthlyWithdrawal;

  // Pass 1: sell from overweight (positive) first
  for (const { fundId, overweight: ow } of overweight) {
    if (remaining <= 0) break;
    if (ow <= 0) continue;
    const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, asOfDate);
    if (!navPoint) continue;
    const maxSellAmount = (units[fundId] || 0) * navPoint.nav;
    const amount = Math.min(ow, remaining, maxSellAmount);
    const unitsToSell = amount / navPoint.nav;
    if (unitsToSell > 0) {
      units[fundId] -= unitsToSell;
      sales.push({ fundId, unitsSold: unitsToSell, amount, navDate: navPoint.date, nav: navPoint.nav });
      remaining = round2(remaining - amount);
    }
  }

  // Pass 2: if still short, sell proportionally by current value
  if (remaining > 0.005) {
    const sumVal = Object.values(currentVals).reduce((a, b) => a + b, 0);
    if (sumVal > 0) {
      for (const [fundId, val] of Object.entries(currentVals)) {
        if (remaining <= 0) break;
        const navPoint = navOnOrBeforeDate(navSeriesByFund, fundId, asOfDate);
        if (!navPoint || val <= 0) continue;
        const share = remaining * (val / sumVal);
        const maxSellAmount = (units[fundId] || 0) * navPoint.nav;
        const amount = Math.min(share, maxSellAmount, remaining);
        const unitsToSell = amount / navPoint.nav;
        if (unitsToSell > 0) {
          units[fundId] -= unitsToSell;
          sales.push({ fundId, unitsSold: unitsToSell, amount, navDate: navPoint.date, nav: navPoint.nav });
          remaining = round2(remaining - amount);
        }
      }
    }
  }
  return { sales, shortfall: Math.max(0, remaining) };
}

// ---------- Strategy S3: Risk‑Bucket ----------
function withdrawRiskBucket({ monthlyWithdrawal, fundRisk, riskOrder, targetWeights }, asOfDate, units, navSeriesByFund) {
  if (!fundRisk || !riskOrder) throw new Error("Risk order + fundRisk mapping required for RISK_BUCKET strategy.");
  const sales = [];
  let remaining = monthlyWithdrawal;

  // iterate risk buckets from low to high
  for (const bucket of riskOrder) {
    if (remaining <= 0) break;
    // collect funds in this bucket with their current values
    const fundsInBucket = Object.keys(targetWeights).filter(fid => fundRisk[fid] === bucket);
    // sell proportionally by current value within the bucket
    let sum = 0;
    const curVals = {};
    for (const fid of fundsInBucket) {
      const navPoint = navOnOrBeforeDate(navSeriesByFund, fid, asOfDate);
      const val = navPoint ? (units[fid] || 0) * navPoint.nav : 0;
      curVals[fid] = val; sum += val;
    }
    if (sum <= 0) continue;
    for (const fid of fundsInBucket) {
      if (remaining <= 0) break;
      const navPoint = navOnOrBeforeDate(navSeriesByFund, fid, asOfDate);
      if (!navPoint) continue;
      const share = remaining * (curVals[fid] / sum);
      const maxSellAmount = (units[fid] || 0) * navPoint.nav;
      const amount = Math.min(share, maxSellAmount, remaining);
      const unitsToSell = amount / navPoint.nav;
      if (unitsToSell > 0) {
        units[fid] -= unitsToSell;
        sales.push({ fundId: fid, unitsSold: unitsToSell, amount, navDate: navPoint.date, nav: navPoint.nav });
        remaining = round2(remaining - amount);
      }
    }
  }

  // If still short after exhausting all buckets, nothing more to sell
  return { sales, shortfall: Math.max(0, remaining) };
}

// ---------- Strategy dispatcher ----------
function applyWithdrawal(config, asOfDate, units, navSeriesByFund) {
  const { strategy } = config;
  if (strategy === "PROPORTIONAL") {
    return withdrawProportional(config, asOfDate, units, navSeriesByFund);
  } else if (strategy === "OVERWEIGHT_FIRST") {
    return withdrawOverweightFirst(config, asOfDate, units, navSeriesByFund);
  } else if (strategy === "RISK_BUCKET") {
    return withdrawRiskBucket(config, asOfDate, units, navSeriesByFund);
  }
  throw new Error(`Unknown strategy ${strategy}`);
}

// ---------- Max drawdown on monthly closes ----------
function maxDrawdown(series /* array of {date, value} */) {
  let peak = -Infinity;
  let mdd = 0;
  let peakVal = 0;
  for (const { value } of series) {
    if (value > peak) { peak = value; peakVal = value; }
    const dd = peak > 0 ? (peak - value) / peak : 0;
    if (dd > mdd) mdd = dd;
  }
  return { mdd, peakVal };
}

// ---------- Main simulation ----------
export function simulateSWP(config, navSeriesByFund) {
  const {
    initialAmount,
    purchaseDate,
    withdrawalDay,
    monthlyWithdrawal,
    targetWeights,
  } = config;

  // 1) Initial buy
  const { units, perFundActions } = initialBuy({ initialAmount, purchaseDate, targetWeights }, navSeriesByFund);

  const timeline = [{
    date: purchaseDate,
    portfolioValue: round2(portfolioValue(purchaseDate, units, navSeriesByFund)),
    totalUnits: totalUnits(units),
    action: { type: "INIT_BUY", perFund: perFundActions.map(a => ({ ...a })) },
  }];

  // 2) Withdrawal loop
  let withdrawn = 0;
  let months = 0;
  let depletedOn = null;

  // next withdrawal date
  const startD = d(purchaseDate);
  const firstW = addMonthsKeepDOM(startD, 1, withdrawalDay);
  let curDate = firstW;

  // Track monthly closes for drawdown
  const monthlyClose = [{ date: purchaseDate, value: timeline[0].portfolioValue }];

  while (true) {
    const dateISO = yyyy_mm_dd(curDate);

    // Stop if all units are ~0
    const totalVal = portfolioValue(dateISO, units, navSeriesByFund);
    if (totalVal <= 0.005) { depletedOn = dateISO; break; }

    // Perform withdrawal
    const beforeVal = totalVal;
    const { sales, shortfall } = applyWithdrawal(config, dateISO, units, navSeriesByFund);
    const afterVal = portfolioValue(dateISO, units, navSeriesByFund);
    const withdrawnThisMonth = round2(monthlyWithdrawal - shortfall);
    withdrawn = round2(withdrawn + withdrawnThisMonth);
    months += 1;
    if (withdrawnThisMonth <= 0.005) {
      // Could not withdraw anything more; consider portfolio depleted
      depletedOn = dateISO;
    }

    timeline.push({
      date: dateISO,
      portfolioValue: round2(afterVal),
      totalUnits: totalUnits(units),
      action: { type: "WITHDRAWAL", amount: withdrawnThisMonth, perFund: sales },
    });

    monthlyClose.push({ date: dateISO, value: round2(afterVal) });

    // Exit if portfolio has nothing left to sell AND could not meet withdrawal
    if (depletedOn) break;

    // Advance by 1 month
    curDate = addMonthsKeepDOM(curDate, 1, curDate.getUTCDate());
  }

  const endingValue = round2(portfolioValue(yyyy_mm_dd(curDate), units, navSeriesByFund));
  const { mdd, peakVal } = maxDrawdown(monthlyClose.map(x => ({ date: x.date, value: x.value })));

  return {
    timeline,
    totals: {
      withdrawn,
      endingValue,
      monthsRun: months,
      depletedOn,
      maxDrawdown: round2(mdd),
      peakValue: round2(peakVal),
    },
  };
}
```

---

## `example.js` (minimal usage)

```js
// example.js
import { simulateSWP } from "./swp-simulator.js";

// ---- Sample NAV data (ascending dates!) ----
const navSeriesByFund = {
  F1: [
    { date: "2024-01-01", nav: 20 },
    { date: "2024-02-01", nav: 21 },
    { date: "2024-03-01", nav: 19 },
    { date: "2024-04-01", nav: 22 },
  ],
  F2: [
    { date: "2024-01-01", nav: 15 },
    { date: "2024-02-01", nav: 15.5 },
    { date: "2024-03-01", nav: 14.5 },
    { date: "2024-04-01", nav: 16 },
  ],
  F3: [
    { date: "2024-01-01", nav: 10 },
    { date: "2024-02-01", nav: 11 },
    { date: "2024-03-01", nav: 10.5 },
    { date: "2024-04-01", nav: 11.5 },
  ],
  F4: [
    { date: "2024-01-01", nav: 50 },
    { date: "2024-02-01", nav: 49 },
    { date: "2024-03-01", nav: 48 },
    { date: "2024-04-01", nav: 52 },
  ],
};

// ---- Common config ----
const baseConfig = {
  initialAmount: 10000,
  purchaseDate: "2024-01-01",
  withdrawalDay: 1,           // 1st of each month
  monthlyWithdrawal: 1000,
  targetWeights: { F1: 0.4, F2: 0.3, F3: 0.2, F4: 0.1 },
};

// ---- Run S1: Proportional ----
const res1 = simulateSWP({ ...baseConfig, strategy: "PROPORTIONAL" }, navSeriesByFund);
console.log("S1 totals:", res1.totals);

// ---- Run S2: Overweight‑First ----
const res2 = simulateSWP({ ...baseConfig, strategy: "OVERWEIGHT_FIRST" }, navSeriesByFund);
console.log("S2 totals:", res2.totals);

// ---- Run S3: Risk‑Bucket ----
const riskOrder = ["LIQUID","DEBT","HYBRID","EQUITY_L","EQUITY_M","EQUITY_S"];
const fundRisk = { F1: "EQUITY_L", F2: "DEBT", F3: "HYBRID", F4: "EQUITY_S" };

const res3 = simulateSWP({
  ...baseConfig,
  strategy: "RISK_BUCKET",
  riskOrder,
  fundRisk,
}, navSeriesByFund);
console.log("S3 totals:", res3.totals);
```

---

## Edge cases handled

- **Missing NAV on target date**: uses the *latest prior* trading day.  
- **End‑of‑month variability**: withdrawal day clamps to last day if month shorter.  
- **Insufficient units**: sells what’s available; records **shortfall** (reduces that month’s withdrawal).  
- **Portfolio depletion**: simulation stops when value ~ 0 or when no withdrawal could be executed.  
- **Max Drawdown** computed on monthly closes for intuitive comparison.

---

## How to use in Cursor

1. Create two files:
   - `swp-simulator.js` — paste the engine code.
   - `example.js` — paste the usage snippet.
2. Run with Node (ESM):
   ```bash
   node example.js
   ```
3. Replace `navSeriesByFund` with your *real* historical NAV data (ascending dates).  
4. Adjust `targetWeights`, `monthlyWithdrawal`, and choose a strategy.

---

## Extension ideas

- Add **fee/exit‑load** model per fund.  
- Support **SIP + SWP** together.  
- Add **rebalancing bands** (e.g., ±5%) separate from SWP.  
- Export detailed timeline to CSV/JSON for charts.  
- Run **Monte Carlo** with resampled monthly returns for survivability stats.
- Surface a **Safe Withdrawal Insights** panel that:  
  - Calculates weighted portfolio CAGR and volatility from historical NAVs.  
  - Derives annual/monthly safe withdrawal rates based on a configurable risk factor.  
  - Suggests a safe monthly withdrawal for an existing corpus.  
  - Estimates the corpus required to sustain a target withdrawal indefinitely or for a fixed horizon (using the annuity PV formula with an adjusted return).

---

## License

MIT — use freely in academic and production contexts.
