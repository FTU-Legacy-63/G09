import { quantile, tailRisk } from './metrics.mjs';

function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function simulationInput(data) {
  if (!data.returns || !data.riskIndices) throw Error('Bản kết quả cũ chưa có dữ liệu mô phỏng. Hãy phân tích lại.');
  const value = data.current.valuePath.at(-1);
  return {
    symbols: data.symbols, capital: value,
    weights: data.symbols.map((symbol, i) => data.current.weights[i] * data.prices[symbol].at(-1) / data.prices[symbol][0] * data.initialCapital / value),
    vectors: data.riskIndices.map((_, j) => data.symbols.map(symbol => data.returns[symbol][j])),
    indices: data.riskIndices,
    historyStart: data.dates[0], historyEnd: data.dates.at(-1),
  };
}
export function simulatePortfolio(input, { paths = 2000, horizon = 252, seed = 42, blockLength = 5 } = {}) {
  const { vectors, weights, capital } = input;
  if (!Number.isInteger(paths) || paths < 100 || paths > 5000 || !Number.isInteger(horizon) || horizon < 1 || horizon > 504 || !Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) throw Error('Chọn 100–5.000 mô phỏng, 1–504 phiên và seed nguyên 0–4294967295.');
  if (!vectors || vectors.length < 60 || !weights?.length || weights.length > 30 || !Number.isFinite(capital) || capital <= 0 || weights.some(w => !Number.isFinite(w) || w < 0) || Math.abs(weights.reduce((a, b) => a + b, 0) - 1) > 1e-8) throw Error('Cần ít nhất 60 return chung và tỷ trọng hợp lệ để mô phỏng.');
  if (vectors.some(row => row.length !== weights.length || row.some(r => !Number.isFinite(r) || r <= -1))) throw Error('Return mô phỏng phải hữu hạn và lớn hơn −100%.');
  if (!Number.isInteger(blockLength) || blockLength < 1 || blockLength > 20) throw Error('Độ dài block phải từ 1 đến 20 phiên.');
  const originalIndices = input.indices || vectors.map((_, i) => i);
  let starts = [], block = Math.min(blockLength, vectors.length);
  for (let i = 0; i <= vectors.length - block; i++) if (originalIndices.slice(i + 1, i + block).every((v, j) => v === originalIndices[i + j] + 1)) starts.push(i);
  if (!starts.length) { block = 1; starts = vectors.map((_, i) => i); }
  const random = randomGenerator(seed), step = Math.max(1, Math.ceil(horizon / 100));
  const checkpoints = [0, ...Array.from({ length: Math.floor(horizon / step) }, (_, i) => (i + 1) * step)];
  if (checkpoints.at(-1) !== horizon) checkpoints.push(horizon);
  const checkpointMap = new Map(checkpoints.map((day, i) => [day, i]));
  const samples = checkpoints.map(() => []), terminal = [];
  for (let path = 0; path < paths; path++) {
    const growth = weights.map(() => 1); samples[0].push(capital);
    let cursor = 0, start = 0, value = capital;
    for (let day = 1; day <= horizon; day++) {
      if (cursor === 0) start = starts[Math.floor(random() * starts.length)];
      const vector = vectors[start + cursor];
      for (let i = 0; i < weights.length; i++) growth[i] *= 1 + vector[i];
      value = capital * weights.reduce((sum, weight, i) => sum + weight * growth[i], 0);
      if (!Number.isFinite(value)) throw Error('Mô phỏng vượt giới hạn số; rút ngắn horizon hoặc kiểm tra dữ liệu.');
      if (checkpointMap.has(day)) samples[checkpointMap.get(day)].push(value);
      cursor = (cursor + 1) % block;
    }
    terminal.push(value);
  }
  const low = Math.min(...terminal), high = Math.max(...terminal), binWidth = (high - low) / 20 || Math.max(1, Math.abs(low) * .001);
  const histogram = Array.from({ length: 20 }, (_, i) => ({ from: low + i * binWidth, to: low + (i + 1) * binWidth, count: 0 }));
  terminal.forEach(value => histogram[Math.min(19, Math.floor((value - low) / binWidth))].count++);
  return {
    paths, horizon, seed, blockLength: block, observations: vectors.length, capital,
    weights, symbols: input.symbols, historyStart: input.historyStart, historyEnd: input.historyEnd,
    fan: checkpoints.map((day, i) => ({ day, p05: quantile(samples[i], .05), p25: quantile(samples[i], .25), p50: quantile(samples[i], .5), p75: quantile(samples[i], .75), p95: quantile(samples[i], .95) })),
    percentiles: [0.05, .25, .5, .75, .95].map(p => ({ percentile: p, value: quantile(terminal, p) })),
    lossProbability: terminal.filter(v => v < capital).length / paths,
    averageValue: terminal.reduce((a, b) => a + b, 0) / paths,
    tail: tailRisk(terminal.map(value => value / capital - 1)), histogram,
    method: 'Joint moving-block historical bootstrap; buy-and-hold ending weights; VND returns include FX; no fees/taxes.',
  };
}
