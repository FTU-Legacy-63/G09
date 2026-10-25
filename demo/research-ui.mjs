import { historicalMetrics } from './metrics.mjs';
import { simulationInput } from './simulation.mjs';
import { riskFreeForResult } from './risk-free.mjs';
import { number, percent, signedPercent, vnd, compactVnd, dateLabel } from './format.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el = id => document.getElementById(id);
const row = (name, value, description) => `<tr><th scope="row">${name}</th><td>${value}</td><td>${description}</td></tr>`;

// This comparison deliberately reuses the same buy-and-hold paths calculated by
// allocationScenario.  It is not a separate backtest or a forecast.
function renderOptimizationPnl(data, optimized) {
  const host = el('optimization-pnl-chart');
  const width = Math.max(360, host.clientWidth || 900);
  const height = 340;
  const margin = { left: 78, right: 22, top: 22, bottom: 62 };
  const dates = data.dates;
  const current = data.current.pnlPath;
  const proposal = optimized.pnlPath;
  const values = [...current, ...proposal].filter(Number.isFinite);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const spread = Math.max(data.initialCapital * 0.01, maxValue - minValue);
  const floor = minValue - spread * 0.12;
  const ceiling = maxValue + spread * 0.12;
  const timestamps = dates.map(date => Date.parse(`${date}T00:00:00Z`));
  const duration = Math.max(1, timestamps.at(-1) - timestamps[0]);
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = index => margin.left + (timestamps[index] - timestamps[0]) / duration * plotWidth;
  const y = value => height - margin.bottom - (value - floor) / (ceiling - floor) * plotHeight;
  const nearIndex = time => {
    let low = 0, high = timestamps.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (timestamps[middle] < time) low = middle + 1; else high = middle;
    }
    return low > 0 && Math.abs(timestamps[low - 1] - time) < Math.abs(timestamps[low] - time) ? low - 1 : low;
  };
  const ticks = [...new Set([0, .25, .5, .75, 1].map(fraction => nearIndex(timestamps[0] + duration * fraction)))];
  const grids = [0, .25, .5, .75, 1].map(fraction => {
    const value = floor + (ceiling - floor) * fraction;
    const position = y(value);
    return `<line x1="${margin.left}" x2="${width - margin.right}" y1="${position}" y2="${position}" class="chart-grid"/><text x="${margin.left - 10}" y="${position + 4}" text-anchor="end" class="chart-axis-label">${compactVnd(value)}</text>`;
  }).join('');
  const xLabels = ticks.map(index => `<text x="${x(index)}" y="${height - 20}" text-anchor="${index === 0 ? 'start' : index === dates.length - 1 ? 'end' : 'middle'}" class="chart-axis-label">${dateLabel(dates[index])}</text>`).join('');
  const points = series => series.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ');
  const zeroY = y(0);
  host.innerHTML = `<div class="chart-frame optimization-pnl-frame" tabindex="0" aria-label="Biểu đồ PnL danh mục hiện tại và phương án tối ưu hóa theo ngày. Dùng phím mũi tên trái hoặc phải để xem từng phiên."><svg role="img" aria-label="So sánh PnL trước và sau tối ưu hóa, đơn vị VND" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${grids}<line x1="${margin.left}" x2="${width - margin.right}" y1="${zeroY}" y2="${zeroY}" class="optimization-zero-line"/><text x="${width - margin.right}" y="${zeroY - 6}" text-anchor="end" class="chart-axis-label">0 đ</text>${xLabels}<polyline class="chart-line line-current" points="${points(current)}"/><polyline class="chart-line line-optimized" points="${points(proposal)}"/><line id="optimization-crosshair-x" y1="${margin.top}" y2="${height - margin.bottom}" class="chart-crosshair" hidden/><line id="optimization-crosshair-y" x1="${margin.left}" x2="${width - margin.right}" class="chart-crosshair" hidden/><circle id="optimization-dot-current" r="4.5" class="chart-dot line-current" hidden/><circle id="optimization-dot-proposal" r="4.5" class="chart-dot line-optimized" hidden/></svg><div id="optimization-pnl-tooltip" class="chart-tooltip" role="tooltip" hidden></div></div>`;
  const frame = host.querySelector('.optimization-pnl-frame');
  const svg = host.querySelector('svg');
  const tooltip = host.querySelector('#optimization-pnl-tooltip');
  let activeIndex = dates.length - 1;
  function showAt(index, pointer) {
    activeIndex = Math.max(0, Math.min(dates.length - 1, index));
    const xx = x(activeIndex);
    const vertical = host.querySelector('#optimization-crosshair-x');
    const horizontal = host.querySelector('#optimization-crosshair-y');
    vertical.setAttribute('x1', xx); vertical.setAttribute('x2', xx); vertical.removeAttribute('hidden');
    const currentDot = host.querySelector('#optimization-dot-current');
    const proposalDot = host.querySelector('#optimization-dot-proposal');
    currentDot.setAttribute('cx', xx); currentDot.setAttribute('cy', y(current[activeIndex])); currentDot.removeAttribute('hidden');
    proposalDot.setAttribute('cx', xx); proposalDot.setAttribute('cy', y(proposal[activeIndex])); proposalDot.removeAttribute('hidden');
    const pointerY = pointer?.y ?? y(proposal[activeIndex]) / height * frame.clientHeight;
    const svgY = Math.max(margin.top, Math.min(height - margin.bottom, pointerY / frame.clientHeight * height));
    horizontal.setAttribute('y1', svgY); horizontal.setAttribute('y2', svgY); horizontal.removeAttribute('hidden');
    const difference = proposal[activeIndex] - current[activeIndex];
    tooltip.innerHTML = `<strong>${dateLabel(dates[activeIndex])}</strong><span>Hiện tại <b>${signedVnd(current[activeIndex])}</b></span><span>Phương án <b>${signedVnd(proposal[activeIndex])}</b></span><span class="tooltip-pnl">Chênh lệch <b>${signedVnd(difference)}</b></span>`;
    tooltip.hidden = false;
    const pointerX = pointer?.x ?? xx / width * frame.clientWidth;
    const left = Math.max(8, Math.min(frame.clientWidth - tooltip.offsetWidth - 8, pointerX + 14));
    const top = Math.max(8, Math.min(frame.clientHeight - tooltip.offsetHeight - 8, pointerY - tooltip.offsetHeight - 14));
    tooltip.style.left = `${left}px`; tooltip.style.top = `${top}px`;
  }
  function hide() {
    tooltip.hidden = true;
    for (const id of ['optimization-crosshair-x', 'optimization-crosshair-y', 'optimization-dot-current', 'optimization-dot-proposal']) host.querySelector(`#${id}`).setAttribute('hidden', '');
  }
  const move = event => {
    const bounds = svg.getBoundingClientRect();
    const svgX = (event.clientX - bounds.left) / bounds.width * width;
    const time = timestamps[0] + (svgX - margin.left) / plotWidth * duration;
    showAt(nearIndex(time), { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', hide);
  frame.addEventListener('focus', () => showAt(activeIndex));
  frame.addEventListener('blur', hide);
  frame.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); showAt(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
}

export function initResearch(getResult) {
  let worker = null, pendingReject = null, lastSimulation = null;
  let optimizationRequest = 0, simulationRequest = 0;
  let chartMode = 'connected';
  function cancel() {
    worker?.terminate(); worker = null;
    const reject = pendingReject; pendingReject = null;
    if (reject) { const error=Error('Đã hủy tác vụ tính toán.'); error.name='AbortError'; reject(error); }
  }
  function run(kind, input, options) {
    cancel();
    if (!window.Worker) return Promise.reject(Error('Trình duyệt chưa hỗ trợ mô phỏng nền. Hãy dùng trình duyệt mới hơn.'));
    return new Promise((resolve, reject) => {
      const active = new Worker(new URL('./research-worker.mjs', import.meta.url), { type: 'module' });
      worker = active; pendingReject = reject;
      const finish = () => { active.terminate(); if (worker === active) { worker = null; pendingReject = null; } };
      active.onmessage = ({ data }) => { finish(); data.ok ? resolve(data.result) : reject(Error(data.error)); };
      active.onerror = () => { finish(); reject(Error('Chưa khởi tạo được bộ tính nền. Hãy tải lại trang và thử lại.')); };
      active.postMessage({ kind, input, options });
    });
  }
  function renderMetrics(data) {
    const config=riskFreeForResult(data);
    data.riskFreeAnnual=config.annual;data.riskFreeSource=config.source;data.riskFreeMode=config.mode;
    const rf = config.annual, m = historicalMetrics(data, rf), exposure = data.current.valuePath.at(-1);
    data.metrics = m;
    el('metrics-period').textContent = `${dateLabel(data.dates[0])} – ${dateLabel(data.dates.at(-1))}; ${m.observations} return mua và giữ bằng VND. Lãi suất phi rủi ro: ${percent(rf)}/năm (${config.source}).`;
    el('performance-metrics').innerHTML = [
      row('CAGR · tăng trưởng bình quân năm', signedPercent(m.cagr), m.cagr === null ? 'Chỉ hiện khi có ít nhất 1 năm lịch và 252 return chung; không ngoại suy vài ngày thành một năm.' : 'Nếu tăng đều mỗi năm, mức tăng nào đưa vốn đầu kỳ đến giá trị cuối kỳ? Không cộng CAGR từng mã.'),
      row('Max Drawdown · mức giảm sâu nhất', percent(m.maxDrawdown), 'Mức giảm từ một đỉnh trước đó đến đáy sau nó trong kỳ. Không phải mức lỗ tối đa có thể xảy ra trong tương lai.'),
      row('Biến động mua và giữ', percent(m.realizedVolatility), 'Độ dao động năm hóa của return thực trên đường giá trị có tỷ trọng trôi. Khác biến động phân bổ cố định dùng cho Euler attribution.'),
      row('Sharpe · lợi nhuận vượt lãi suất / rủi ro', number(m.sharpe), 'Trung bình return ngày trừ lãi suất ngày, chia độ lệch chuẩn và nhân √252. Dùng lợi suất mặc định HNX 10Y hoặc giả định tùy chỉnh đang hiển thị. Không cam kết hiệu quả tương lai.'),
      row('Sortino · so với dao động dưới mục tiêu', number(m.sortino), 'Dùng phần return dưới lãi suất mục tiêu để đo downside deviation trên toàn bộ mẫu. Không có downside hoặc thiếu lãi suất: không xác định.'),
      row('Calmar · CAGR / mức giảm sâu nhất', number(m.calmar), 'Chỉ xác định khi CAGR đủ dữ liệu và có drawdown âm. Cùng giá trị có thể đến từ nhiều đường đi khác nhau.'),
    ].join('');
    const varText = m.tail ? (m.tail.varLoss > 0 ? `Khoảng 5 trong 100 ngày theo mẫu lịch sử có thể lỗ vượt ${percent(m.tail.varLoss)}. Quy mô minh họa trên ${compactVnd(exposure)}: ${vnd(exposure * m.tail.varLoss)}; không phải giới hạn lỗ.` : 'Phân vị mẫu không cho một ngưỡng lỗ dương; điều này không có nghĩa tương lai không thể lỗ.') : 'Cần ít nhất 100 return ngày để không diễn giải một đuôi mẫu quá nhỏ.';
    el('risk-metrics').innerHTML = [
      row('VaR lịch sử 95% · 1 phiên', percent(m.tail?.varLoss), varText),
      row('CVaR / Expected Shortfall 95% · 1 phiên', percent(m.tail?.expectedShortfall), m.tail ? `Lỗ trung bình của 5% khối lượng mẫu tệ nhất (${number(m.tail.tailObservations, 1)} quan sát tương đương), không phải lỗ lớn nhất. Quy mô theo giá trị cuối kỳ: ${vnd(exposure * m.tail.expectedShortfall)}.` : 'Cần ít nhất 100 return. Mẫu dưới 250 phiên đặc biệt dễ thay đổi khi thêm một ngày xấu.'),
      row('Skewness · độ lệch', number(m.skewness), 'Âm: đuôi bên lỗ dài hơn; dương: đuôi bên lãi dài hơn trong mẫu. Không đo xác suất tương lai và không phải nhãn tốt/xấu.'),
      row('Excess kurtosis · độ nặng của đuôi', number(m.excessKurtosis), 'Chuẩn tham chiếu = 0. Dương gợi ý nhiều quan sát cực đoan hơn phân phối chuẩn, cả lãi và lỗ. Không chỉ đo độ nhọn của đỉnh.'),
      row('Phiên tốt nhất / xấu nhất', `${signedPercent(m.bestDay)} / ${signedPercent(m.worstDay)}`, 'Chỉ trong các cặp ngày có giá cách nhau không quá 7 ngày. Không bao gồm rủi ro intraday.'),
    ].join('');
    el('benchmark-metrics').innerHTML = [
      row('Beta · độ nhạy với benchmark', number(m.beta), `${m.benchmarkObservations} cặp return cùng phiên; tối thiểu 60 cặp và benchmark phải có biến động. Không phải mức rủi ro tổng thể.`),
      row('Jensen alpha · năm hóa số học', signedPercent(m.jensenAlpha), '252 × [trung bình return danh mục − lãi suất ngày − beta × (return benchmark − lãi suất ngày)]. Cần giả định lãi suất; không phải bằng chứng kỹ năng hay quan hệ nhân quả.'),
      row('Tracking error · độ lệch khỏi benchmark', percent(m.trackingError), 'Độ lệch chuẩn của chênh lệch return ngày × √252 trên cùng cặp ngày. Benchmark cổ phiếu không đại diện mọi asset class.'),
      row('Information ratio', number(m.informationRatio), 'Trung bình chênh lệch return chia độ dao động chênh lệch, năm hóa √252. Không xác định nếu chênh lệch không dao động.'),
    ].join('');
    el('correlation-table').innerHTML = `<thead><tr><th>Mã</th>${data.symbols.map(s => `<th>${escape(s)}</th>`).join('')}</tr></thead><tbody>${data.symbols.map((s, i) => `<tr><th scope="row">${escape(s)}</th>${m.correlation[i].map(value => `<td>${number(value)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    el('advanced-cagr').textContent = signedPercent(m.cagr);
    el('advanced-dd').textContent = percent(m.maxDrawdown);
    el('advanced-sharpe').textContent = number(m.sharpe);
    el('sharpe-rf-note').textContent = `Rf ${percent(rf)}/năm · ${config.mode==='default'?'giả định mặc định':'tùy chỉnh'}`;
    for (const id of ['optimize-empty', 'simulation-empty']) el(id).hidden = false;
    el('optimize-empty').textContent = 'Dữ liệu đã sẵn sàng. Chọn mục tiêu rồi bấm tính phương án; phân tích không tự chạy tối ưu hóa.';
    el('simulation-empty').textContent = `Mô phỏng từ giá trị cuối kỳ ${vnd(exposure)}, dùng tỷ trọng cuối kỳ để tiếp tục mua và giữ. Cần ít nhất 60 return chung.`;
  }
  el('optimization-form').addEventListener('submit', async event => {
    event.preventDefault(); const data = getResult(), button = el('optimize-button');
    const request = ++optimizationRequest;
    el('optimize-error').textContent = ''; el('optimize-result').hidden = true;
    if (!data) { el('optimize-error').textContent = 'Hãy phân tích danh mục trước.'; return; }
    button.disabled = true; el('optimize-empty').textContent = 'Đang tính phương án trên cùng dữ liệu lịch sử…';
    try {
      const riskFreeAnnual = riskFreeForResult(data).annual;
      const output = await run('optimization', data, { maxAssetPercent: Number(el('asset-cap').value), maxCommodityPercent: Number(el('commodity-cap').value), objective: el('optimization-objective').value, riskFreeAnnual });
      if (request !== optimizationRequest || data !== getResult()) return;
      const projected = { ...data, current: output }, metrics = historicalMetrics(projected, riskFreeAnnual);
      el('solver-method').textContent = `${output.optimization.method}; ${output.optimization.iterations} vòng; gap ${number(output.optimization.gap, 10)}; ${output.optimization.converged ? 'đạt ngưỡng dừng' : 'chưa đạt ngưỡng hội tụ'}.`;
      el('comparison-metrics').innerHTML = `<table><thead><tr><th>Chỉ số</th><th>Hiện tại</th><th>Phương án</th></tr></thead><tbody>${row('Return lịch sử', signedPercent(data.current.periodReturn), signedPercent(output.periodReturn))}${row('Biến động phân bổ', percent(data.current.volatility), percent(output.volatility))}${row('Sharpe mua và giữ', number(data.metrics?.sharpe), number(metrics.sharpe))}</tbody></table>`;
      el('comparison-weights').innerHTML = `<table><thead><tr><th>Mã</th><th>Đầu kỳ cũ</th><th>Phương án</th></tr></thead><tbody>${data.symbols.map((s, i) => row(escape(s), percent(data.current.weights[i]), percent(output.weights[i]))).join('')}</tbody><tfoot><tr><th>Tổng</th><td>100%</td><td>100%</td></tr></tfoot></table>`;
      renderOptimizationPnl(data, output);
      el('optimize-note').textContent = `${output.objective === 'maximum-sharpe' ? 'Objective dùng mean/covariance return ngày, giả định tái cân bằng; Sharpe báo cáo mua và giữ có thể khác. Tìm kiếm xấp xỉ không bảo đảm tối ưu toàn cục. Lãi suất ' + percent(riskFreeAnnual) + '/năm, nguồn: ' + data.riskFreeSource + '. ' : 'Mục tiêu là giảm variance ước lượng của allocation cố định, không phải tối đa lợi nhuận. '} Cùng dữ liệu vừa dùng để chọn và đánh giá: có thiên lệch in-sample, không phải backtest ngoài mẫu. Không thay đổi danh mục của bạn.`;
      el('optimize-result').hidden = false; el('optimize-empty').hidden = true;
    } catch (error) { if (request === optimizationRequest && error.name !== 'AbortError') el('optimize-error').textContent = error.message; }
    finally { if (request === optimizationRequest) button.disabled = false; }
  });
  function renderSimulation(output) {
    el('simulation-result').hidden = false;
    const host = el('simulation-chart');
    const width = Math.max(760, host.clientWidth || 800);
    const height = 360;
    const margin = { l: 80, r: 30, t: 25, b: 45 };

    // Historical path for connected mode
    const data = getResult();
    const histPath = (chartMode === 'connected' && data?.current?.valuePath) ? data.current.valuePath : null;
    const histLen = histPath ? histPath.length : 0;

    // Compute Y domain including history if in connected mode
    const lo = Math.min(output.capital, ...output.fan.map(p => p.p05), ...(histPath ? histPath : []));
    const hi = Math.max(output.capital, ...output.fan.map(p => p.p95), ...(histPath ? histPath : []));
    const spread = Math.max(output.capital * 0.01, hi - lo);
    const floor = Math.max(0, lo - spread * 0.1);
    const ceiling = hi + spread * 0.1;

    // X: history occupies left portion, future occupies right
    const histRatio = histLen > 0 && chartMode === 'connected' ? 0.45 : 0; // 45% of width for history
    const histPlotW = (width - margin.l - margin.r) * histRatio;
    const futPlotW = (width - margin.l - margin.r) * (1 - histRatio);
    const futOriginX = margin.l + histPlotW;

    const xFut = day => futOriginX + day / output.horizon * futPlotW;
    const xHist = idx => margin.l + (histLen > 1 ? idx / (histLen - 1) * histPlotW : 0);
    const y = value => height - margin.b - (value - floor) / (ceiling - floor) * (height - margin.t - margin.b);
    const band = (low, high) => output.fan.map(p => `${xFut(p.day).toFixed(1)},${y(p[low]).toFixed(1)}`).concat([...output.fan].reverse().map(p => `${xFut(p.day).toFixed(1)},${y(p[high]).toFixed(1)}`)).join(' ');

    const capY = y(output.capital);
    const capLine = (capY >= margin.t && capY <= height - margin.b)
      ? `<line x1="${margin.l}" x2="${width - margin.r}" y1="${capY.toFixed(1)}" y2="${capY.toFixed(1)}" class="chart-capital-line"/><text x="${width - margin.r - 6}" y="${(capY - 6).toFixed(1)}" text-anchor="end" class="chart-capital-label">Vốn ban đầu (${compactVnd(output.capital)})</text>`
      : '';

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => {
      const value = floor + f * (ceiling - floor);
      const yPos = y(value);
      return `<line x1="${margin.l}" x2="${width - margin.r}" y1="${yPos.toFixed(1)}" y2="${yPos.toFixed(1)}" class="chart-grid"/><text x="${margin.l - 10}" y="${(yPos + 4).toFixed(1)}" text-anchor="end" class="chart-axis-label">${compactVnd(value)}</text>`;
    }).join('');

    // X-axis ticks: history dates on left, future sessions on right
    let xTicks = '';
    if (chartMode === 'connected' && histLen > 0 && data?.dates) {
      const dates = data.dates;
      const histTickFracs = [0, 0.5, 1];
      xTicks += histTickFracs.map(f => {
        const idx = Math.round(f * (histLen - 1));
        const xPos = xHist(idx);
        const anchor = f === 0 ? 'start' : f === 1 ? 'end' : 'middle';
        return `<text x="${xPos.toFixed(1)}" y="${height - 12}" text-anchor="${anchor}" class="chart-axis-label">${dateLabel(dates[idx])}</text>`;
      }).join('');
      // Divider line between history and future
      xTicks += `<line x1="${futOriginX.toFixed(1)}" x2="${futOriginX.toFixed(1)}" y1="${margin.t}" y2="${height - margin.b}" class="chart-grid" stroke-dasharray="4 3" opacity="0.5"/>`;
      // Future ticks
      xTicks += [0.5, 1].map(f => {
        const day = Math.round(output.horizon * f);
        const xPos = xFut(output.horizon * f);
        return `<text x="${xPos.toFixed(1)}" y="${height - 12}" text-anchor="${f === 1 ? 'end' : 'middle'}" class="chart-axis-label">${day} phiên</text>`;
      }).join('');
    } else {
      xTicks = [0, 0.25, 0.5, 0.75, 1].map(f => {
        const day = Math.round(output.horizon * f);
        const xPos = f === 0 ? margin.l : f === 1 ? width - margin.r : xFut(output.horizon * f);
        const anchor = f === 0 ? 'start' : f === 1 ? 'end' : 'middle';
        return `<text x="${xPos.toFixed(1)}" y="${height - 12}" text-anchor="${anchor}" class="chart-axis-label">${day} phiên</text>`;
      }).join('');
    }

    // History polyline
    const histLine = (histPath && histLen > 1)
      ? `<polyline class="chart-line line-history" points="${histPath.map((v, i) => `${xHist(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" opacity="0.75"/>`
      : '';

    // Labels
    const histLabel = (chartMode === 'connected' && histLen > 0)
      ? `<text x="${(margin.l + 4).toFixed(1)}" y="${(margin.t + 2).toFixed(1)}" class="chart-axis-label" style="font-weight:600;fill:#64748b">← Lịch sử</text><text x="${(futOriginX + 4).toFixed(1)}" y="${(margin.t + 2).toFixed(1)}" class="chart-axis-label" style="font-weight:600;fill:#0f766e">Mô phỏng →</text>`
      : '';

    host.innerHTML = `<svg role="img" aria-label="Dải phân vị 5 đến 95 phần trăm và trung vị mô phỏng, đơn vị VND; đây không phải khoảng giá được bảo đảm" viewBox="0 0 ${width} ${height}">${yTicks}${capLine}${histLine}<polygon class="fan-outer" points="${band('p05', 'p95')}"><title>Dải phân vị 5% - 95%</title></polygon><polygon class="fan-inner" points="${band('p25', 'p75')}"><title>Dải phân vị 25% - 75%</title></polygon><polyline class="chart-line line-current" points="${output.fan.map(p => `${xFut(p.day).toFixed(1)},${y(p.p50).toFixed(1)}`).join(' ')}"/>${xTicks}${histLabel}</svg>`;

    const histHost = el('simulation-histogram');
    const histWidth = Math.max(520, histHost.clientWidth || 540);
    const histHeight = 220;
    const hMargin = { l: 45, r: 25, t: 28, b: 38 };
    const maxCount = Math.max(...output.histogram.map(b => b.count), 1);
    const plotW = histWidth - hMargin.l - hMargin.r;
    const barStep = plotW / output.histogram.length;
    const barW = Math.max(4, barStep - 3);

    const bars = output.histogram.map((b, i) => {
      const bx = hMargin.l + i * barStep + 1.5;
      const bH = (b.count / maxCount) * (histHeight - hMargin.t - hMargin.b);
      const by = histHeight - hMargin.b - bH;
      const isLoss = (b.from + b.to) / 2 < output.capital;
      const barClass = isLoss ? 'histogram-bar bar-loss' : 'histogram-bar bar-profit';
      return `<rect class="${barClass}" x="${bx.toFixed(1)}" width="${barW.toFixed(1)}" y="${by.toFixed(1)}" height="${bH.toFixed(1)}"><title>${vnd(b.from)} đến ${vnd(b.to)}: ${b.count.toLocaleString('vi-VN')} đường</title></rect>`;
    }).join('');

    const minVal = output.histogram[0].from;
    const maxVal = output.histogram.at(-1).to;
    let capHistLine = '';
    if (output.capital >= minVal && output.capital <= maxVal && maxVal > minVal) {
      const capX = hMargin.l + ((output.capital - minVal) / (maxVal - minVal)) * plotW;
      capHistLine = `<line x1="${capX.toFixed(1)}" x2="${capX.toFixed(1)}" y1="${hMargin.t}" y2="${histHeight - hMargin.b}" class="chart-capital-line"/><text x="${capX.toFixed(1)}" y="${hMargin.t - 8}" text-anchor="middle" class="chart-capital-label">Vốn</text>`;
    }

    histHost.innerHTML = `<svg role="img" aria-label="Tần suất giá trị cuối kỳ trong ${output.paths} mô phỏng" viewBox="0 0 ${histWidth} ${histHeight}"><text x="${hMargin.l}" y="${hMargin.t - 8}" class="chart-axis-label" style="font-weight:600">Đỉnh: ${maxCount.toLocaleString('vi-VN')} đường</text>${capHistLine}${bars}<line x1="${hMargin.l}" x2="${histWidth - hMargin.r}" y1="${histHeight - hMargin.b}" y2="${histHeight - hMargin.b}" class="chart-grid"/><text x="${hMargin.l}" y="${histHeight - 12}" text-anchor="start" class="chart-axis-label">${compactVnd(output.histogram[0].from)}</text><text x="${histWidth - hMargin.r}" y="${histHeight - 12}" text-anchor="end" class="chart-axis-label">${compactVnd(output.histogram.at(-1).to)}</text></svg>`;

    const p50 = output.percentiles.find(p => p.percentile === 0.5) || output.percentiles[2];
    const medianDiff = (p50.value - output.capital) / output.capital;
    const lossPaths = Math.round(output.lossProbability * output.paths);

    if (el('simulation-kpis')) {
      el('simulation-kpis').innerHTML = `
        <div class="simulation-kpi-card">
          <span class="simulation-kpi-label">Vốn khởi điểm</span>
          <strong class="simulation-kpi-value">${compactVnd(output.capital)}</strong>
          <span class="simulation-kpi-sub">Mốc vốn phân tích ban đầu</span>
        </div>
        <div class="simulation-kpi-card">
          <span class="simulation-kpi-label">Trung vị kỳ vọng (P50)</span>
          <strong class="simulation-kpi-value">${compactVnd(p50.value)}</strong>
          <span class="simulation-kpi-sub"><span class="${medianDiff >= 0 ? 'positive' : 'negative'}">${signedPercent(medianDiff)}</span> so với vốn ban đầu</span>
        </div>
        <div class="simulation-kpi-card">
          <span class="simulation-kpi-label">Xác suất kết thúc dưới vốn</span>
          <strong class="simulation-kpi-value">${percent(output.lossProbability)}</strong>
          <span class="simulation-kpi-sub">${lossPaths.toLocaleString('vi-VN')} / ${output.paths.toLocaleString('vi-VN')} đường mô phỏng</span>
        </div>
        <div class="simulation-kpi-card">
          <span class="simulation-kpi-label">Rủi ro đuôi (${output.horizon} phiên)</span>
          <strong class="simulation-kpi-value">VaR: ${percent(output.tail.varLoss)}</strong>
          <span class="simulation-kpi-sub">CVaR 95%: <strong>${percent(output.tail.expectedShortfall)}</strong></span>
        </div>
      `;
    }

    el('simulation-brief').textContent = `Trong ${output.paths.toLocaleString('vi-VN')} đường mô phỏng, ${percent(output.lossProbability)} kết thúc thấp hơn ${vnd(output.capital)}. Trung vị cuối kỳ ${vnd(p50.value)}. Đây là kết quả lấy mẫu mô hình, không phải cam kết xác suất thị trường trong tương lai.`;

    const percentileMeta = {
      0.05: { label: 'Phân vị 5% (Kịch bản xấu)', note: '95% số đường mô phỏng đạt kết quả cao hơn mốc này. Mức kiểm thử sức chịu đựng.' },
      0.25: { label: 'Phân vị 25% (Thận trọng)', note: '75% số đường mô phỏng đạt kết quả cao hơn mốc này.' },
      0.50: { label: 'Phân vị 50% (Trung vị)', note: 'Kịch bản cơ sở: một nửa số đường mô phỏng ở trên và một nửa ở dưới.' },
      0.75: { label: 'Phân vị 75% (Thuận lợi)', note: '25% kịch bản tốt nhất đạt từ mốc này trở lên.' },
      0.95: { label: 'Phân vị 95% (Rất thuận lợi)', note: 'Chỉ 5% kịch bản hưng phấn nhất đạt tới mốc này.' },
    };

    el('simulation-percentiles').innerHTML = output.percentiles.map(p => {
      const meta = percentileMeta[p.percentile] || { label: `Phân vị ${number(p.percentile * 100, 0)}%`, note: '' };
      const diff = (p.value - output.capital) / output.capital;
      const isMedian = p.percentile === 0.5;
      return `<tr class="${isMedian ? 'row-median' : ''}">
        <th scope="row">${meta.label}${isMedian ? '<span class="badge-median">Chuẩn</span>' : ''}</th>
        <td><strong>${vnd(p.value)}</strong></td>
        <td class="${diff >= 0 ? 'kpi-positive' : 'kpi-negative'}">${signedPercent(diff)}</td>
        <td>${meta.note}</td>
      </tr>`;
    }).join('');

    if (el('chip-var')) el('chip-var').textContent = percent(output.tail.varLoss);
    if (el('chip-cvar')) el('chip-cvar').textContent = percent(output.tail.expectedShortfall);

    el('simulation-tail').textContent = `VaR 95% mô phỏng (${output.horizon} phiên): ${percent(output.tail.varLoss)}; CVaR: ${percent(output.tail.expectedShortfall)}. Có thể âm nếu toàn bộ phân vị đuôi vẫn đạt mức sinh lời dương. Đây không phải VaR lịch sử 1 phiên ở báo cáo. Phụ thuộc vào dữ liệu đầu vào và phương pháp lấy mẫu block.`;
    el('simulation-meta').textContent = `${dateLabel(output.historyStart)} – ${dateLabel(output.historyEnd)}; ${output.observations} return chung; block ${output.blockLength} phiên; ${output.paths} đường × ${output.horizon} phiên. Vốn mô phỏng là giá trị cuối kỳ; giữ nguyên tỷ trọng cuối kỳ theo chiến lược mua và giữ.`;
    el('simulation-allocation').textContent = output.symbols.map((s, i) => `${s}: ${percent(output.weights[i])}`).join(' · ');
  }
  // Chart mode toggle
  function setChartMode(mode) {
    chartMode = mode;
    const btnConn = el('btn-chart-connected');
    const btnFut = el('btn-chart-future');
    if (btnConn) { btnConn.classList.toggle('active', mode === 'connected'); btnConn.setAttribute('aria-pressed', String(mode === 'connected')); }
    if (btnFut) { btnFut.classList.toggle('active', mode === 'future'); btnFut.setAttribute('aria-pressed', String(mode === 'future')); }
    if (lastSimulation) renderSimulation(lastSimulation);
  }
  el('btn-chart-connected')?.addEventListener('click', () => setChartMode('connected'));
  el('btn-chart-future')?.addEventListener('click', () => setChartMode('future'));

  el('simulation-form').addEventListener('submit', async event => {
    event.preventDefault(); el('simulation-error').textContent = ''; el('simulation-result').hidden = true;
    const request = ++simulationRequest;    const data = getResult(); if (!data) { el('simulation-error').textContent = 'Hãy phân tích danh mục trước.'; return; }
    el('simulate-button').disabled = true; el('cancel-simulation').hidden = false; el('simulation-empty').textContent = 'Đang tạo các đường mô phỏng ở nền; có thể hủy mà không mất báo cáo.';
    try {
      const output = await run('simulation', simulationInput(data), { paths: Number(el('simulation-paths').value), horizon: Number(el('simulation-horizon').value), seed: 42, blockLength: 5 });
      if (request !== simulationRequest || data !== getResult()) return;
      lastSimulation = output;
      renderSimulation(lastSimulation); el('simulation-empty').hidden = true;
    } catch (error) { if (request === simulationRequest && error.name !== 'AbortError') el('simulation-error').textContent = error.message; }
    finally { if (request === simulationRequest) { el('simulate-button').disabled = false; el('cancel-simulation').hidden = true; } }
  });
  el('cancel-simulation').addEventListener('click', () => { cancel(); el('simulate-button').disabled = false; el('cancel-simulation').hidden = true; el('simulation-empty').textContent = 'Đã hủy mô phỏng. Báo cáo lịch sử được giữ nguyên.'; });
  return {
    renderMetrics,
    reset() { ++optimizationRequest; ++simulationRequest; cancel(); lastSimulation = null; for (const id of ['optimize-result', 'simulation-result']) el(id).hidden = true; el('optimize-button').disabled = false; el('simulate-button').disabled = false; el('cancel-simulation').hidden = true; },
    refresh() { if (lastSimulation && location.pathname === '/simulation') renderSimulation(lastSimulation); },
  };
}
