import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { analyzePortfolio, parseMarketCsv } from './finance.mjs';

const rows = parseMarketCsv(readFileSync(new URL('../data/sample_market_data.csv', import.meta.url), 'utf8'));
const baseInput = {
  holdings: [
    { symbol: 'FPT.VN', weight: 40 },
    { symbol: 'HPG.VN', weight: 35 },
    { symbol: 'GLD', weight: 25 },
  ],
  startDate: '2026-07-01',
  endDate: '2026-07-15',
  maxAssetPercent: 80,
  maxCommodityPercent: 60,
};

const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test('Holding amounts in VND reproduce the original capital and weights', () => {
  const input={...baseInput,holdings:baseInput.holdings.map(h=>({symbol:h.symbol,value:h.weight*1000000,inputCurrency:'VND'}))};
  const result=analyzePortfolio(rows,input);
  near(result.initialCapital,100000000);
  result.current.weights.forEach((w,i)=>near(w,baseInput.holdings[i].weight/100));
});
test('USD input for a VN stock uses first common session FX, not last FX', () => {
  const result=analyzePortfolio(rows,{...baseInput,benchmarkSymbol:'FPT.VN',holdings:[{symbol:'FPT.VN',value:1000,inputCurrency:'USD'},{symbol:'HPG.VN',value:30000000,inputCurrency:'VND'}]});
  const fx=Number(rows.find(r=>r.symbol==='USDVND'&&r.session_date===result.dates[0]).close);
  near(result.initialCapital,1000*fx+30000000);
  near(result.current.weights[0],1000*fx/result.initialCapital);
  near(result.current.valuePath[0],result.initialCapital,1e-6);
  assert.throws(()=>analyzePortfolio(rows.filter(r=>r.symbol!=='USDVND'),{...baseInput,benchmarkSymbol:'FPT.VN',holdings:[{symbol:'FPT.VN',value:1000,inputCurrency:'USD'},{symbol:'HPG.VN',value:30000000,inputCurrency:'VND'}]}),/5 ngày/);
});
test('Amount inputs reject zero, negative, mixed modes and unknown currencies', () => {
  for(const item of [{value:0,inputCurrency:'VND'},{value:-1,inputCurrency:'USD'},{value:10,inputCurrency:'EUR'},{weight:50}]) assert.throws(()=>analyzePortfolio(rows,{...baseInput,holdings:[{symbol:'FPT.VN',value:10,inputCurrency:'VND'},{symbol:'HPG.VN',...item}]}),/giá trị/);
});

test('T01 normal: stocks and gold proxy produce the full brief', () => {
  const result = analyzePortfolio(rows, baseInput);
  assert.equal(result.observations, 10);
  assert.deepEqual(result.symbols, ['FPT.VN', 'HPG.VN', 'GLD']);
  assert.equal(result.groups.length, 2);
  assert.ok(Number.isFinite(result.current.volatility));
  assert.ok(Number.isFinite(result.reference.volatility));
  assert.ok(Number.isFinite(result.activeReturn));
});

test('T02 boundary: 0% holding keeps allocation and output finite', () => {
  const result = analyzePortfolio(rows, {
    ...baseInput,
    holdings: [{ symbol: 'FPT.VN', weight: 100 }, { symbol: 'GLD', weight: 0 }],
  });
  near(result.current.contribution[1], 0);
  near(result.current.riskContribution[1], 0);
  near(result.current.periodReturn, result.prices['FPT.VN'].at(-1) / result.prices['FPT.VN'][0] - 1);
});

test('T03 invalid: weight total and duplicate ticker are rejected', () => {
  assert.throws(() => analyzePortfolio(rows, { ...baseInput, holdings: [{ symbol: 'FPT.VN', weight: 40 }, { symbol: 'HPG.VN', weight: 35 }] }), /100%/);
  assert.throws(() => analyzePortfolio(rows, { ...baseInput, holdings: [{ symbol: 'FPT.VN', weight: 50 }, { symbol: 'FPT.VN', weight: 50 }] }), /trùng/);
});

test('T04 financial: contribution identities and FX conversion reconcile', () => {
  const result = analyzePortfolio(rows, baseInput);
  near(result.current.contribution.reduce((sum, value) => sum + value, 0), result.current.periodReturn);
  near(result.current.riskContribution.reduce((sum, value) => sum + value, 0), result.current.volatility);
  near(result.groups.reduce((sum, group) => sum + group.contribution, 0), result.current.periodReturn);
  const firstGld = 370.600006 * 26255;
  near(result.prices.GLD[0], firstGld, 1e-5);
  near(result.activeReturn, result.current.periodReturn - result.benchmark.periodReturn);
});

test('FX decomposition reconciles both return and covariance risk', () => {
  const result=analyzePortfolio(rows,baseInput);
  near(Object.values(result.fxRisk).reduce((s,v)=>s+v,0),result.current.volatility);
  result.symbols.forEach((symbol,i)=>{
    const local=result.localPrices[symbol].at(-1)/result.localPrices[symbol][0]-1;
    const fx=result.instruments[symbol].currency==='USD'?result.fxRates.at(-1)/result.fxRates[0]-1:0;
    near(result.current.weights[i]*(local+fx+local*fx),result.current.contribution[i]);
  });
});
test('VN-only portfolio has zero FX risk even when input amount is USD', () => {
  const result=analyzePortfolio(rows,{...baseInput,benchmarkSymbol:'FPT.VN',holdings:[{symbol:'FPT.VN',value:1000,inputCurrency:'USD'},{symbol:'HPG.VN',value:30000000,inputCurrency:'VND'}]});
  near(result.fxRisk.fx,0);near(result.fxRisk.interaction,0);near(result.fxRisk.local,result.current.volatility);
});
test('Flat prices and flat FX produce finite zero risk components',()=>{
  const result=analyzePortfolio(rows.map(row=>({...row,close:100})),baseInput);
  Object.values(result.fxRisk).forEach(v=>near(v,0));
});
test('T05 financial: minimum variance reference obeys caps and improves estimated risk', () => {
  const result = analyzePortfolio(rows, baseInput);
  near(result.reference.weights.reduce((sum, weight) => sum + weight, 0), 1);
  assert.ok(result.reference.weights.every((weight) => weight >= 0 && weight <= 0.8));
  assert.ok(result.reference.weights[2] <= 0.6);
  assert.ok(result.reference.volatility <= result.current.volatility + 1e-10);
});

