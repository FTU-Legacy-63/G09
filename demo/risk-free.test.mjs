import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRiskFree,riskFreeForResult} from './risk-free.mjs';
test('No user input resolves to the quiet Finfolio 3% default',()=>{
  const rf=resolveRiskFree();assert.equal(rf.annual,.03);assert.equal(rf.mode,'default');assert.equal(rf.source,'Mặc định lãi suất phi rủi ro Finfolio');
  assert.deepEqual(resolveRiskFree({mode:'default',percent:'',source:''}),rf);
});
test('A valid HNX quote becomes the default risk-free rate',()=>{
  const quote={annual:.04488,source:'HNX · lợi suất par trái phiếu Chính phủ Việt Nam 10 năm · 2026-10-26',observedAt:'2026-10-26'};
  assert.deepEqual(resolveRiskFree({quote}),{annual:.04488,source:quote.source,observedAt:quote.observedAt,mode:'default'});
});
test('Default mode ignores stale custom fields; custom zero and negative assumptions are preserved',()=>{
  assert.equal(resolveRiskFree({mode:'default',percent:9}).annual,.03);
  assert.equal(resolveRiskFree({mode:'custom',percent:'0'}).annual,0);
  assert.equal(resolveRiskFree({mode:'custom',percent:'-1'}).annual,-.01);
  assert.equal(resolveRiskFree({mode:'custom',percent:'4',source:'Giả định kiểm thử'}).source,'Giả định kiểm thử');
});
test('Invalid custom assumptions cannot silently become zero or the default',()=>{
  for(const percent of ['', 'abc', 'Infinity', '-100', '101']) assert.throws(()=>resolveRiskFree({mode:'custom',percent}),/tùy chỉnh/);
  assert.throws(()=>resolveRiskFree({mode:'other'}),/chế độ/);
});
test('Legacy missing rate migrates to default, explicit user rate including zero is retained',()=>{
  assert.equal(riskFreeForResult({riskFreeAnnual:null}).annual,.03);
  assert.equal(riskFreeForResult({}).mode,'default');
  assert.equal(riskFreeForResult({riskFreeAnnual:0}).annual,0);
  assert.equal(riskFreeForResult({riskFreeAnnual:.04,riskFreeSource:'Giả định cũ'}).source,'Giả định cũ');
});
