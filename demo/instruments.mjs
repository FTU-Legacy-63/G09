export const COMMODITIES = {
  GLD: { name: 'Vàng', className: 'Commodity proxy', group: 'Gold', currency: 'USD', detail: 'GLD ETF proxy' },
  SLV: { name: 'Bạc', className: 'Commodity proxy', group: 'Silver', currency: 'USD', detail: 'SLV ETF proxy' },
  USO: { name: 'Dầu thô', className: 'Commodity proxy', group: 'Oil', currency: 'USD', detail: 'USO ETF proxy' },
  CPER: { name: 'Đồng', className: 'Commodity proxy', group: 'Copper', currency: 'USD', detail: 'CPER ETF proxy' },
  DBA: { name: 'Nông sản', className: 'Commodity proxy', group: 'Agriculture', currency: 'USD', detail: 'DBA ETF proxy' },
};

export const BENCHMARKS = {
  'E1VFVN30.VN': { name: 'VN30 ETF', className: 'Benchmark ETF', group: 'Vietnam equity', currency: 'VND' },
  'FUEVFVND.VN': { name: 'VN Diamond ETF', className: 'Benchmark ETF', group: 'Vietnam equity', currency: 'VND' },
  GLD: COMMODITIES.GLD,
  SLV: COMMODITIES.SLV,
};

const STOCK_RE = /^[A-Z0-9]{2,10}\.VN$/;

export function normalizeStockSymbol(raw) {
  const text = String(raw || '').trim().toUpperCase();
  const symbol = STOCK_RE.test(text) ? text : /^[A-Z0-9]{2,10}$/.test(text) ? `${text}.VN` : '';
  if (!symbol) throw new Error('Mã cổ phiếu Việt Nam phải có dạng FPT hoặc FPT.VN.');
  return symbol;
}

export function instrumentFor(symbol) {
  if (COMMODITIES[symbol]) return COMMODITIES[symbol];
  if (BENCHMARKS[symbol]) return BENCHMARKS[symbol];
  if (STOCK_RE.test(symbol)) return { name: symbol.replace(/\.VN$/, ''), className: 'Equity', group: 'Vietnam stock', currency: 'VND' };
  return null;
}

export function benchmarkFor(symbol) {
  const instrument = instrumentFor(symbol);
  if (!instrument || (!BENCHMARKS[symbol] && !STOCK_RE.test(symbol))) return null;
  return { ...instrument, symbol, label: BENCHMARKS[symbol] ? `${instrument.name} (${symbol})` : `${symbol} (mã VN tự chọn)` };
}
