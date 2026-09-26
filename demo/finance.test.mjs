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
