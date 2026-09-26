import { COMMODITIES, benchmarkFor, instrumentFor, normalizeStockSymbol } from './instruments.mjs';

export const BENCHMARK = { symbol: 'GLD', label: 'Vàng (GLD ETF proxy, VND)' };

export function parseMarketCsv(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const headings = lines.shift().split(',');
  const rows = lines.map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headings.map((heading, index) => [heading, values[index]]));
  });
  if (!headings.includes('session_date') || !headings.includes('close')) {
    throw new Error('Tệp dữ liệu mẫu không đúng định dạng.');
  }
  return rows;
}

function sampleCovariance(left, right) {
  const meanLeft = left.reduce((sum, value) => sum + value, 0) / left.length;
  const meanRight = right.reduce((sum, value) => sum + value, 0) / right.length;
  return left.reduce((sum, value, index) => sum + (value - meanLeft) * (right[index] - meanRight), 0) / (left.length - 1);
}

function portfolioVariance(weights, covariance) {
  return weights.reduce((sum, weight, i) => sum + weight * weights.reduce((inner, other, j) => inner + other * covariance[i][j], 0), 0);
}

function portfolioResult(symbols, weights, prices, covariance, initialCapital) {
  const firstValues = symbols.map((symbol) => prices[symbol][0]);
  const normalizedPaths = symbols.map((symbol, i) => prices[symbol].map((price) => price / firstValues[i]));
  const path = prices[symbols[0]].map((_, dateIndex) =>
    normalizedPaths.reduce((sum, assetPath, i) => sum + weights[i] * assetPath[dateIndex], 0),
  );
  const periodReturn = path.at(-1) - 1;
  const contribution = symbols.map((symbol, i) => weights[i] * (normalizedPaths[i].at(-1) - 1));
  const dailyVariance = Math.max(0, portfolioVariance(weights, covariance));
  const dailyVolatility = Math.sqrt(dailyVariance);
  const volatility = dailyVolatility * Math.sqrt(252);
  const riskContribution = symbols.map((_, i) => {
    if (dailyVolatility === 0) return 0;
    const marginal = weights.reduce((sum, weight, j) => sum + covariance[i][j] * weight, 0);
    return weights[i] * marginal / dailyVolatility * Math.sqrt(252);
  });
  return {
    path,
    valuePath: path.map((ratio) => ratio * initialCapital),
    pnlPath: path.map((ratio) => (ratio - 1) * initialCapital),
    periodReturn,
    contribution,
    volatility,
    riskContribution,
    dailyVariance,
  };
}

function optimizeOnOnePercentGrid(symbols, covariance, maxAssetWeight, maxCommodityWeight) {
  const cap = Math.round(maxAssetWeight * 100);
  const commodityCap = Math.round(maxCommodityWeight * 100);
  let best = null;
  const units = Array(symbols.length).fill(0);

  function search(index, remaining, commodityUnits) {
    if (index === symbols.length) {
      if (remaining !== 0) return;
      const weights = units.map((unit) => unit / 100);
      const variance = portfolioVariance(weights, covariance);
      if (!best || variance < best.variance) best = { weights, variance };
      return;
    }
    const isCommodity = instrumentFor(symbols[index]).className === 'Commodity proxy';
    const upper = Math.min(cap, remaining, isCommodity ? commodityCap - commodityUnits : 100);
    for (let unit = 0; unit <= upper; unit += 1) {
      units[index] = unit;
      search(index + 1, remaining - unit, commodityUnits + (isCommodity ? unit : 0));
    }
  }

  search(0, 100, 0);
  if (!best) throw new Error('Giới hạn tỷ trọng không khả thi với các mã đã chọn.');
  return best.weights;
}

