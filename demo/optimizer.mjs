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
