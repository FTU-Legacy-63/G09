import { analyzePortfolio } from './finance.mjs';
import { COMMODITIES, normalizeStockSymbol } from './instruments.mjs';

const form = document.querySelector('#portfolio-form');
const holdingsList = document.querySelector('#holdings-list');
const errorBox = document.querySelector('#form-error');
const resultContent = document.querySelector('#result-content');
const emptyState = document.querySelector('#empty-state');
let holdings = [
  { kind: 'stock', symbol: 'FPT.VN', weight: 40 },
  { kind: 'stock', symbol: 'HPG.VN', weight: 35 },
  { kind: 'commodity', symbol: 'GLD', weight: 25 },
];
let result = null;
let stockSearch = null;

const percent = (value, digits = 2) => `${(value * 100).toFixed(digits)}%`;
const points = (value) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)} đ.%`;
const signedPercent = (value) => `${value >= 0 ? '+' : ''}${percent(value)}`;
const vnd = (value) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(value))} ₫`;
const signedVnd = (value) => `${value >= 0 ? '+' : '-'}${vnd(Math.abs(value))}`;
const compactVnd = (value) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${(value / 1e9).toFixed(1)} tỷ`;
  if (absolute >= 1e6) return `${(value / 1e6).toFixed(0)} tr`;
  return `${(value / 1e3).toFixed(0)} nghìn`;
};
const dateLabel = (date) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function drawHoldings() {
  closeStockSearch();
  holdingsList.innerHTML = holdings.map((holding, index) => `
    <div class="holding-row">
      <label class="asset-kind-wrap"><span class="visually-hidden">Loại tài sản ${index + 1}</span><select data-index="${index}" data-field="kind" aria-label="Loại tài sản ${index + 1}"><option value="stock" ${holding.kind === 'stock' ? 'selected' : ''}>Cổ phiếu VN</option><option value="commodity" ${holding.kind === 'commodity' ? 'selected' : ''}>Commodity</option></select></label>
      ${holding.kind === 'stock'
    ? `<div class="asset-symbol-wrap stock-picker"><label for="stock-search-${index}" class="visually-hidden">Tìm cổ phiếu ${index + 1}</label><input id="stock-search-${index}" type="search" role="combobox" data-index="${index}" data-field="stock-search" value="${escapeHtml(holding.symbol)}" spellcheck="false" autocomplete="off" aria-autocomplete="list" aria-expanded="false" aria-controls="stock-options-${index}" aria-label="Tìm cổ phiếu ${index + 1} theo tên hoặc mã" placeholder="Tìm tên công ty hoặc mã..." /><div id="stock-options-${index}" class="stock-options" role="listbox" aria-label="Kết quả tìm cổ phiếu ${index + 1}" hidden></div></div>`
    : `<label class="asset-symbol-wrap"><span class="visually-hidden">Commodity ${index + 1}</span><select data-index="${index}" data-field="symbol" aria-label="Commodity ${index + 1}">${Object.entries(COMMODITIES).map(([symbol, info]) => `<option value="${symbol}" ${holding.symbol === symbol ? 'selected' : ''}>${info.name} (${symbol} proxy)</option>`).join('')}</select></label>`}
      <label class="weight-wrap"><span class="visually-hidden">Tỷ trọng mã ${index + 1}</span><input type="number" data-index="${index}" data-field="weight" min="0" max="100" step="0.1" value="${holding.weight}" aria-label="Tỷ trọng ${escapeHtml(holding.symbol)}" /><span>%</span></label>
      <button type="button" class="remove-row" data-remove="${index}" aria-label="Xóa ${escapeHtml(holding.symbol)}">×</button>
    </div>`).join('');
  updateTotal();
}

function closeStockSearch() {
  if (!stockSearch) return;
  clearTimeout(stockSearch.timer);
  stockSearch.controller?.abort();
  stockSearch.input.setAttribute('aria-expanded', 'false');
  stockSearch.input.removeAttribute('aria-activedescendant');
  stockSearch.list.hidden = true;
  stockSearch = null;
}

function renderStockOptions(search, message = '') {
  if (stockSearch !== search) return;
  search.list.innerHTML = message
    ? `<div class="stock-search-message" role="status">${escapeHtml(message)}</div>`
    : search.results.map((item, index) => `<div id="stock-option-${search.index}-${index}" class="stock-option${index === search.activeIndex ? ' active' : ''}" role="option" aria-selected="${index === search.activeIndex}" data-stock-option="${index}"><strong>${escapeHtml(item.symbol)}</strong><span>${escapeHtml(item.name)}</span><small>${escapeHtml(item.exchange || 'VN')}</small></div>`).join('');
  search.list.hidden = false;
  search.input.setAttribute('aria-expanded', 'true');
  if (search.activeIndex >= 0 && !message) search.input.setAttribute('aria-activedescendant', `stock-option-${search.index}-${search.activeIndex}`);
  else search.input.removeAttribute('aria-activedescendant');
}

function selectStock(search, item) {
  if (stockSearch !== search) return;
  holdings[search.index].symbol = item.symbol;
  closeStockSearch();
  drawHoldings();
  showError('');
  invalidateResult();
  holdingsList.querySelector(`[data-field="weight"][data-index="${search.index}"]`).focus({ preventScroll: true });
}

function startStockSearch(input) {
  if (stockSearch?.input !== input) closeStockSearch();
  if (!stockSearch) stockSearch = { input, index: Number(input.dataset.index), list: input.nextElementSibling, results: [], activeIndex: -1, controller: null, timer: null };
  const search = stockSearch;
  const query = input.value.trim();
  clearTimeout(search.timer);
  search.controller?.abort();
  search.results = [];
  search.activeIndex = -1;
  if (query.length < 2) return renderStockOptions(search, 'Nhập ít nhất 2 ký tự để tìm tên hoặc mã.');
  renderStockOptions(search, 'Đang tìm cổ phiếu...');
  search.timer = setTimeout(async () => {
    search.controller = new AbortController();
    try {
      const response = await fetch(`/api/search-symbols?q=${encodeURIComponent(query)}`, { signal: search.controller.signal });
      const payload = await response.json();
      if (stockSearch !== search || input.value.trim() !== query) return;
      if (!response.ok) throw new Error(payload.error || 'Không tìm được mã lúc này.');
      search.results = payload.results || [];
      renderStockOptions(search, search.results.length ? '' : 'Không có mã phù hợp. Thử tên khác hoặc ticker.');
    } catch (error) {
      if (error.name !== 'AbortError' && stockSearch === search) renderStockOptions(search, error.message || 'Không thể tìm cổ phiếu lúc này.');
    }
  }, 260);
}

function updateTotal() {
  const total = holdings.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const totalElement = document.querySelector('#weight-total');
  totalElement.textContent = `Tổng: ${total.toFixed(1)}%`;
  totalElement.classList.toggle('invalid', Math.abs(total - 100) > 0.01);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function invalidateResult() {
  if (!result) return;
  result = null;
  resultContent.hidden = true;
  emptyState.hidden = false;
  document.querySelector('#results-subtitle').textContent = 'Dữ liệu đầu vào đã thay đổi. Phân tích lại để xem kết quả mới.';
  document.querySelector('#decision-feedback').textContent = '';
}

function renderChart(data) {
  const chart = document.querySelector('#performance-chart');
  const width = Math.max(340, chart.clientWidth);
  const height = 320;
  const left = 75;
  const right = 14;
  const top = 17;
  const bottom = 43;
  const series = [
    { label: 'Danh mục', values: data.current.valuePath, className: 'line-current' },
    { label: 'Tham khảo', values: data.reference.valuePath, className: 'line-reference' },
    { label: data.benchmark.label, values: data.benchmark.valuePath, className: 'line-benchmark' },
  ];
  const allValues = series.flatMap((item) => item.values);
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const spread = Math.max(data.initialCapital * 0.01, maximum - minimum);
  const floor = Math.max(0, minimum - spread * 0.12);
  const ceiling = maximum + spread * 0.12;
  const x = (index) => left + (index / (data.dates.length - 1)) * (width - left - right);
  const y = (value) => height - bottom - ((value - floor) / (ceiling - floor)) * (height - top - bottom);
  const fractions = width < 600 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];
  const ticks = [...new Set(fractions.map((fraction) => Math.round(fraction * (data.dates.length - 1))))];
  const grid = [0, 1, 2, 3, 4].map((index) => {
    const value = floor + (ceiling - floor) * index / 4;
    const yy = y(value);
    return `<line x1="${left}" x2="${width - right}" y1="${yy}" y2="${yy}" class="chart-grid"/><text x="${left - 10}" y="${yy + 3}" text-anchor="end" class="chart-axis-label">${compactVnd(value)}</text>`;
  }).join('');
  const xLabels = ticks.map((index) => `<text x="${x(index)}" y="${height - 11}" text-anchor="${index === 0 ? 'start' : index === data.dates.length - 1 ? 'end' : 'middle'}" class="chart-axis-label">${dateLabel(data.dates[index])}</text>`).join('');
  const paths = series.map((item) => `<polyline points="${item.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')}" class="chart-line ${item.className}"/>`).join('');
  const currentPoints = series[0].values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const area = `<polygon points="${x(0)},${y(floor)} ${currentPoints} ${x(data.dates.length - 1)},${y(floor)}" fill="url(#portfolio-area)"/>`;
  chart.innerHTML = `<div class="chart-frame" tabindex="0" aria-label="Biểu đồ giá trị danh mục theo ngày. Dùng phím mũi tên trái hoặc phải để xem từng phiên."><svg role="img" aria-label="Giá trị danh mục, phương án tham khảo và benchmark theo ngày, đơn vị VND" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><defs><linearGradient id="portfolio-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#159566" stop-opacity="0.19"/><stop offset="100%" stop-color="#159566" stop-opacity="0"/></linearGradient></defs>${grid}${xLabels}${area}${paths}<line id="chart-crosshair" y1="${top}" y2="${height - bottom}" class="chart-crosshair" hidden/>${series.map((item, index) => `<circle id="chart-dot-${index}" r="5" class="chart-dot ${item.className}" hidden/>`).join('')}</svg><div id="chart-tooltip" class="chart-tooltip" role="tooltip" hidden></div></div>`;
  const frame = chart.querySelector('.chart-frame');
  const svg = chart.querySelector('svg');
  const tooltip = chart.querySelector('#chart-tooltip');
  let activeIndex = data.dates.length - 1;
  function showAt(index) {
    activeIndex = Math.max(0, Math.min(data.dates.length - 1, index));
    const xx = x(activeIndex);
    const line = chart.querySelector('#chart-crosshair');
    line.setAttribute('x1', xx);
    line.setAttribute('x2', xx);
    line.hidden = false;
    series.forEach((item, itemIndex) => {
      const dot = chart.querySelector(`#chart-dot-${itemIndex}`);
      dot.setAttribute('cx', xx);
      dot.setAttribute('cy', y(item.values[activeIndex]));
      dot.hidden = false;
    });
    tooltip.innerHTML = `<strong>${dateLabel(data.dates[activeIndex])}</strong>${series.map((item) => `<span>${escapeHtml(item.label)} <b>${vnd(item.values[activeIndex])}</b></span>`).join('')}<span class="tooltip-pnl">PnL danh mục <b>${signedVnd(data.current.pnlPath[activeIndex])}</b></span>`;
    tooltip.hidden = false;
    const pixelX = xx / width * frame.clientWidth;
    tooltip.style.left = `${Math.max(8, Math.min(frame.clientWidth - 220, pixelX + 12))}px`;
  }
  function hide() {
    tooltip.hidden = true;
    chart.querySelector('#chart-crosshair').hidden = true;
    series.forEach((_, index) => { chart.querySelector(`#chart-dot-${index}`).hidden = true; });
  }
  svg.addEventListener('pointermove', (event) => {
    const rect = svg.getBoundingClientRect();
    const coordinate = (event.clientX - rect.left) / rect.width * width;
    showAt(Math.round((coordinate - left) / (width - left - right) * (data.dates.length - 1)));
  });
  svg.addEventListener('pointerleave', hide);
  frame.addEventListener('focus', () => showAt(activeIndex));
  frame.addEventListener('blur', hide);
  frame.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showAt(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
}