export function analyzePortfolio(rows, input) {
  const { holdings, startDate, endDate, maxAssetPercent = 80, maxCommodityPercent = 60, benchmarkSymbol = BENCHMARK.symbol, initialCapital = 100000000 } = input;
  if (!Array.isArray(holdings) || holdings.length < 2 || holdings.length > 3) {
    throw new Error('Chọn từ 2 đến 3 tài sản để phân tích.');
  }
  const symbols = holdings.map((item) => {
    const raw = String(item.symbol || '').trim().toUpperCase();
    return COMMODITIES[raw] ? raw : normalizeStockSymbol(raw);
  });
  if (new Set(symbols).size !== symbols.length) {
    throw new Error('Mã tài sản bị trùng.');
  }
  const selectedBenchmark = benchmarkFor(String(benchmarkSymbol || '').trim().toUpperCase());
  if (!selectedBenchmark) throw new Error('Benchmark không thuộc danh sách hỗ trợ.');
  const capital = Number(initialCapital);
  if (!Number.isFinite(capital) || capital <= 0 || capital > 1e15) throw new Error('Giá trị danh mục đầu kỳ phải lớn hơn 0 VND.');
  const weightNumbers = holdings.map((item) => Number(item.weight));
  if (weightNumbers.some((weight) => !Number.isFinite(weight) || weight < 0 || weight > 100)) {
    throw new Error('Mỗi tỷ trọng phải là số từ 0% đến 100%.');
  }
  const total = weightNumbers.reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 100) > 0.01) throw new Error(`Tổng tỷ trọng phải bằng 100%, hiện là ${total.toFixed(2)}%.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || startDate >= endDate) {
    throw new Error('Khoảng thời gian không hợp lệ. Ngày bắt đầu phải trước ngày kết thúc.');
  }
  const assetCap = Number(maxAssetPercent) / 100;
  const commodityCap = Number(maxCommodityPercent) / 100;
  if (![assetCap, commodityCap].every((cap) => Number.isFinite(cap) && cap >= 0 && cap <= 1)) {
    throw new Error('Giới hạn tỷ trọng phải nằm trong khoảng 0% đến 100%.');
  }
  if (assetCap * symbols.length < 1 - 1e-9) {
    throw new Error('Giới hạn mỗi mã quá thấp để tổng tỷ trọng đạt 100%.');
  }

  const instruments = Object.fromEntries([...new Set([...symbols, selectedBenchmark.symbol])].map((symbol) => [symbol, instrumentFor(symbol)]));
  const needsFx = Object.values(instruments).some((instrument) => instrument.currency === 'USD');
  const required = [...new Set([...symbols, selectedBenchmark.symbol, ...(needsFx ? ['USDVND'] : [])])];
  const observations = new Map();
  for (const row of rows) {
    if (row.session_date < startDate || row.session_date > endDate || !required.includes(row.symbol)) continue;
    const close = Number(row.close);
    if (!Number.isFinite(close) || close <= 0) throw new Error(`Giá không hợp lệ cho ${row.symbol}.`);
    const day = observations.get(row.session_date) || {};
    if (day[row.symbol] !== undefined) throw new Error(`Dữ liệu giá bị trùng cho ${row.symbol} ngày ${row.session_date}.`);
    day[row.symbol] = close;
    observations.set(row.session_date, day);
  }
  const dates = [...observations.keys()].sort().filter((date) => required.every((symbol) => observations.get(date)[symbol] !== undefined));
  if (dates.length < 5) throw new Error('Cần ít nhất 5 ngày giá chung để chạy bản demo. Hãy chọn khoảng dài hơn.');

  const prices = {};
  for (const symbol of [...new Set([...symbols, selectedBenchmark.symbol])]) {
    prices[symbol] = dates.map((date) => {
      const point = observations.get(date);
      return point[symbol] * (instruments[symbol].currency === 'USD' ? point.USDVND : 1);
    });
  }
  const returns = Object.fromEntries(Object.entries(prices).map(([symbol, series]) => [symbol,
    series.slice(1).map((price, index) => price / series[index] - 1),
  ]));
  const covariance = symbols.map((left) => symbols.map((right) => sampleCovariance(returns[left], returns[right])));
  const currentWeights = weightNumbers.map((weight) => weight / 100);
  const current = portfolioResult(symbols, currentWeights, prices, covariance, capital);
  const referenceWeights = optimizeOnOnePercentGrid(symbols, covariance, assetCap, commodityCap);
  const reference = portfolioResult(symbols, referenceWeights, prices, covariance, capital);
  const benchmarkPath = prices[selectedBenchmark.symbol].map((price) => price / prices[selectedBenchmark.symbol][0]);
  const benchmarkReturn = benchmarkPath.at(-1) - 1;
  const groups = [...new Set(symbols.map((symbol) => instruments[symbol].className))].map((className) => ({
    className,
    weight: symbols.reduce((sum, symbol, i) => sum + (instruments[symbol].className === className ? currentWeights[i] : 0), 0),
    contribution: symbols.reduce((sum, symbol, i) => sum + (instruments[symbol].className === className ? current.contribution[i] : 0), 0),
  }));
  return {
    dates,
    symbols,
    instruments,
    initialCapital: capital,
    prices,
    current: { ...current, weights: currentWeights },
    reference: { ...reference, weights: referenceWeights },
    benchmark: { ...selectedBenchmark, path: benchmarkPath, valuePath: benchmarkPath.map((ratio) => ratio * capital), periodReturn: benchmarkReturn },
    activeReturn: current.periodReturn - benchmarkReturn,
    groups,
    observations: dates.length,
    assumptions: [
      'Giá close chưa điều chỉnh; không gồm cổ tức, phí và thuế.',
      'Các commodity được biểu diễn bằng ETF proxy (GLD, SLV, USO, CPER, DBA), không phải giá spot hay vị thế futures trực tiếp.',
      'Giá USD được quy đổi theo USD/VND cùng ngày; benchmark ETF tại Việt Nam dùng giá VND.',
      'Giá trị đầu kỳ được phân bổ theo tỷ trọng và giả định mua tại giá close đầu tiên; không phải lịch sử giao dịch thực tế.',
      'Period return giả định mua và giữ với tỷ trọng đầu kỳ; volatility là ước lượng từ covariance và tỷ trọng đầu kỳ.',
      'Reference allocation tối thiểu hóa variance trên lưới 1%, long-only, cùng dữ liệu và giới hạn đã chọn.',
      'yfinance tải giá mới khi phân tích; phiên gần nhất có thể trễ và không phải giá giao dịch real-time.',
      'Chuỗi giá lịch sử không bảo đảm hiệu quả trong tương lai; không dùng kết quả làm lời khuyên đầu tư.',
    ],
  };
}
