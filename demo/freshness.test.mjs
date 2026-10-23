import test from 'node:test';
import assert from 'node:assert/strict';
import {vnToday,rollingRange,shouldRefresh} from './freshness.mjs';
test('Latest range follows VN date and clamps five-year leap day',()=>{
  assert.equal(vnToday(new Date('2026-10-22T18:00:00Z')),'2026-10-23');
  assert.deepEqual(rollingRange('2010-01-01','2024-02-29'),{start:'2019-02-28',end:'2024-02-29'});
  assert.equal(rollingRange('2026-01-01','2026-10-23').start,'2026-01-01');
});
test('Fixed range never auto-refreshes; latest refreshes on new session/day or six-hour expiry',()=>{
  const now=new Date('2026-10-23T04:00:00Z'),result={inputEndDate:'2026-10-23',fetchedAtUtc:'2026-10-23T03:00:00Z',vnSources:{'FPT.VN':{last_session:'2026-10-22'}}};
  assert.equal(shouldRefresh(result,{}, {followLatest:true,now}),false);
  const status={series:{'FPT.VN':{last_session:'2026-10-23'}}};
  assert.equal(shouldRefresh(result,status,{followLatest:true,now}),true);
  assert.equal(shouldRefresh(result,status,{followLatest:false,now}),false);
  assert.equal(shouldRefresh(result,status,{followLatest:true,analyzing:true,now}),false);
  assert.equal(shouldRefresh({...result,inputEndDate:'2026-10-22'},{},{followLatest:true,now}),true);
  assert.equal(shouldRefresh({...result,fetchedAtUtc:'2026-10-22T15:00:00Z'},{},{followLatest:true,now}),true);
});
