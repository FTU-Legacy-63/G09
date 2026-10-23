// Conditional-gradient solver on a capped long-only simplex. No exponential grid.
export function minimumVariance(covariance, commodityMask, assetCap, commodityCap, initial = null) {
  const n = covariance.length;
  function vertex(cost) {
    const w = Array(n).fill(0);
    let remaining = 1, usedCommodity = 0;
    for (const i of Array.from({ length: n }, (_, i) => i).sort((a, b) => cost[a] - cost[b])) {
      const take = Math.max(0, Math.min(assetCap, remaining, commodityMask[i] ? commodityCap - usedCommodity : 1));
      w[i] = take; remaining -= take;
      if (commodityMask[i]) usedCommodity += take;
    }
    if (remaining > 1e-9) throw new Error('Giới hạn tỷ trọng không khả thi với các mã đã chọn.');
    return w;
  }
  const multiply = (w) => covariance.map((row) => row.reduce((sum, c, j) => sum + c * w[j], 0));
  const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
  const feasible = initial && Math.abs(initial.reduce((a,b)=>a+b,0)-1)<1e-9 && initial.every(v=>v>=0 && v<=assetCap+1e-9) && initial.reduce((s,v,i)=>s+(commodityMask[i]?v:0),0)<=commodityCap+1e-9;
  let w = feasible ? [...initial] : vertex(Array(n).fill(0));
  const scale = Math.max(...covariance.map((row, i) => Math.abs(row[i])), 1e-12);
  let gap = Infinity, iterations = 0;
  for (; iterations < 4000; iterations++) {
    const cw = multiply(w), gradient = cw.map(v=>2*v), v = vertex(gradient), d = v.map((value,i)=>value-w[i]);
    gap = -dot(gradient, d);
    if (gap <= scale * 1e-7) break;
    const denominator = 2 * dot(d, multiply(d));
    const step = denominator > 0 ? Math.min(1, Math.max(0, gap / denominator)) : 1;
    w = w.map((value,i)=>value+step*d[i]);
  }
  return { weights:w, iterations, gap, converged:gap<=scale*1e-7, method:'Constrained minimum variance · conditional gradient' };
}

// Approximate non-convex Sharpe search, NOT a guarantee of a global optimum.
// Uses historical daily arithmetic means and the user's explicit risk-free input.
export function maximumSharpe(covariance, excessMeans, commodityMask, assetCap, commodityCap) {
  const n = covariance.length;
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const multiply = w => covariance.map(row => dot(row, w));
  function vertex(cost) {
    const w = Array(n).fill(0); let remaining = 1, commodity = 0;
    for (const i of Array.from({length:n}, (_, i) => i).sort((a, b) => cost[a] - cost[b])) {
      const take = Math.max(0, Math.min(assetCap, remaining, commodityMask[i] ? commodityCap - commodity : 1));
      w[i] = take; remaining -= take; if (commodityMask[i]) commodity += take;
    }
    if (remaining > 1e-9) throw Error('Giới hạn tỷ trọng không khả thi với các mã đã chọn.');
    return w;
  }
  const score = w => { const variance = dot(w, multiply(w)); return variance > 1e-18 ? dot(w, excessMeans) / Math.sqrt(variance) : -Infinity; };
  const minimum = minimumVariance(covariance, commodityMask, assetCap, commodityCap).weights;
  const starts = [minimum, vertex(excessMeans.map(x => -x)), vertex(Array(n).fill(0))];
  let best = null;
  for (const initial of starts) {
    let w = [...initial], value = score(w), iterations = 0, gap = Infinity;
    for (; iterations < 2000 && Number.isFinite(value); iterations++) {
      const cw = multiply(w), sigma = Math.sqrt(dot(w, cw)), numerator = dot(w, excessMeans);
      const gradient = excessMeans.map((mu, i) => -mu / sigma + numerator * cw[i] / sigma ** 3);
      const v = vertex(gradient), direction = v.map((x, i) => x - w[i]);
      gap = -dot(gradient, direction); if (gap < 1e-8) break;
      let improved = false;
      for (let step = 1; step >= 1e-9; step *= .5) {
        const candidate = w.map((x, i) => x + step * direction[i]), next = score(candidate);
        if (next > value + 1e-12) { w = candidate; value = next; improved = true; break; }
      }
      if (!improved) break;
    }
    if (!best || value > best.score) best = { weights: w, score: value, iterations, gap, converged: gap < 1e-8 };
  }
  if (!Number.isFinite(best.score)) throw Error('Biến động gần 0: Sharpe không xác định; hãy dùng minimum variance.');
  return { ...best, method: 'Sharpe lịch sử · tìm kiếm conditional gradient xấp xỉ, 3 điểm khởi tạo', globalOptimumGuaranteed: false };
}