function renderResult(data) {
  const { current, reference, benchmark, symbols } = data;
  emptyState.hidden = true;
  resultContent.hidden = false;
  document.querySelector('#results-subtitle').textContent = `${data.dates[0]} đến ${data.dates.at(-1)} · ${data.observations} ngày giá chung · tải lúc ${new Date(data.fetchedAtUtc).toLocaleString('vi-VN')} · base currency VND`;
  const pnl = current.valuePath.at(-1) - data.initialCapital;
  document.querySelector('#lead-headline').textContent = `Danh mục ${pnl >= 0 ? 'tăng' : 'giảm'} ${vnd(Math.abs(pnl))} trong kỳ phân tích.`;
  document.querySelector('#lead-explanation').textContent = `Giá trị đầu kỳ ${vnd(data.initialCapital)}; cuối kỳ ${vnd(current.valuePath.at(-1))}. Return ${signedPercent(current.periodReturn)} so với ${signedPercent(benchmark.periodReturn)} của ${benchmark.label}.`;
  document.querySelector('#metric-strip').innerHTML = [
    ['Giá trị cuối kỳ', vnd(current.valuePath.at(-1)), 'Danh mục hiện tại'],
    ['PnL kỳ', signedVnd(pnl), signedPercent(current.periodReturn)],
    ['Volatility ước lượng', percent(current.volatility), 'Annualized, covariance lịch sử'],
  ].map(([label, value, description]) => `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${description}</small></div>`).join('');
  document.querySelector('#chart-start-value').textContent = `Đầu kỳ: ${vnd(data.initialCapital)}`;
  document.querySelector('#benchmark-legend').textContent = benchmark.label;
  renderChart(data);
  const allocationColors = ['#1f8c5c', '#84a978', '#e2bd54'];
  const cumulative = current.weights.reduce((out, weight, index) => {
    const start = index === 0 ? 0 : out[index - 1].end;
    out.push({ start, end: start + weight * 100, color: allocationColors[index] });
    return out;
  }, []);
  document.querySelector('#allocation-visual').innerHTML = `<div class="allocation-bar" role="img" aria-label="Phân bổ danh mục hiện tại: ${symbols.map((symbol, i) => `${symbol} ${percent(current.weights[i], 0)}`).join(', ')}" style="background:linear-gradient(90deg,${cumulative.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(',')})"></div><div class="allocation-labels">${symbols.map((symbol, i) => `<div><span class="allocation-swatch" style="background:${allocationColors[i]}"></span><span>${symbol}</span><strong>${percent(current.weights[i], 0)}</strong></div>`).join('')}</div>`;
  document.querySelector('#allocation-groups').innerHTML = data.groups.map((group) => `<p><span>${escapeHtml(group.className)}</span><strong>${percent(group.weight, 0)} · ${points(group.contribution)} return</strong></p>`).join('');
  document.querySelector('#contribution-rows').innerHTML = symbols.map((symbol, i) => `<tr><th scope="row">${escapeHtml(symbol)}</th><td>${escapeHtml(data.instruments[symbol].group)}</td><td>${percent(current.weights[i], 0)}</td><td class="${current.contribution[i] >= 0 ? 'positive' : 'negative'}">${points(current.contribution[i])}</td><td>${points(current.riskContribution[i])}</td></tr>`).join('');
  document.querySelector('#contribution-total').innerHTML = `<tr><th scope="row" colspan="2">Tổng danh mục</th><td>100%</td><td>${points(current.periodReturn)}</td><td>${points(current.volatility)}</td></tr>`;
  document.querySelector('#comparison-metrics').innerHTML = `<div class="comparison-head"><span>Chỉ số</span><span>Hiện tại</span><span>Tham khảo</span></div><div><span>Return kỳ</span><strong>${signedPercent(current.periodReturn)}</strong><strong>${signedPercent(reference.periodReturn)}</strong></div><div><span>Volatility</span><strong>${percent(current.volatility)}</strong><strong>${percent(reference.volatility)}</strong></div><div><span>So với benchmark</span><strong>${points(current.periodReturn - benchmark.periodReturn)}</strong><strong>${points(reference.periodReturn - benchmark.periodReturn)}</strong></div>`;
  document.querySelector('#comparison-weights').innerHTML = `<div class="comparison-head"><span>Tỷ trọng</span><span>Hiện tại</span><span>Tham khảo</span></div>${symbols.map((symbol, i) => `<div><span>${symbol}</span><strong>${percent(current.weights[i], 0)}</strong><strong>${percent(reference.weights[i], 0)}</strong></div>`).join('')}`;
  document.querySelector('#assumptions-list').innerHTML = data.assumptions.map((assumption) => `<li>${escapeHtml(assumption)}</li>`).join('');
  document.querySelector('#decision-feedback').textContent = '';
  document.querySelector('#results').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

holdingsList.addEventListener('input', (event) => {
  const target = event.target;
  if (target.dataset.field === 'stock-search') {
    holdings[Number(target.dataset.index)].symbol = '';
    startStockSearch(target);
    showError('');
    invalidateResult();
    return;
  }
  if (!target.dataset.field) return;
  holdings[Number(target.dataset.index)][target.dataset.field] = target.dataset.field === 'weight' ? Number(target.value) : target.value;
  updateTotal();
  showError('');
  invalidateResult();
});
holdingsList.addEventListener('change', (event) => {
  const target = event.target;
  if (target.dataset.field === 'kind') {
    const holding = holdings[Number(target.dataset.index)];
    holding.kind = target.value;
    holding.symbol = target.value === 'commodity'
      ? Object.keys(COMMODITIES).find((symbol) => !holdings.some((item) => item !== holding && item.symbol === symbol)) || 'GLD'
      : ['FPT.VN', 'HPG.VN', 'VCB.VN', 'VNM.VN'].find((symbol) => !holdings.some((item) => item !== holding && item.symbol === symbol)) || 'FPT.VN';
    drawHoldings();
    invalidateResult();
  } else if (target.dataset.field === 'symbol') {
    holdings[Number(target.dataset.index)].symbol = target.value;
    drawHoldings();
    invalidateResult();
  }
});
holdingsList.addEventListener('focusin', (event) => {
  if (event.target.dataset.field === 'stock-search') startStockSearch(event.target);
});
holdingsList.addEventListener('focusout', (event) => {
  if (event.target.dataset.field === 'stock-search') setTimeout(() => {
    if (stockSearch?.input === event.target && document.activeElement !== event.target) closeStockSearch();
  }, 120);
});
holdingsList.addEventListener('keydown', (event) => {
  const search = stockSearch;
  if (!search || event.target !== search.input) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeStockSearch();
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (!search.results.length) return;
    search.activeIndex = (search.activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + search.results.length) % search.results.length;
    renderStockOptions(search);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (search.activeIndex >= 0) selectStock(search, search.results[search.activeIndex]);
  }
});
holdingsList.addEventListener('pointerdown', (event) => {
  const option = event.target.closest('[data-stock-option]');
  if (!option || !stockSearch) return;
  event.preventDefault();
  selectStock(stockSearch, stockSearch.results[Number(option.dataset.stockOption)]);
});
holdingsList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  holdings.splice(Number(button.dataset.remove), 1);
  drawHoldings();
  invalidateResult();
});
document.querySelector('#add-holding').addEventListener('click', () => {
  if (holdings.length >= 3) return showError('Demo phân tích tối đa 3 tài sản mỗi lần.');
  const next = ['FPT.VN', 'HPG.VN', 'VCB.VN', 'VNM.VN'].find((symbol) => !holdings.some((item) => item.symbol === symbol)) || 'VCB.VN';
  holdings.push({ kind: 'stock', symbol: next, weight: 0 });
  drawHoldings();
  showError('');
  invalidateResult();
});
for (const id of ['start-date', 'end-date', 'asset-cap', 'commodity-cap', 'initial-capital', 'custom-benchmark']) {
  document.querySelector(`#${id}`).addEventListener('input', () => {
    showError('');
    invalidateResult();
  });
}
document.querySelector('#benchmark').addEventListener('change', (event) => {
  document.querySelector('#custom-benchmark-wrap').hidden = event.target.value !== 'custom';
  showError('');
  invalidateResult();
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.querySelector('#analyze-button');
  button.disabled = true;
  button.firstChild.textContent = 'Đang phân tích ';
  showError('');
  try {
    if (holdings.some((holding) => holding.kind === 'stock' && !holding.symbol)) throw new Error('Chọn cổ phiếu từ danh sách gợi ý trước khi phân tích.');
    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;
    const normalizedHoldings = holdings.map((holding) => ({
      symbol: holding.kind === 'stock' ? normalizeStockSymbol(holding.symbol) : holding.symbol,
      weight: Number(holding.weight),
    }));
    if (normalizedHoldings.length < 2 || new Set(normalizedHoldings.map((holding) => holding.symbol)).size !== normalizedHoldings.length) throw new Error('Chọn 2-3 mã tài sản không trùng nhau.');
    const total = normalizedHoldings.reduce((sum, holding) => sum + holding.weight, 0);
    if (Math.abs(total - 100) > 0.01) throw new Error(`Tổng tỷ trọng phải bằng 100%, hiện là ${total.toFixed(1)}%.`);
    const benchmarkChoice = document.querySelector('#benchmark').value;
    const benchmarkSymbol = benchmarkChoice === 'custom' ? normalizeStockSymbol(document.querySelector('#custom-benchmark').value) : benchmarkChoice;
    const initialCapital = Number(document.querySelector('#initial-capital').value);
    if (!Number.isFinite(initialCapital) || initialCapital <= 0) throw new Error('Nhập giá trị danh mục đầu kỳ lớn hơn 0 VND.');
    const params = new URLSearchParams({ start: startDate, end: endDate });
    normalizedHoldings.forEach((holding) => params.append('symbol', holding.symbol));
    params.set('benchmark', benchmarkSymbol);
    const response = await fetch(`/api/market-data?${params}`, { cache: 'no-store' });
    const marketData = await response.json();
    if (!response.ok) throw new Error(marketData.error || 'Không tải được dữ liệu từ yfinance.');
    result = analyzePortfolio(marketData.rows, {
      holdings: normalizedHoldings,
      startDate,
      endDate,
      benchmarkSymbol,
      initialCapital,
      maxAssetPercent: document.querySelector('#asset-cap').value,
      maxCommodityPercent: document.querySelector('#commodity-cap').value,
    });
    result.fetchedAtUtc = marketData.fetched_at_utc;
    renderResult(result);
  } catch (error) {
    showError(error.message || 'Không thể phân tích dữ liệu.');
    document.querySelector('#portfolio-input').scrollIntoView();
  } finally {
    button.disabled = false;
    button.firstChild.textContent = 'Phân tích danh mục ';
  }
});
document.querySelector('#decision-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!result) return;
  const decision = new FormData(event.currentTarget).get('decision');
  const reason = document.querySelector('#decision-reason').value.trim();
  if (!decision || reason.length < 8) return;
  document.querySelector('#decision-feedback').textContent = `Đã ghi nhận trong phiên này: ${decision}. Lý do: ${reason}`;
});
drawHoldings();
const now = new Date();
const endDate = new Date(now);
const startDate = new Date(now);
startDate.setMonth(startDate.getMonth() - 6);
const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
document.querySelector('#start-date').value = localDate(startDate);
document.querySelector('#end-date').value = localDate(endDate);
if (new URLSearchParams(location.search).has('sample')) form.requestSubmit();
