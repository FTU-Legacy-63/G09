import test from 'node:test';
import assert from 'node:assert/strict';
import {decisionRecord,decisionSnapshot,tabAuthStorage} from './decision-record.mjs';
const result={dates:['2026-01-01','2026-10-01'],symbols:['FPT.VN','GLD'],initialCapital:100,current:{weights:[.5,.5],valuePath:[100,110],periodReturn:.1,volatility:.2},benchmark:{symbol:'VN30.VN'},localPrices:{secret:'not persisted'},userEmail:'not persisted'};
test('Vietnamese decision text is canonically composed without changing meaning',()=>{
 const reason='Giữ nguyên vì tỷ giá ổn định';
 const row=decisionRecord(result,'Giữ nguyên',reason.normalize('NFD'),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','id');
 assert.equal(row.reason,reason);
});
test('Decision snapshot stores only compact whitelisted analysis, no identity or full prices',()=>{
 const snapshot=decisionSnapshot(result);
 assert.equal(snapshot.reportingCurrency,'VND');assert.equal(snapshot.finalValue,110);
 assert.equal(snapshot.localPrices,undefined);assert.equal(snapshot.userEmail,undefined);
 assert.deepEqual(snapshot.holdings,[{symbol:'FPT.VN',weight:.5},{symbol:'GLD',weight:.5}]);
});
test('Decisions reject missing analysis, invalid choice, short reason and anonymous identity',()=>{
 assert.throws(()=>decisionSnapshot(null),/phân tích/);
 const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 assert.throws(()=>decisionRecord(result,'Buy','Valid reason',owner,'id'),/Chọn/);
 assert.throws(()=>decisionRecord(result,'Giữ nguyên','       ',owner,'id'),/ký tự/);
 assert.throws(()=>decisionRecord(result,'Giữ nguyên','Valid reason',null,'id'),/đăng nhập/);
 assert.equal(decisionRecord(result,'Giữ nguyên','  Valid reason  ',owner,'id').reason,'Valid reason');
});
test('Auth tab adapter strips Google tokens and only writes supplied tab storage',()=>{
 const values=new Map(), storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const adapter=tabAuthStorage(storage);
 adapter.setItem('session',JSON.stringify({access_token:'test',provider_token:'discard',provider_refresh_token:'discard'}));
 assert.deepEqual(JSON.parse(adapter.getItem('session')),{access_token:'test'});
 adapter.setItem('pkce','test-verifier');assert.equal(adapter.getItem('pkce'),'test-verifier');
 adapter.removeItem('session');assert.equal(adapter.getItem('session'),undefined);
});
