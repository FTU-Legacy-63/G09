import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {minimumVariance, maximumSharpe} from './optimizer.mjs';
import {analyzePortfolio,allocationScenario,parseMarketCsv} from './finance.mjs';
import {tailRisk,moments,quantile,historicalMetrics} from './metrics.mjs';
import {simulatePortfolio} from './simulation.mjs';
import {riskReadiness} from './quality.mjs';
const near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} ≠ ${b}`);
const covariance=[[.04,0],[0,.09]], mask=[false,true];
test('Minimum volatility matches analytic inverse-variance allocation',()=>{
  const answer=minimumVariance(covariance,mask,1,1);
  near(answer.weights[0],.09/.13,1e-5);
  near(answer.weights.reduce((a,b)=>a+b),1);
});
test('Max Sharpe differs from minimum volatility and approximates analytic tangency',()=>{
  const answer=maximumSharpe(covariance,[.08,.18],mask,1,1);
  near(answer.weights[0],.5,2e-4);
  assert.equal(answer.globalOptimumGuaranteed,false);
  assert.ok(answer.weights[0]<minimumVariance(covariance,mask,1,1).weights[0]);
});
test('Both objectives respect asset and commodity caps and reject infeasible caps',()=>{
  for(const run of [()=>minimumVariance(covariance,mask,.7,.4),()=>maximumSharpe(covariance,[.08,.18],mask,.7,.4)]){
    const out=run();near(out.weights.reduce((a,b)=>a+b),1);assert.ok(out.weights.every(w=>w>=0&&w<=.7+1e-8));assert.ok(out.weights[1]<=.4+1e-8);
  }
  assert.throws(()=>minimumVariance(covariance,mask,.4,.4),/khả thi/);
  assert.throws(()=>maximumSharpe(covariance,[.08,.18],mask,.4,.4),/khả thi/);
});
test('Analysis does not optimize; separate Sharpe defaults to 3%, permits 0%, and rejects short samples',()=>{
  const rows=parseMarketCsv(readFileSync(new URL('../data/sample_market_data.csv',import.meta.url),'utf8'));
  const result=analyzePortfolio(rows,{holdings:[{symbol:'FPT.VN',weight:40},{symbol:'HPG.VN',weight:35},{symbol:'GLD',weight:25}],startDate:'2026-07-01',endDate:'2026-07-15',optimize:false,maxAssetPercent:1,maxCommodityPercent:1});
  const original=structuredClone(result.current);
  assert.equal(result.optimization.skipped,true);
  assert.throws(()=>allocationScenario(result,{objective:'maximum-sharpe'}),/120/);
  assert.throws(()=>allocationScenario(result,{objective:'minimum-variance'}),/120/);
  const synthetic = Array.from({length:160},(_,day)=>['FPT.VN','HPG.VN','GLD','USDVND'].map((symbol,i)=>({symbol,session_date:new Date(Date.UTC(2025,0,1+day)).toISOString().slice(0,10),close:i===3?26000:100*Math.exp(.001*day+.02*Math.sin(day*(i+1)))}))).flat();
  const ready=analyzePortfolio(synthetic,{holdings:[{symbol:'FPT.VN',weight:40},{symbol:'HPG.VN',weight:35},{symbol:'GLD',weight:25}],startDate:'2025-01-01',endDate:'2025-12-31',optimize:false});
  const readyOriginal=structuredClone(ready.current);
  const automatic=allocationScenario(ready,{objective:'maximum-sharpe'});
  near(automatic.riskFreeAnnual,.03);
  assert.throws(()=>allocationScenario(ready,{objective:'maximum-sharpe',riskFreeAnnual:NaN}),/phi rủi ro/);
  for(const objective of ['minimum-variance','maximum-sharpe']){
    const out=allocationScenario(ready,{objective,riskFreeAnnual:0});
    near(out.weights.reduce((a,b)=>a+b),1);assert.ok(Number.isFinite(out.volatility));
  }
  assert.deepEqual(result.current,original);
  assert.deepEqual(ready.current,readyOriginal);
});
test('Joint resampling preserves same-day hedges, rather than drawing assets independently',()=>{
  const vectors=Array.from({length:80},(_,i)=>{const r=(i%10-4.5)/100;return [r,-r];});
  const out=simulatePortfolio({capital:100,weights:[.5,.5],symbols:['A','B'],vectors},{paths:100,horizon:1,seed:17});
  out.percentiles.forEach(p=>near(p.value,100));
});
test('Small samples cannot become annualized diagnostics; risk quality scales with asset count',()=>{
  const dates=Array.from({length:20},(_,i)=>new Date(Date.UTC(2025,0,i+1)).toISOString().slice(0,10));
  const path=dates.map((_,i)=>1+.01*Math.sin(i));
  const data={dates,current:{path},benchmark:{path},symbols:['A'],returns:{A:path.slice(1).map((v,i)=>v/path[i]-1)}};
  const metrics=historicalMetrics(data,0);
  for (const key of ['cagr','sharpe','sortino','realizedVolatility','beta','tail']) assert.equal(metrics[key],null,key);
  near(metrics.maxDrawdown,Math.min(...path.map((value,i)=>value/Math.max(...path.slice(0,i+1))-1)));
  const many={symbols:Array.from({length:30},(_,i)=>String(i)),returns:{}};
  many.symbols.forEach(s=>many.returns[s]=Array(299).fill(.01));assert.equal(riskReadiness(many).ready,false);
  many.symbols.forEach(s=>many.returns[s].push(.02));assert.equal(riskReadiness(many).ready,true);
});
test('Tail risk uses exact worst mass, not all VaR ties; undefined moments remain null',()=>{
  const r=tailRisk(Array.from({length:100},(_,i)=>-i/1000));near(r.varLoss,.094);near(r.expectedShortfall,.097);
  near(tailRisk(Array(100).fill(.01)).expectedShortfall,-.01);
  assert.deepEqual(moments([0,0,0,0]),{skewness:null,excessKurtosis:null});near(quantile([1,2,3,4],.5),2.5);
});
test('Monte Carlo is seeded, preserves joint rows, and reports zero losses on flat history',()=>{
  const input={capital:100000000,weights:[.5,.5],symbols:['A','B'],vectors:Array.from({length:80},()=>[0,0])};
  const options={paths:100,horizon:21,seed:42};const out=simulatePortfolio(input,options);
  assert.deepEqual(out,simulatePortfolio(input,options));near(out.lossProbability,0);
  out.percentiles.forEach(p=>near(p.value,input.capital));
  assert.throws(()=>simulatePortfolio({...input,vectors:input.vectors.slice(0,59)},options),/60/);
});
