import { historicalMetrics } from './metrics.mjs';
import { simulationInput } from './simulation.mjs';
import { riskFreeForResult } from './risk-free.mjs';
import { number, percent, signedPercent, vnd, compactVnd, dateLabel } from './format.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el = id => document.getElementById(id);
const row = (name, value, description) => `<tr><th scope="row">${name}</th><td>${value}</td><td>${description}</td></tr>`;
export function initResearch(getResult) {
  let worker = null, pendingReject = null, lastSimulation = null;
  let optimizationRequest = 0, simulationRequest = 0;
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
      row('Sharpe · lợi nhuận vượt lãi suất / rủi ro', number(m.sharpe), 'Trung bình return ngày trừ lãi suất ngày, chia độ lệch chuẩn và nhân √252. Mặc định 3%/năm hoặc giả định tùy chỉnh đang hiển thị. Không cam kết hiệu quả tương lai.'),
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
      el('optimize-note').textContent = `${output.objective === 'maximum-sharpe' ? 'Objective dùng mean/covariance return ngày, giả định tái cân bằng; Sharpe báo cáo mua và giữ có thể khác. Tìm kiếm xấp xỉ không bảo đảm tối ưu toàn cục. Lãi suất ' + percent(riskFreeAnnual) + '/năm, nguồn: ' + data.riskFreeSource + '. ' : 'Mục tiêu là giảm variance ước lượng của allocation cố định, không phải tối đa lợi nhuận. '} Cùng dữ liệu vừa dùng để chọn và đánh giá: có thiên lệch in-sample, không phải backtest ngoài mẫu. Không thay đổi danh mục của bạn.`;
      el('optimize-result').hidden = false; el('optimize-empty').hidden = true;
    } catch (error) { if (request === optimizationRequest && error.name !== 'AbortError') el('optimize-error').textContent = error.message; }
    finally { if (request === optimizationRequest) button.disabled = false; }
  });
  function renderSimulation(output) {
    const host = el('simulation-chart'), width = Math.max(340, host.clientWidth), height = 320, margin = { l: 72, r: 14, t: 20, b: 42 };
    const lo = Math.min(output.capital, ...output.fan.map(p => p.p05)), hi = Math.max(output.capital, ...output.fan.map(p => p.p95)), spread = Math.max(output.capital * .01, hi - lo);
    const floor = Math.max(0, lo - spread * .1), ceiling = hi + spread * .1;
    const x = day => margin.l + day / output.horizon * (width - margin.l - margin.r), y = value => height - margin.b - (value - floor) / (ceiling - floor) * (height - margin.t - margin.b);
    const band = (low, high) => output.fan.map(p => `${x(p.day)},${y(p[high])}`).concat([...output.fan].reverse().map(p => `${x(p.day)},${y(p[low])}`)).join(' ');
    host.innerHTML = `<svg role="img" aria-label="Dải phân vị 5 đến 95 phần trăm và trung vị mô phỏng, đơn vị VND; đây không phải khoảng giá được bảo đảm" viewBox="0 0 ${width} ${height}">${[0, .25, .5, .75, 1].map(f => { const value = floor + f * (ceiling - floor); return `<line x1="${margin.l}" x2="${width - margin.r}" y1="${y(value)}" y2="${y(value)}" class="chart-grid"/><text x="${margin.l - 8}" y="${y(value) + 4}" text-anchor="end">${compactVnd(value)}</text>`; }).join('')}<polygon class="fan-outer" points="${band('p05', 'p95')}"/><polygon class="fan-inner" points="${band('p25', 'p75')}"/><polyline class="chart-line line-current" points="${output.fan.map(p => `${x(p.day)},${y(p.p50)}`).join(' ')}"/>${[0, .25, .5, .75, 1].map(f => `<text x="${x(output.horizon * f)}" y="${height - 10}" text-anchor="middle">${Math.round(output.horizon * f)} phiên</text>`).join('')}</svg>`;
    const maxCount = Math.max(...output.histogram.map(b => b.count));
    el('simulation-histogram').innerHTML = `<svg role="img" aria-label="Tần suất giá trị cuối kỳ trong ${output.paths} mô phỏng, trục dọc là số đường mô phỏng" viewBox="0 0 600 200"><text x="10" y="16">${maxCount} đường (đỉnh cột)</text>${output.histogram.map((b, i) => `<rect class="histogram-bar" x="${i * 27 + 24}" width="23" y="${175 - b.count / maxCount * 145}" height="${b.count / maxCount * 145}"><title>${vnd(b.from)} đến ${vnd(b.to)}: ${b.count} đường</title></rect>`).join('')}<text x="24" y="196">${compactVnd(output.histogram[0].from)}</text><text x="564" y="196" text-anchor="end">${compactVnd(output.histogram.at(-1).to)}</text></svg>`;
    el('simulation-brief').textContent = `Trong ${output.paths} đường mô phỏng, ${percent(output.lossProbability)} kết thúc thấp hơn ${vnd(output.capital)}. Trung vị cuối kỳ ${vnd(output.percentiles[2].value)}. Đây là tỷ lệ trong mô hình, không phải xác suất tương lai đã được kiểm chứng.`;
    el('simulation-percentiles').innerHTML = output.percentiles.map(p => row(`Phân vị ${number(p.percentile * 100, 0)}%`, vnd(p.value), p.percentile === .5 ? 'Một nửa đường mô phỏng ở dưới giá trị này; không phải lợi nhuận cam kết.' : `${number(p.percentile * 100, 0)}% đường mô phỏng có giá trị cuối kỳ không lớn hơn mốc này.`)).join('');
    el('simulation-tail').textContent = `VaR 95% mô phỏng (${output.horizon} phiên): ${percent(output.tail.varLoss)}; CVaR: ${percent(output.tail.expectedShortfall)}. Có thể âm nếu mẫu mô phỏng cho ngưỡng lãi. Đây không phải VaR lịch sử 1 phiên ở báo cáo. Phụ thuộc giai đoạn giá đầu vào và giả định lấy mẫu.`;
    el('simulation-meta').textContent = `${dateLabel(output.historyStart)} – ${dateLabel(output.historyEnd)}; ${output.observations} return chung; block ${output.blockLength} phiên; seed ${output.seed}; ${output.paths} đường × ${output.horizon} phiên. Vốn mô phỏng là giá trị cuối kỳ; giữ quantity theo tỷ trọng cuối kỳ, không tái cân bằng hằng ngày.`;
    el('simulation-allocation').textContent = output.symbols.map((s, i) => `${s}: ${percent(output.weights[i])}`).join(' · ');
    el('simulation-result').hidden = false;
  }
  el('simulation-form').addEventListener('submit', async event => {
    event.preventDefault(); el('simulation-error').textContent = ''; el('simulation-result').hidden = true;
    const request = ++simulationRequest;
    const data = getResult(); if (!data) { el('simulation-error').textContent = 'Hãy phân tích danh mục trước.'; return; }
    el('simulate-button').disabled = true; el('cancel-simulation').hidden = false; el('simulation-empty').textContent = 'Đang tạo các đường mô phỏng ở nền; có thể hủy mà không mất báo cáo.';
    try {
      const output = await run('simulation', simulationInput(data), { paths: Number(el('simulation-paths').value), horizon: Number(el('simulation-horizon').value), seed: Number(el('simulation-seed').value), blockLength: 5 });
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
