import { COMMODITIES, benchmarkFor, instrumentFor, normalizeInstrumentSymbol } from './instruments.mjs';
import { minimumVariance } from './optimizer.mjs';

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

export function analyzePortfolio(rows, input) {
  const { holdings, startDate, endDate, maxAssetPercent = 80, maxCommodityPercent = 60, benchmarkSymbol = BENCHMARK.symbol, initialCapital = 100000000 } = input;
  if (!Array.isArray(holdings) || holdings.length < 2 || holdings.length > 30) {
    throw new Error('Chọn từ 2 đến 30 tài sản để phân tích.');
  }
  const symbols = holdings.map((item) => {
    const raw = String(item.symbol || '').trim().toUpperCase();
    return normalizeInstrumentSymbol(raw);
  });
  if (new Set(symbols).size !== symbols.length) {
    throw new Error('Mã tài sản bị trùng.');
  }
  const selectedBenchmark = benchmarkFor(String(benchmarkSymbol || '').trim().toUpperCase());
  if (!selectedBenchmark) throw new Error('Benchmark không thuộc danh sách hỗ trợ.');
  let capital = Number(initialCapital);
  if (!Number.isFinite(capital) || capital <= 0 || capital > 1e15) throw new Error('Giá trị danh mục đầu kỳ phải lớn hơn 0 VND.');
  const amountMode = holdings.some(item => item.value !== undefined);
  const inputNeedsFx = amountMode && holdings.some(item => item.inputCurrency === 'USD');
  let weightNumbers = amountMode ? holdings.map(() => 100 / holdings.length) : holdings.map((item) => Number(item.weight));
  if (amountMode && holdings.some(item => !Number.isFinite(Number(item.value)) || Number(item.value) <= 0 || Number(item.value) > 1e15 || !['USD','VND'].includes(item.inputCurrency))) throw new Error('Mỗi tài sản cần giá trị lớn hơn 0 và currency USD hoặc VND.');
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
  if (symbols.some(symbol=>instruments[symbol].className==='Benchmark index')) throw new Error('Chỉ số chỉ dùng làm benchmark, không phải vị thế đầu tư.');
  const needsFx = inputNeedsFx || Object.values(instruments).some((instrument) => instrument.currency === 'USD');
  const required = [...new Set([...symbols, selectedBenchmark.symbol, ...(needsFx ? ['USDVND'] : [])])];
  const portfolioRequired = [...symbols, ...(inputNeedsFx || symbols.some((symbol) => instruments[symbol].currency === 'USD') ? ['USDVND'] : [])];
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
  const dates = [...observations.keys()].sort().filter((date) => portfolioRequired.every((symbol) => observations.get(date)[symbol] !== undefined));
  if (dates.length < 5) throw new Error('Cần ít nhất 5 ngày giá chung để chạy bản demo. Hãy chọn khoảng dài hơn.');
  if (amountMode) {
    const values = holdings.map(item => Number(item.value) * (item.inputCurrency === 'USD' ? observations.get(dates[0]).USDVND : 1));
    capital = values.reduce((sum, value) => sum + value, 0);
    if (!Number.isFinite(capital) || capital > 1e15) throw new Error('Tổng giá trị quy đổi vượt giới hạn 1 triệu tỷ VND.');
    weightNumbers = values.map(value => value / capital * 100);
  }

  const prices = {};
  for (const symbol of [...new Set([...symbols, selectedBenchmark.symbol])]) {
    prices[symbol] = dates.map((date) => {
      const point = observations.get(date);
      if (point[symbol] === undefined || (instruments[symbol].currency === 'USD' && point.USDVND === undefined)) return null;
      return point[symbol] * (instruments[symbol].currency === 'USD' ? point.USDVND : 1);
    });
  }
  const riskIndices = dates.slice(1).map((date, index) => index + 1).filter((index) => (Date.parse(dates[index]) - Date.parse(dates[index - 1])) / 86400000 <= 7);
  if (riskIndices.length < 2) throw new Error('Không đủ phiên liên tiếp để tính volatility; hãy đổi khoảng ngày hoặc tài sản.');
  const returns = Object.fromEntries(symbols.map((symbol) => [symbol,
    riskIndices.map((index) => prices[symbol][index] / prices[symbol][index - 1] - 1),
  ]));
  const covariance = symbols.map((left) => symbols.map((right) => sampleCovariance(returns[left], returns[right])));
  const currentWeights = weightNumbers.map((weight) => weight / 100);
  const current = portfolioResult(symbols, currentWeights, prices, covariance, capital);
  const localPrices = Object.fromEntries(symbols.map(symbol => [symbol, dates.map(date => observations.get(date)[symbol])]));
  const fxRates = dates.map(date => observations.get(date).USDVND ?? null);
  // Exact domestic-return identity, with the interaction reported separately.
  const componentNames = ['local', 'fx', 'interaction'];
  const componentSeries = Object.fromEntries(componentNames.map(name => [name, riskIndices.map(() => 0)]));
  for (const [i, symbol] of symbols.entries()) {
    for (const [j, index] of riskIndices.entries()) {
      const local = localPrices[symbol][index] / localPrices[symbol][index - 1] - 1;
      const fx = instruments[symbol].currency === 'USD' ? fxRates[index] / fxRates[index - 1] - 1 : 0;
      componentSeries.local[j] += currentWeights[i] * local;
      componentSeries.fx[j] += currentWeights[i] * fx;
      componentSeries.interaction[j] += currentWeights[i] * local * fx;
    }
  }
  const dailyPortfolio = riskIndices.map((_, j) => componentNames.reduce((sum, name) => sum + componentSeries[name][j], 0));
  const dailySigma = Math.sqrt(current.dailyVariance);
  const fxRisk = Object.fromEntries(componentNames.map(name => [name, dailySigma === 0 ? 0 : sampleCovariance(componentSeries[name], dailyPortfolio) / dailySigma * Math.sqrt(252)]));
  const optimization = minimumVariance(covariance, symbols.map(s=>instruments[s].className==='Commodity proxy'), assetCap, commodityCap, currentWeights);
  const referenceWeights = optimization.weights;
  const reference = portfolioResult(symbols, referenceWeights, prices, covariance, capital);
  const benchmarkIndices = dates.map((_, index) => index).filter((index) => prices[selectedBenchmark.symbol][index] !== null);
  const benchmarkStart = benchmarkIndices[0];
  const benchmarkEnd = benchmarkIndices.at(-1);
  const benchmarkAvailable = benchmarkIndices.length >= 2;
  const benchmarkBase = benchmarkAvailable ? prices[selectedBenchmark.symbol][benchmarkStart] : null;
  const benchmarkPath = prices[selectedBenchmark.symbol].map((price) => benchmarkAvailable && price !== null ? price / benchmarkBase : null);
  const benchmarkReturn = benchmarkAvailable ? prices[selectedBenchmark.symbol][benchmarkEnd] / benchmarkBase - 1 : null;
  const comparisonPortfolioReturn = benchmarkAvailable ? current.path[benchmarkEnd] / current.path[benchmarkStart] - 1 : null;
  const comparisonReferenceReturn = benchmarkAvailable ? reference.path[benchmarkEnd] / reference.path[benchmarkStart] - 1 : null;
  const warnings = [];
  if ((Date.parse(dates[0])-Date.parse(startDate))/86400000 > 7) warnings.push(`Dữ liệu chung bắt đầu ${dates[0]}, muộn hơn ngày yêu cầu ${startDate}; kết quả chỉ phản ánh kỳ thực có, không phải toàn bộ kỳ yêu cầu.`);
  if (!optimization.converged) warnings.push('Phương án minimum variance là nghiệm xấp xỉ; solver đã đạt giới hạn vòng lặp, không khẳng định tối ưu tuyệt đối.');
  if (symbols.some(s=>instruments[s].className==='Crypto')) warnings.push('Crypto dùng giá ngày, căn chỉnh theo ngày chung với các thị trường khác; không mô phỏng giao dịch 24/7.');
  if (benchmarkIndices.length < dates.length) warnings.push(`Benchmark có giá ở ${benchmarkIndices.length}/${dates.length} phiên danh mục. Phần thiếu được để trống; không nội suy hoặc cắt chuỗi danh mục.`);
  if (riskIndices.length < dates.length - 1) warnings.push('Các khoảng giá cách nhau trên 7 ngày bị loại khỏi ước lượng volatility, không được coi là daily return.');
  if (riskIndices.length < 120) warnings.push('Dưới 120 quan sát return: ước lượng rủi ro và phân bổ tham khảo có độ tin cậy hạn chế.');
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
    localPrices,
    fxRates,
    fxRisk,
    current: { ...current, weights: currentWeights },
    reference: { ...reference, weights: referenceWeights },
    benchmark: { ...selectedBenchmark, path: benchmarkPath, valuePath: benchmarkPath.map((ratio) => ratio === null ? null : ratio * current.valuePath[benchmarkStart]), periodReturn: benchmarkReturn, available: benchmarkAvailable, comparisonStart: benchmarkAvailable ? dates[benchmarkStart] : null, comparisonEnd: benchmarkAvailable ? dates[benchmarkEnd] : null, anchorValue: benchmarkAvailable ? current.valuePath[benchmarkStart] : null, comparisonPortfolioReturn, comparisonReferenceReturn, coverage: benchmarkIndices.length },
    activeReturn: benchmarkAvailable ? comparisonPortfolioReturn - benchmarkReturn : null,
    riskObservations: riskIndices.length,
    optimization,
    warnings,
    groups,
    observations: dates.length,
    assumptions: [
      'Giá close điều chỉnh chia tách theo provider (VN: TradingView adjustment=splits); không tái đầu tư cổ tức, không gồm phí và thuế.',
      'Các commodity được biểu diễn bằng ETF proxy (GLD, SLV, USO, CPER, DBA), không phải giá spot hay vị thế futures trực tiếp.',
      'Giá USD được quy đổi theo USD/VND cùng ngày; benchmark ETF tại Việt Nam dùng giá VND.',
      'Giá trị đầu kỳ được phân bổ theo tỷ trọng và giả định mua tại giá close đầu tiên; không phải lịch sử giao dịch thực tế.',
      'Period return giả định mua và giữ với tỷ trọng đầu kỳ; volatility là ước lượng từ covariance và tỷ trọng đầu kỳ.',
      'Reference allocation ước lượng minimum variance bằng conditional gradient, long-only, cùng dữ liệu và giới hạn đã chọn; không bảo đảm nghiệm tối ưu tuyệt đối.',
      'VN dùng phiên ngày đã đóng từ TradingView/tvdatafeed, cập nhật hằng ngày hoặc tải trực tiếp khi cache thiếu/cũ; quốc tế và FX tải qua yfinance, bỏ ngày UTC đang mở. Không phải báo giá real-time.',
      'Dùng các ngày chung có đủ giá của holdings và FX, theo nhãn ngày của provider, không đồng bộ giờ đóng cửa giữa các thị trường. Annualization 252 phiên/năm là xấp xỉ, kể cả khi có crypto.',
      'Commodity proxy có thể nắm giữ vật chất hoặc hợp đồng futures; phí quỹ và roll effects nằm trong giá proxy. Không coi return proxy là return giá spot.',
      'Chuỗi giá lịch sử không bảo đảm hiệu quả trong tương lai; không dùng kết quả làm lời khuyên đầu tư.',
    ],
  };
}
