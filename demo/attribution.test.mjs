import test from 'node:test';
import assert from 'node:assert/strict';
import {attributionWindow,groupAttribution,periodStart,csvCell} from './attribution.mjs';
import {minimumVariance} from './optimizer.mjs';
const data={dates:['2026-01-01','2026-08-31','2026-09-01','2026-09-30'],initialCapital:100,current:{weights:[.5,.5],valuePath:[100,150,155,200]},symbols:['A','B'],prices:{A:[1,2,2.1,3],B:[1,1,1,1]},instruments:{A:{name:'A',className:'Equity',group:'US equity',currency:'USD'},B:{name:'B',className:'Equity',group:'US equity',currency:'USD'}}};
test('Sector and industry group independently and preserve all contributions including unclassified/non-equities',()=>{
 const positions=[{symbol:'A',className:'Equity',sector:'Technology',industry:'Software',weight:.3,pnl:3,contribution:.03},{symbol:'B',className:'Equity',sector:'Technology',industry:'Hardware',weight:.3,pnl:-1,contribution:-.01},{symbol:'C',className:'Equity',weight:.2,pnl:1,contribution:.01},{symbol:'GLD',className:'Commodity proxy',weight:.2,pnl:2,contribution:.02}];
 for(const mode of ['sector','industry']) {
  const rows=groupAttribution(positions,mode);
  assert.ok(Math.abs(rows.reduce((s,r)=>s+r.weight,0)-1)<1e-12);
  assert.ok(Math.abs(rows.reduce((s,r)=>s+r.contribution,0)-.05)<1e-12);
  assert.equal(rows.reduce((s,r)=>s+r.pnl,0),5);
  assert.ok(rows.some(r=>r.symbol==='Chưa có phân loại'));
  assert.ok(rows.some(r=>r.symbol==='Không áp dụng · Commodity proxy'));
 }
 assert.equal(groupAttribution(positions,'sector').length,3);
 assert.equal(groupAttribution(positions,'industry').length,4);
});
test('lookback rebases holdings weight, money and contributions to window start',()=>{
 const w=attributionWindow(data,'1M');
 assert.equal(w.startDate,'2026-08-31');assert.ok(Math.abs(w.positions[0].weight-2/3)<1e-12);
 assert.ok(Math.abs(w.positions.reduce((s,p)=>s+p.contribution,0)-w.periodReturn)<1e-12);
 assert.equal(w.positions.reduce((s,p)=>s+p.pnl,0),w.pnl);
 assert.notEqual(w.positions[0].weight,.5);
});
test('FX split uses lookback-start weights and reconciles, legacy results remain unknown',()=>{
 const enriched={...data,localPrices:{A:[1,1.5,1.6,2],B:[1,1,1,1]},fxRates:[1,4/3,2.1/1.6,1.5]};
 // Both USD instruments must have consistent translated price paths.
 enriched.prices={A:data.prices.A,B:enriched.fxRates};
 enriched.current={weights:[.5,.5],valuePath:enriched.dates.map((_,i)=>50*enriched.prices.A[i]+50*enriched.prices.B[i])};
 for(const period of ['ALL','1M']) for(const p of attributionWindow(enriched,period).positions)
  assert.ok(Math.abs(p.localContribution+p.fxContribution+p.interactionContribution-p.contribution)<1e-12);
 assert.equal(attributionWindow(data).positions[0].fxContribution,null);
});
test('group contribution reconciles and zero-weight holdings stay finite',()=>{
 const w=attributionWindow(data,'ALL'), groups=groupAttribution(w.positions,'class');
 assert.equal(groups.length,1);assert.equal(groups[0].weight,1);assert.equal(groups[0].contribution,w.periodReturn);
 assert.equal(groupAttribution([{className:'Zero',weight:0,pnl:0,contribution:0}],'class')[0].assetReturn,0);
});
test('month-end clamps to last day; YTD and truncated history resolve correctly',()=>{
 assert.equal(periodStart(['2026-02-28','2026-03-01','2026-03-31'],'1M'),0);
 assert.equal(periodStart(data.dates,'YTD'),0);assert.equal(periodStart(data.dates,'5Y'),0);
 assert.equal(attributionWindow(data,'5Y').complete,false);
});
test('CSV names cannot become executable spreadsheet formulas',()=>{
 assert.equal(csvCell('=HYPERLINK("x")'),'"\'=HYPERLINK(""x"")"');assert.equal(csvCell(-3),'"-3"');
});
test('30-position optimizer is feasible, bounded and improves variance',()=>{
 const n=30,c=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?.001+i*.0001:0));
 const mask=Array.from({length:n},(_,i)=>i<5), w=minimumVariance(c,mask,.1,.2,Array(n).fill(1/n)).weights;
 assert.ok(Math.abs(w.reduce((s,v)=>s+v,0)-1)<1e-10);assert.ok(w.every(v=>v>=0&&v<=.1+1e-10));assert.ok(w.slice(0,5).reduce((s,v)=>s+v,0)<=.2+1e-10);
 assert.ok(w.reduce((s,v,i)=>s+v*v*c[i][i],0)<=c.reduce((s,row,i)=>s+row[i]/n/n,0));
});
test('infeasible all-commodity caps are rejected',()=>assert.throws(()=>minimumVariance([[1,0],[0,1]],[true,true],.8,.6),/không khả thi/));
