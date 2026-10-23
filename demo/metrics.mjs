// Historical price-return diagnostics. Missing/undefined statistics stay null.
export const TRADING_DAYS = 252;
export const mean = xs => xs.reduce((s, x) => s + x, 0) / xs.length;
export function covariance(xs, ys) {
  if (xs.length < 2 || xs.length !== ys.length) return null;
  const mx = mean(xs), my = mean(ys);
  return xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / (xs.length - 1);
}
export const deviation = xs => xs.length > 1 ? Math.sqrt(Math.max(0, covariance(xs, xs))) : null;
export function quantile(xs, p) {
  const a = [...xs].sort((a, b) => a - b), index = (a.length - 1) * p;
  if (!a.length || p < 0 || p > 1) return null;
  const lo = Math.floor(index), hi = Math.ceil(index);
  return a[lo] + (a[hi] - a[lo]) * (index - lo);
}
// Empirical loss distribution. ES averages exactly the worst (1-confidence) mass,
// including a fractional boundary observation, rather than dropping tied losses.
export function tailRisk(returns, confidence = 0.95) {
  if (!returns.length || !returns.every(Number.isFinite) || confidence <= 0 || confidence >= 1) throw Error('Mẫu return hoặc mức tin cậy không hợp lệ.');
  const losses = returns.map(r => -r).sort((a, b) => a - b);
  const varLoss = losses[Math.max(0, Math.ceil(confidence * losses.length) - 1)];
  const mass = losses.length * (1 - confidence), worst = [...losses].reverse();
  const count = Math.floor(mass + 1e-12), fraction = Math.max(0, mass - count);
  const sum = worst.slice(0, count).reduce((s, x) => s + x, 0) + (fraction > 1e-12 ? fraction * worst[count] : 0);
  return { varLoss, expectedShortfall: sum / mass, confidence, tailObservations: mass };
}
export function moments(returns) {
  const n = returns.length, sd = deviation(returns);
  if (n < 4 || !sd || sd < 1e-14) return { skewness: null, excessKurtosis: null };
  const m = mean(returns), z = returns.map(r => (r - m) / sd);
  return {
    skewness: n / ((n - 1) * (n - 2)) * z.reduce((s, x) => s + x ** 3, 0),
    excessKurtosis: n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) * z.reduce((s, x) => s + x ** 4, 0) - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3)),
  };
}
export function historicalMetrics(data, riskFreeAnnual = null) {
  const { dates, current, benchmark } = data;
  const indices = dates.slice(1).map((_, i) => i + 1).filter(i => (Date.parse(dates[i]) - Date.parse(dates[i - 1])) / 86400000 <= 7);
  const returns = indices.map(i => current.path[i] / current.path[i - 1] - 1);
  const n = returns.length, sd = deviation(returns);
  const hasRf = riskFreeAnnual !== null && Number.isFinite(riskFreeAnnual) && riskFreeAnnual > -1 && riskFreeAnnual <= 1;
  const rfDaily = hasRf ? (1 + riskFreeAnnual) ** (1 / TRADING_DAYS) - 1 : null;
  const excess = hasRf ? returns.map(r => r - rfDaily) : [];
  let peak = current.path[0], maxDrawdown = 0;
  const drawdowns = current.path.map(value => { peak = Math.max(peak, value); const dd = value / peak - 1; maxDrawdown = Math.min(maxDrawdown, dd); return dd; });
  const days = (Date.parse(dates.at(-1)) - Date.parse(dates[0])) / 86400000;
  const cagr = days >= 365 && n >= 252 ? (current.path.at(-1) / current.path[0]) ** (365.25 / days) - 1 : null;
  const downside = hasRf && n ? Math.sqrt(excess.reduce((s, r) => s + Math.min(0, r) ** 2, 0) / n) : null;
  const pairs = indices.filter(i => Number.isFinite(benchmark.path[i]) && Number.isFinite(benchmark.path[i - 1]));
  const p = pairs.map(i => current.path[i] / current.path[i - 1] - 1), b = pairs.map(i => benchmark.path[i] / benchmark.path[i - 1] - 1);
  const active = p.map((r, i) => r - b[i]);
  const vb = b.length >= 60 ? covariance(b, b) : null;
  const beta = vb > 1e-18 ? covariance(p, b) / vb : null;
  const te = active.length >= 60 ? deviation(active) : null;
  const shape = n >= 30 ? moments(returns) : { skewness: null, excessKurtosis: null };
  const matrix = data.symbols.map(left => data.symbols.map(right => {
    const l = data.returns?.[left], r = data.returns?.[right];
    const denominator = l && r ? deviation(l) * deviation(r) : 0;
    return denominator > 1e-18 ? Math.max(-1, Math.min(1, covariance(l, r) / denominator)) : null;
  }));
  return {
    observations: n, benchmarkObservations: pairs.length, calendarDays: days,
    cagr, maxDrawdown, drawdowns,
    realizedVolatility: sd === null || n < 60 ? null : sd * Math.sqrt(TRADING_DAYS),
    sharpe: hasRf && n >= 60 && sd > 1e-14 ? mean(excess) / sd * Math.sqrt(TRADING_DAYS) : null,
    sortino: hasRf && n >= 60 && downside > 1e-14 ? mean(excess) / downside * Math.sqrt(TRADING_DAYS) : null,
    beta, jensenAlpha: hasRf && beta !== null ? TRADING_DAYS * (mean(p) - rfDaily - beta * (mean(b) - rfDaily)) : null,
    trackingError: te === null ? null : te * Math.sqrt(TRADING_DAYS),
    informationRatio: te > 1e-14 ? mean(active) / te * Math.sqrt(TRADING_DAYS) : null,
    calmar: cagr !== null && maxDrawdown < -1e-14 ? cagr / Math.abs(maxDrawdown) : null,
    tail: n >= 100 ? tailRisk(returns) : null, ...shape,
    bestDay: n ? Math.max(...returns) : null, worstDay: n ? Math.min(...returns) : null,
    positiveDayRate: n ? returns.filter(r => r > 0).length / n : null,
    correlation: matrix, riskFreeAnnual: hasRf ? riskFreeAnnual : null,
    basis: 'Realized buy-and-hold VND daily returns; 252 observations/year; gaps >7 calendar days excluded.',
  };
}
