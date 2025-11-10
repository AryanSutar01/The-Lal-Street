export type NavPoint = { date: string; nav: number };
export type NavSeries = NavPoint[];

const DAYS_IN_YEAR = 365.25;
const MONTHS_IN_YEAR = 12;

const toDate = (iso: string) => new Date(`${iso}T00:00:00`);

function ensureAscending(series: NavSeries): NavSeries {
  return [...series].sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime()
  );
}

export function computeFundCAGR(series: NavSeries): number | null {
  if (!series || series.length < 2) return null;
  const sorted = ensureAscending(series);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.nav <= 0 || last.nav <= 0) return null;

  const msDiff = toDate(last.date).getTime() - toDate(first.date).getTime();
  const days = msDiff / (1000 * 60 * 60 * 24);
  const years = days / DAYS_IN_YEAR;
  if (years <= 0) return null;

  const cagr = Math.pow(last.nav / first.nav, 1 / years) - 1;
  return cagr * 100;
}

function groupByMonth(series: NavSeries) {
  const map = new Map<string, NavPoint>();
  for (const point of series) {
    const d = toDate(point.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    map.set(key, point);
  }
  return map;
}

export function computeFundAnnualizedVolatility(series: NavSeries): number | null {
  if (!series || series.length < 3) return null;
  const sorted = ensureAscending(series);
  const monthlyMap = groupByMonth(sorted);
  const monthlyPoints = Array.from(monthlyMap.values()).sort(
    (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime()
  );
  if (monthlyPoints.length < 3) return null;

  const monthlyReturns: number[] = [];
  for (let i = 1; i < monthlyPoints.length; i += 1) {
    const prev = monthlyPoints[i - 1];
    const current = monthlyPoints[i];
    if (prev.nav <= 0 || current.nav <= 0) continue;
    const ret = current.nav / prev.nav - 1;
    monthlyReturns.push(ret);
  }
  if (monthlyReturns.length < 2) return null;

  const mean =
    monthlyReturns.reduce((sum, value) => sum + value, 0) / monthlyReturns.length;
  const variance =
    monthlyReturns.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    (monthlyReturns.length - 1);
  const stdMonthly = Math.sqrt(variance);
  const annualized = stdMonthly * Math.sqrt(MONTHS_IN_YEAR);
  return annualized * 100;
}

export function computeWeightedAverage(
  metricByFund: Record<string, number | null | undefined>,
  weights: Record<string, number>
): number | null {
  let numerator = 0;
  let denominator = 0;
  for (const [fundId, weight] of Object.entries(weights)) {
    const metric = metricByFund[fundId];
    if (metric === null || metric === undefined) continue;
    numerator += weight * metric;
    denominator += weight;
  }
  if (denominator <= 0) return null;
  return numerator / denominator;
}