test('T06 invalid: insufficient dates and infeasible cap give clear errors', () => {
  assert.throws(() => analyzePortfolio(rows, { ...baseInput, startDate: '2026-07-13' }), /5 ngày giá chung/);
  assert.throws(() => analyzePortfolio(rows, { ...baseInput, maxAssetPercent: 30 }), /quá thấp/);
});

test('T07 capital-based chart starts at input value and PnL reconciles', () => {
  const result = analyzePortfolio(rows, { ...baseInput, initialCapital: 250000000 });
  near(result.current.valuePath[0], 250000000, 1e-5);
  near(result.reference.valuePath[0], 250000000, 1e-5);
  near(result.benchmark.valuePath[0], 250000000, 1e-5);
  near(result.current.pnlPath.at(-1), result.current.valuePath.at(-1) - 250000000, 1e-5);
  near(result.current.pnlPath.at(-1), 250000000 * result.current.periodReturn, 1e-5);
});

test('T08 user-selected VN ticker and benchmark work without USD/FX', () => {
  const extra = rows.filter((row) => row.symbol === 'FPT.VN').map((row) => ({ ...row, symbol: 'VCB.VN', close: Number(row.close) * 0.8 }));
  const benchmark = rows.filter((row) => row.symbol === 'FPT.VN').map((row) => ({ ...row, symbol: 'E1VFVN30.VN', close: Number(row.close) * 0.35 }));
  const result = analyzePortfolio([...rows, ...extra, ...benchmark], {
    ...baseInput,
    holdings: [{ symbol: 'VCB', weight: 55 }, { symbol: 'HPG.VN', weight: 45 }],
    benchmarkSymbol: 'E1VFVN30.VN',
    initialCapital: 120000000,
  });
  assert.deepEqual(result.symbols, ['VCB.VN', 'HPG.VN']);
  assert.equal(result.benchmark.symbol, 'E1VFVN30.VN');
  assert.equal(result.observations, 10);
  near(result.current.valuePath[0], 120000000, 1e-5);
});

test('T09 invalid capital and unknown commodity code are rejected', () => {
  assert.throws(() => analyzePortfolio(rows, { ...baseInput, initialCapital: 0 }), /Giá trị danh mục/);
  assert.throws(() => analyzePortfolio(rows, { ...baseInput, holdings: [{ symbol: 'FPT.VN', weight: 50 }, { symbol: 'GC=F', weight: 50 }] }), /Mã cổ phiếu Việt Nam/);
});

test('T10 benchmark holes do not cut portfolio dates or change risk estimates', () => {
  const full = analyzePortfolio(rows, baseInput);
  const bm = rows.filter((row) => row.symbol === 'FPT.VN').filter((_, index) => index === 3 || index === 8).map((row) => ({ ...row, symbol: 'FUESSV30.VN' }));
  const sparse = analyzePortfolio([...rows, ...bm], { ...baseInput, benchmarkSymbol: 'FUESSV30.VN' });
  assert.deepEqual(sparse.dates, full.dates);
  near(sparse.current.volatility, full.current.volatility);
  assert.equal(sparse.benchmark.valuePath[0], null);
  near(sparse.benchmark.anchorValue, sparse.current.valuePath[3]);
  near(sparse.activeReturn, sparse.current.path[8] / sparse.current.path[3] - 1 - sparse.benchmark.periodReturn);
});

test('T11 absent benchmark preserves portfolio and returns null comparisons', () => {
  const result = analyzePortfolio(rows, { ...baseInput, benchmarkSymbol: 'FUESSV30.VN' });
  assert.equal(result.observations, 10);
  assert.equal(result.benchmark.available, false);
  assert.equal(result.activeReturn, null);
  assert.ok(result.benchmark.valuePath.every((value) => value === null));
});

test('T12 benchmark-only FX does not cut VN holdings dates', () => {
  const noFx = rows.filter((row) => row.symbol !== 'USDVND');
  const result = analyzePortfolio(noFx, { ...baseInput, holdings: [{ symbol: 'FPT.VN', weight: 50 }, { symbol: 'HPG.VN', weight: 50 }] });
  assert.equal(result.observations, 10);
  assert.equal(result.benchmark.available, false);
});

test('T13 long holes are excluded from daily risk estimates', () => {
  const shifted = rows.map((row) => ({ ...row, session_date: row.session_date >= '2026-07-08' ? row.session_date.replace('2026-07', '2026-08') : row.session_date }));
  const result = analyzePortfolio(shifted, { ...baseInput, endDate: '2026-08-15' });
  assert.equal(result.riskObservations, result.observations - 2);
  assert.ok(result.warnings.some((warning) => warning.includes('7 ngày')));
});
