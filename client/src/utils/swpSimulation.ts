export type SWPStrategy = 'PROPORTIONAL' | 'OVERWEIGHT_FIRST' | 'RISK_BUCKET';

export interface NavPoint {
  date: string;
  nav: number;
}

export type NavSeriesByFund = Record<string, NavPoint[]>;

export interface SWPSimulationInput {
  startDate: string;
  withdrawalAmount: number;
  withdrawalDates: string[]; // ISO strings ascending
  strategy: SWPStrategy;
  targetWeights: Record<string, number>; // should sum to 1
  initialUnits: Record<string, number>;
  navSeriesByFund: NavSeriesByFund;
  riskOrder?: string[];
  fundRisk?: Record<string, string>;
}

export interface FundWithdrawal {
  fundId: string;
  unitsSold: number;
  amount: number;
  navDate: string;
  nav: number;
}

export interface TimelineEntry {
  date: string;
  portfolioValue: number;
  totalUnits: Record<string, number>;
  action?: {
    type: 'INIT_STATE' | 'WITHDRAWAL';
    amount?: number;
    shortfall?: number;
    perFund?: FundWithdrawal[];
  };
}

export interface FundResult {
  fundId: string;
  totalWithdrawn: number;
  remainingUnits: number;
  sales: FundWithdrawal[];
}

export interface Cashflow {
  date: string;
  amount: number;
}

export interface SWPSimulationResult {
  timeline: TimelineEntry[];
  totals: {
    withdrawn: number;
    endingValue: number;
    periodsRun: number;
    depletedOn?: string | null;
    maxDrawdown: number;
    peakValue: number;
    shortfallTotal: number;
  };
  fundResults: FundResult[];
  cashflows: {
    overall: Cashflow[];
    perFund: Record<string, Cashflow[]>;
  };
}

const ISO_ZERO = 'T00:00:00';

const toDate = (iso: string) => new Date(`${iso}${ISO_ZERO}`);
const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const cloneUnits = (units: Record<string, number>) => {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(units)) {
    out[key] = value;
  }
  return out;
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
const roundUnits = (value: number) =>
  Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;

function ensureAscending(series: NavPoint[]): NavPoint[] {
  return [...series].sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime()
  );
}

