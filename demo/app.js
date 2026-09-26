import { analyzePortfolio, BENCHMARK, INSTRUMENTS } from './finance.mjs';

const form = document.querySelector('#portfolio-form');
const holdingsList = document.querySelector('#holdings-list');
const errorBox = document.querySelector('#form-error');
const resultContent = document.querySelector('#result-content');
const emptyState = document.querySelector('#empty-state');
const symbolsAvailable = Object.keys(INSTRUMENTS);
let holdings = [
  { symbol: 'FPT.VN', weight: 40 },
  { symbol: 'HPG.VN', weight: 35 },
  { symbol: 'GLD', weight: 25 },
];
let result = null;

const percent = (value, digits = 2) => `${(value * 100).toFixed(digits)}%`;
const points = (value) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)} đ.%`;
const signedPercent = (value) => `${value >= 0 ? '+' : ''}${percent(value)}`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function drawHoldings() {
  holdingsList.innerHTML = holdings.map((holding, index) => `
    <div class="holding-row">
      <label class="asset-select-wrap"><span class="visually-hidden">Mã tài sản ${index + 1}</span><select data-index="${index}" data-field="symbol" aria-label="Mã tài sản ${index + 1}">
        ${symbolsAvailable.map((symbol) => `<option value="${symbol}" ${holding.symbol === symbol ? 'selected' : ''}>${symbol} · ${INSTRUMENTS[symbol].name}</option>`).join('')}
      </select></label>
      <label class="weight-wrap"><span class="visually-hidden">Tỷ trọng mã ${index + 1}</span><input type="number" data-index="${index}" data-field="weight" min="0" max="100" step="0.1" value="${holding.weight}" aria-label="Tỷ trọng ${holding.symbol}" /><span>%</span></label>
      <button type="button" class="remove-row" data-remove="${index}" aria-label="Xóa ${holding.symbol}">×</button>
    </div>`).join('');
  updateTotal();
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

function chartSvg(series) {
  const width = 760;
  const height = 226;
  const padding = { left: 10, right: 10, top: 16, bottom: 28 };
  const values = series.flatMap((item) => item.values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(0.005, max - min);
  const floor = min - spread * 0.15;
  const ceiling = max + spread * 0.15;
  const x = (index) => padding.left + index / (series[0].values.length - 1) * (width - padding.left - padding.right);
  const y = (value) => height - padding.bottom - (value - floor) / (ceiling - floor) * (height - padding.top - padding.bottom);
  const grid = [0, 0.5, 1].map((ratio) => {
    const lineY = padding.top + ratio * (height - padding.top - padding.bottom);
    return `<line x1="0" x2="${width}" y1="${lineY}" y2="${lineY}" class="chart-grid"/>`;
  }).join('');
  const paths = series.map((item) => `<polyline points="${item.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')}" class="chart-line ${item.className}"/>`).join('');
  return `<svg role="img" aria-label="Biểu đồ giá trị hiện tại, tham khảo và benchmark theo thời gian" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${grid}${paths}</svg>`;
}

function renderResult(data) {
  const { current, reference, benchmark, symbols } = data;
  document.querySelector('#results-subtitle').textContent = `${data.dates[0]} đến ${data.dates.at(-1)} · ${data.observations} ngày giá chung · tải lúc ${new Date(data.fetchedAtUtc).toLocaleString('vi-VN')} · base currency VND`;
  const riskDelta = reference.volatility - current.volatility;
  document.querySelector('#lead-headline').textContent = `Reference volatility ${riskDelta <= 0 ? 'thấp hơn' : 'cao hơn'} ${percent(Math.abs(riskDelta))} so với hiện tại.`;
  document.querySelector('#lead-explanation').textContent = `Return kỳ của danh mục hiện tại là ${signedPercent(current.periodReturn)}, so với ${signedPercent(benchmark.periodReturn)} của ${BENCHMARK.label}. Đây là so sánh lịch sử trên cùng ${data.observations} ngày giá.`;
  document.querySelector('#metric-strip').innerHTML = [
    ['Return kỳ', signedPercent(current.periodReturn), 'Mua và giữ từ tỷ trọng đầu kỳ'],
    ['Volatility ước lượng', percent(current.volatility), 'Annualized, covariance lịch sử'],
    ['Active return', points(data.activeReturn), `So với ${BENCHMARK.label}`],
  ].map(([label, value, description]) => `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${description}</small></div>`).join('');
  document.querySelector('#performance-chart').innerHTML = chartSvg([
    { values: current.path, className: 'line-current' },
    { values: reference.path, className: 'line-reference' },
    { values: benchmark.path, className: 'line-benchmark' },
  ]);
  const allocationColors = ['#1f8c5c', '#84a978', '#e2bd54'];
  const cumulative = current.weights.reduce((out, weight, index) => {
    const start = index === 0 ? 0 : out[index - 1].end;
    out.push({ start, end: start + weight * 100, color: allocationColors[index] });
    return out;
  }, []);
  document.querySelector('#allocation-visual').innerHTML = `<div class="allocation-bar" role="img" aria-label="Phân bổ danh mục hiện tại: ${symbols.map((symbol, i) => `${symbol} ${percent(current.weights[i], 0)}`).join(', ')}" style="background:linear-gradient(90deg,${cumulative.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(',')})"></div><div class="allocation-labels">${symbols.map((symbol, i) => `<div><span class="allocation-swatch" style="background:${allocationColors[i]}"></span><span>${symbol}</span><strong>${percent(current.weights[i], 0)}</strong></div>`).join('')}</div>`;
  document.querySelector('#allocation-groups').innerHTML = data.groups.map((group) => `<p><span>${escapeHtml(group.className)}</span><strong>${percent(group.weight, 0)} · ${points(group.contribution)} return</strong></p>`).join('');
  document.querySelector('#contribution-rows').innerHTML = symbols.map((symbol, i) => `<tr><th scope="row">${symbol}</th><td>${escapeHtml(INSTRUMENTS[symbol].group)}</td><td>${percent(current.weights[i], 0)}</td><td class="${current.contribution[i] >= 0 ? 'positive' : 'negative'}">${points(current.contribution[i])}</td><td>${points(current.riskContribution[i])}</td></tr>`).join('');
  document.querySelector('#contribution-total').innerHTML = `<tr><th scope="row" colspan="2">Tổng danh mục</th><td>100%</td><td>${points(current.periodReturn)}</td><td>${points(current.volatility)}</td></tr>`;
  document.querySelector('#comparison-metrics').innerHTML = `<div class="comparison-head"><span>Chỉ số</span><span>Hiện tại</span><span>Tham khảo</span></div><div><span>Return kỳ</span><strong>${signedPercent(current.periodReturn)}</strong><strong>${signedPercent(reference.periodReturn)}</strong></div><div><span>Volatility</span><strong>${percent(current.volatility)}</strong><strong>${percent(reference.volatility)}</strong></div><div><span>So với benchmark</span><strong>${points(current.periodReturn - benchmark.periodReturn)}</strong><strong>${points(reference.periodReturn - benchmark.periodReturn)}</strong></div>`;
  document.querySelector('#comparison-weights').innerHTML = `<div class="comparison-head"><span>Tỷ trọng</span><span>Hiện tại</span><span>Tham khảo</span></div>${symbols.map((symbol, i) => `<div><span>${symbol}</span><strong>${percent(current.weights[i], 0)}</strong><strong>${percent(reference.weights[i], 0)}</strong></div>`).join('')}`;
  document.querySelector('#assumptions-list').innerHTML = data.assumptions.map((assumption) => `<li>${escapeHtml(assumption)}</li>`).join('');
  emptyState.hidden = true;
  resultContent.hidden = false;
  document.querySelector('#decision-feedback').textContent = '';
  document.querySelector('#results').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

holdingsList.addEventListener('input', (event) => {
  const target = event.target;
  if (!target.dataset.field) return;
  holdings[Number(target.dataset.index)][target.dataset.field] = target.dataset.field === 'weight' ? Number(target.value) : target.value;
  updateTotal();
  showError('');
  invalidateResult();
});
holdingsList.addEventListener('change', (event) => {
  const target = event.target;
  if (target.dataset.field === 'symbol') {
    holdings[Number(target.dataset.index)].symbol = target.value;
    drawHoldings();
    invalidateResult();
  }
});
holdingsList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  holdings.splice(Number(button.dataset.remove), 1);
  drawHoldings();
  invalidateResult();
});
document.querySelector('#add-holding').addEventListener('click', () => {
  if (holdings.length >= 3) return showError('Bộ dữ liệu demo có tối đa 3 mã.');
  const next = symbolsAvailable.find((symbol) => !holdings.some((item) => item.symbol === symbol));
  holdings.push({ symbol: next, weight: 0 });
  drawHoldings();
  showError('');
  invalidateResult();
});
for (const id of ['start-date', 'end-date', 'asset-cap', 'commodity-cap']) {
  document.querySelector(`#${id}`).addEventListener('input', () => {
    showError('');
    invalidateResult();
  });
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.querySelector('#analyze-button');
  button.disabled = true;
  button.firstChild.textContent = 'Đang phân tích ';
  showError('');
  try {
    const startDate = document.querySelector('#start-date').value;
    const endDate = document.querySelector('#end-date').value;
    const params = new URLSearchParams({ start: startDate, end: endDate });
    holdings.forEach((holding) => params.append('symbol', holding.symbol));
    const response = await fetch(`/api/market-data?${params}`, { cache: 'no-store' });
    const marketData = await response.json();
    if (!response.ok) throw new Error(marketData.error || 'Không tải được dữ liệu từ yfinance.');
    result = analyzePortfolio(marketData.rows, {
      holdings,
      startDate,
      endDate,
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