function navOnOrBeforeDate(series: NavPoint[], isoDate: string): NavPoint | null {
  if (!series || series.length === 0) return null;
  const target = toDate(isoDate).getTime();
  let lo = 0;
  let hi = series.length - 1;
  let best: NavPoint | null = null;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const current = series[mid];
    const curTime = toDate(current.date).getTime();
    if (curTime <= target) {
      best = current;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function portfolioValue(
  asOfDate: string,
  units: Record<string, number>,
  navSeriesByFund: NavSeriesByFund
): number {
  let total = 0;
  for (const [fundId, fundUnits] of Object.entries(units)) {
    if (fundUnits <= 0) continue;
    const series = navSeriesByFund[fundId];
    if (!series) continue;
    const navPoint = navOnOrBeforeDate(series, asOfDate);
    if (!navPoint) continue;
    total += fundUnits * navPoint.nav;
  }
  return total;
}

interface WithdrawalResult {
  sales: FundWithdrawal[];
  shortfall: number;
}

function withdrawProportional(
  input: SWPSimulationInput,
  asOfDate: string,
  units: Record<string, number>
): WithdrawalResult {
  const { withdrawalAmount, targetWeights, navSeriesByFund } = input;
  const sales: FundWithdrawal[] = [];
  let remaining = withdrawalAmount;

  const activeFunds = Object.keys(targetWeights).filter(
    (fundId) => (units[fundId] || 0) > 0
  );

  const weightSum = activeFunds.reduce(
    (sum, fundId) => sum + (targetWeights[fundId] || 0),
    0
  );

  const normalizedWeights: Record<string, number> = {};
  if (weightSum > 0) {
    for (const fundId of activeFunds) {
      normalizedWeights[fundId] = (targetWeights[fundId] || 0) / weightSum;
    }
  } else if (activeFunds.length > 0) {
    const equalWeight = 1 / activeFunds.length;
    for (const fundId of activeFunds) {
      normalizedWeights[fundId] = equalWeight;
    }
  }

  const fundsUsedInPrimaryPass: string[] = [];

  for (const fundId of activeFunds) {
    if (remaining <= 0.005) break;
    const weight = normalizedWeights[fundId] ?? 0;
    if (weight <= 0) continue;

    const series = navSeriesByFund[fundId];
    if (!series) continue;
    const navPoint = navOnOrBeforeDate(series, asOfDate);
    if (!navPoint) continue;

    fundsUsedInPrimaryPass.push(fundId);

    const desired = withdrawalAmount * weight;
    const maxAmount = (units[fundId] || 0) * navPoint.nav;
    const amount = Math.min(desired, maxAmount, remaining);
    const unitsToSell = navPoint.nav > 0 ? amount / navPoint.nav : 0;

    if (unitsToSell > 0) {
      units[fundId] = roundUnits(Math.max(0, (units[fundId] || 0) - unitsToSell));
      sales.push({
        fundId,
        unitsSold: unitsToSell,
        amount,
        navDate: navPoint.date,
        nav: navPoint.nav,
      });
      remaining = round2(remaining - amount);
    }
  }

  if (remaining > 0.005) {
    const values: Record<string, number> = {};
    let valueSum = 0;
    const candidateFunds =
      fundsUsedInPrimaryPass.length > 0 ? fundsUsedInPrimaryPass : activeFunds;

    for (const fundId of candidateFunds) {
      const series = navSeriesByFund[fundId];
      if (!series) continue;
      const navPoint = navOnOrBeforeDate(series, asOfDate);
      if (!navPoint) continue;
      const currentValue = (units[fundId] || 0) * navPoint.nav;
      if (currentValue <= 0) continue;
      values[fundId] = currentValue;
      valueSum += currentValue;
    }

    if (valueSum > 0) {
      for (const [fundId, value] of Object.entries(values)) {
        if (remaining <= 0.005) break;
        const series = navSeriesByFund[fundId];
        if (!series) continue;
        const navPoint = navOnOrBeforeDate(series, asOfDate);
        if (!navPoint) continue;

        const share = remaining * (value / valueSum);
        const maxAmount = (units[fundId] || 0) * navPoint.nav;
        const amount = Math.min(share, maxAmount, remaining);
        const unitsToSell = navPoint.nav > 0 ? amount / navPoint.nav : 0;

        if (unitsToSell > 0) {
          units[fundId] = roundUnits(Math.max(0, (units[fundId] || 0) - unitsToSell));
          sales.push({
            fundId,
            unitsSold: unitsToSell,
            amount,
            navDate: navPoint.date,
            nav: navPoint.nav,
          });
          remaining = round2(remaining - amount);
        }
      }
    }
  }

  return { sales, shortfall: Math.max(0, remaining) };
}

function withdrawOverweightFirst(
  input: SWPSimulationInput,
  asOfDate: string,
  units: Record<string, number>
): WithdrawalResult {
  const { withdrawalAmount, targetWeights, navSeriesByFund } = input;
  const currentValues: Record<string, number> = {};
  let portfolioValueSum = 0;

  for (const fundId of Object.keys(targetWeights)) {
    const series = navSeriesByFund[fundId];
    const navPoint = series ? navOnOrBeforeDate(series, asOfDate) : null;
    const value = navPoint ? (units[fundId] || 0) * navPoint.nav : 0;
    currentValues[fundId] = value;
    portfolioValueSum += value;
  }

  const targetValues: Record<string, number> = {};
  for (const [fundId, weight] of Object.entries(targetWeights)) {
    targetValues[fundId] = portfolioValueSum * weight;
  }

  const sortedFunds = Object.keys(currentValues)
    .map((fundId) => ({
      fundId,
      overweight: currentValues[fundId] - (targetValues[fundId] ?? 0),
    }))
    .sort((a, b) => b.overweight - a.overweight);

  const sales: FundWithdrawal[] = [];
  let remaining = withdrawalAmount;

  for (const { fundId, overweight } of sortedFunds) {
    if (remaining <= 0) break;
    if (overweight <= 0) continue;
    const series = navSeriesByFund[fundId];
    if (!series) continue;
    const navPoint = navOnOrBeforeDate(series, asOfDate);
    if (!navPoint) continue;

    const maxAmount = (units[fundId] || 0) * navPoint.nav;
    const amount = Math.min(overweight, maxAmount, remaining);
    const unitsToSell = navPoint.nav > 0 ? amount / navPoint.nav : 0;

    if (unitsToSell > 0) {
      units[fundId] = roundUnits(Math.max(0, (units[fundId] || 0) - unitsToSell));
      sales.push({
        fundId,
        unitsSold: unitsToSell,
        amount,
        navDate: navPoint.date,
        nav: navPoint.nav,
      });
      remaining = round2(remaining - amount);
    }
  }

  if (remaining > 0.005 && portfolioValueSum > 0) {
    for (const [fundId, value] of Object.entries(currentValues)) {
      if (remaining <= 0.005) break;
      if (value <= 0) continue;
      const series = navSeriesByFund[fundId];
      if (!series) continue;
      const navPoint = navOnOrBeforeDate(series, asOfDate);
      if (!navPoint) continue;

      const share = remaining * (value / portfolioValueSum);
      const maxAmount = (units[fundId] || 0) * navPoint.nav;
      const amount = Math.min(share, maxAmount, remaining);
      const unitsToSell = navPoint.nav > 0 ? amount / navPoint.nav : 0;

      if (unitsToSell > 0) {
        units[fundId] = roundUnits(Math.max(0, (units[fundId] || 0) - unitsToSell));
        sales.push({
          fundId,
          unitsSold: unitsToSell,
          amount,
          navDate: navPoint.date,
          nav: navPoint.nav,
        });
        remaining = round2(remaining - amount);
      }
    }
  }

  return { sales, shortfall: Math.max(0, remaining) };
}

function withdrawRiskBucket(
  input: SWPSimulationInput,
  asOfDate: string,
  units: Record<string, number>
): WithdrawalResult {
  const { withdrawalAmount, navSeriesByFund, targetWeights, riskOrder, fundRisk } =
    input;
  if (!riskOrder || !fundRisk) {
    throw new Error('Risk order and fund risk mapping required for RISK_BUCKET strategy.');
  }

  const sales: FundWithdrawal[] = [];
  let remaining = withdrawalAmount;

  for (const bucket of riskOrder) {
    if (remaining <= 0.005) break;
    const fundsInBucket = Object.keys(targetWeights).filter(
      (id) => fundRisk[id] === bucket
    );
    if (fundsInBucket.length === 0) continue;

    const bucketValues: Record<string, number> = {};
    let bucketTotal = 0;

    for (const fundId of fundsInBucket) {
      const series = navSeriesByFund[fundId];
      const navPoint = series ? navOnOrBeforeDate(series, asOfDate) : null;
      const value = navPoint ? (units[fundId] || 0) * navPoint.nav : 0;
      if (value <= 0) continue;
      bucketValues[fundId] = value;
      bucketTotal += value;
    }

    if (bucketTotal <= 0) continue;

    for (const fundId of fundsInBucket) {
      if (remaining <= 0.005) break;
      const value = bucketValues[fundId];
      if (!value || value <= 0) continue;
      const series = navSeriesByFund[fundId];
      if (!series) continue;
      const navPoint = navOnOrBeforeDate(series, asOfDate);
      if (!navPoint) continue;

      const share = remaining * (value / bucketTotal);
      const maxAmount = (units[fundId] || 0) * navPoint.nav;
      const amount = Math.min(share, maxAmount, remaining);
      const unitsToSell = navPoint.nav > 0 ? amount / navPoint.nav : 0;

      if (unitsToSell > 0) {
        units[fundId] = roundUnits(Math.max(0, (units[fundId] || 0) - unitsToSell));
        sales.push({
          fundId,
          unitsSold: unitsToSell,
          amount,
          navDate: navPoint.date,
          nav: navPoint.nav,
        });
        remaining = round2(remaining - amount);
      }
    }
  }

  return { sales, shortfall: Math.max(0, remaining) };
}

function applyWithdrawal(
  input: SWPSimulationInput,
  asOfDate: string,
  units: Record<string, number>
): WithdrawalResult {
  switch (input.strategy) {
    case 'PROPORTIONAL':
      return withdrawProportional(input, asOfDate, units);
    case 'OVERWEIGHT_FIRST':
      return withdrawOverweightFirst(input, asOfDate, units);
    case 'RISK_BUCKET':
      return withdrawRiskBucket(input, asOfDate, units);
    default:
      throw new Error(`Unsupported strategy ${(input as any).strategy}`);
  }
}

function computeMaxDrawdown(series: Array<{ value: number }>) {
  let peak = -Infinity;
  let maxDrawdown = 0;
  let peakValue = 0;

  for (const { value } of series) {
    if (value > peak) {
      peak = value;
      peakValue = value;
    }
    if (peak <= 0) continue;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return {
    maxDrawdown: round2(maxDrawdown),
    peakValue: round2(peakValue),
  };
}

export function simulateSWP(input: SWPSimulationInput): SWPSimulationResult {
  const {
    startDate,
    withdrawalDates,
    navSeriesByFund,
    initialUnits: initialUnitsRaw,
  } = input;

  const initialUnits = cloneUnits(initialUnitsRaw);
  const units = cloneUnits(initialUnitsRaw);
  const perFundCashflows: Record<string, Cashflow[]> = {};
  const perFundSales: Record<string, FundWithdrawal[]> = {};
  const perFundWithdrawn: Record<string, number> = {};

  for (const fundId of Object.keys(initialUnits)) {
    perFundCashflows[fundId] = [];
    perFundSales[fundId] = [];
    perFundWithdrawn[fundId] = 0;
  }

  const normalizedNavSeries: NavSeriesByFund = {};
  for (const [fundId, series] of Object.entries(navSeriesByFund)) {
    normalizedNavSeries[fundId] = ensureAscending(series);
  }

  const timeline: TimelineEntry[] = [];
  const monthlyClose: Array<{ date: string; value: number }> = [];
  const overallCashflows: Cashflow[] = [];

  const startingValue = portfolioValue(startDate, units, normalizedNavSeries);

  timeline.push({
    date: startDate,
    portfolioValue: round2(startingValue),
    totalUnits: cloneUnits(units),
    action: { type: 'INIT_STATE' },
  });

  monthlyClose.push({ date: startDate, value: round2(startingValue) });

  let totalWithdrawn = 0;
  let totalShortfall = 0;
  let periods = 0;
  let depletedOn: string | null = null;

  for (const plannedDate of withdrawalDates) {
    const totalValueBefore = portfolioValue(plannedDate, units, normalizedNavSeries);
    if (totalValueBefore <= 0.005) {
      depletedOn = plannedDate;
      break;
    }

    const withdrawalResult = applyWithdrawal(
      {
        ...input,
        navSeriesByFund: normalizedNavSeries,
      },
      plannedDate,
      units
    );

    const afterValue = portfolioValue(plannedDate, units, normalizedNavSeries);
    const withdrawnThisPeriod = round2(
      input.withdrawalAmount - withdrawalResult.shortfall
    );

    periods += 1;
    totalWithdrawn = round2(totalWithdrawn + withdrawnThisPeriod);
    totalShortfall = round2(totalShortfall + withdrawalResult.shortfall);

    withdrawalResult.sales.forEach((sale) => {
      const cf: Cashflow = { date: sale.navDate, amount: sale.amount };
      perFundCashflows[sale.fundId].push(cf);
      perFundSales[sale.fundId].push(sale);
      perFundWithdrawn[sale.fundId] = round2(
        (perFundWithdrawn[sale.fundId] || 0) + sale.amount
      );
      overallCashflows.push(cf);
    });

    timeline.push({
      date: plannedDate,
      portfolioValue: round2(afterValue),
      totalUnits: cloneUnits(units),
      action: {
        type: 'WITHDRAWAL',
        amount: withdrawnThisPeriod,
        shortfall: withdrawalResult.shortfall,
        perFund: withdrawalResult.sales,
      },
    });

    monthlyClose.push({ date: plannedDate, value: round2(afterValue) });

    if (withdrawnThisPeriod <= 0.005) {
      depletedOn = plannedDate;
      break;
    }
  }

  const endingValue = round2(
    portfolioValue(
      withdrawalDates[withdrawalDates.length - 1] ?? startDate,
      units,
      normalizedNavSeries
    )
  );

  const { maxDrawdown, peakValue } = computeMaxDrawdown(monthlyClose);

  const fundResults: FundResult[] = Object.keys(initialUnits).map((fundId) => ({
    fundId,
    totalWithdrawn: round2(perFundWithdrawn[fundId] || 0),
    remainingUnits: roundUnits(units[fundId] || 0),
    sales: perFundSales[fundId],
  }));

  return {
    timeline,
    totals: {
      withdrawn: totalWithdrawn,
      endingValue,
      periodsRun: periods,
      depletedOn,
      maxDrawdown,
      peakValue,
      shortfallTotal: totalShortfall,
    },
    fundResults,
    cashflows: {
      overall: overallCashflows.sort(
        (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime()
      ),
      perFund: perFundCashflows,
    },
  };
}


