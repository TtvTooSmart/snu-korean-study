import test from 'node:test';
import assert from 'node:assert/strict';
import {syncSnapshot,validStats,reconcileInFlight,sameProgress} from '../js/cloud-progress.js';
const stats=n=>({word:{seen:n,missed:0,streak:n,flagged:false,lastResult:true}});
function fakeClient(remote,writeResult){
 const calls=[];
 return {calls,from:()=>({select:()=>({eq:(_key,user)=>{calls.push(['read',user]);return {maybeSingle:async()=>({data:remote,error:null})};}})}),rpc:async(name,args)=>{calls.push([name,args]);if(writeResult?.saved)remote={stats:args.new_stats,revision:writeResult.revision};return {data:writeResult,error:null};}};
}
test('clean new device downloads cloud progress without a write',async()=>{
 const client=fakeClient({stats:stats(4),revision:2});
 assert.deepEqual(await syncSnapshot(client,'one',{}, {},0),{kind:'saved',stats:stats(4),revision:2});
 assert.equal(client.calls.length,1);
});
test('new account saves guest import against revision zero',async()=>{
 const client=fakeClient(null,{saved:true,revision:1});
 assert.equal((await syncSnapshot(client,'one',stats(3),{},0)).revision,1);
 assert.deepEqual(client.calls[1],['save_study_progress',{expected_revision:0,new_stats:stats(3)}]);
});
test('simultaneous device changes never overwrite the other device silently',async()=>{
 const client=fakeClient({stats:stats(5),revision:3});
 assert.equal((await syncSnapshot(client,'one',stats(4),stats(2),2)).kind,'conflict');
 assert.equal(client.calls.length,1);
});
test('a write racing after the read returns an explicit conflict',async()=>{
 const client=fakeClient({stats:stats(2),revision:2},{saved:false,stats:stats(5),revision:3});
 assert.equal((await syncSnapshot(client,'one',stats(4),stats(2),2)).kind,'conflict');
});
test('retry after a lost response recognizes already-saved progress without duplication',async()=>{
 const client=fakeClient({stats:stats(4),revision:3});
 assert.equal((await syncSnapshot(client,'one',stats(4),stats(2),2)).revision,3);
 assert.equal(client.calls.length,1);
});
test('reset can sync an empty progress object',async()=>{
 const client=fakeClient({stats:stats(2),revision:2},{saved:true,revision:3});
 assert.deepEqual((await syncSnapshot(client,'one',{},stats(2),2)).stats,{});
 assert.equal(client.calls.length,3);
});
test('invalid remote/local data is rejected before being used',()=>{
 assert.throws(()=>validStats({x:{seen:0,missed:2,streak:0}}),/Invalid/);
 assert.throws(()=>validStats(JSON.parse('{"__proto__":{}}')),/Invalid/);
 assert.throws(()=>validStats({x:{seen:1,missed:0,streak:1,flagged:'yes'}}),/Invalid/);
});

test('answer during a cloud download preserves both copies as a conflict',()=>{
 const remote={kind:'saved',stats:stats(5),revision:3};
 assert.equal(reconcileInFlight(stats(3),stats(2),remote).kind,'conflict');
 assert.equal(reconcileInFlight(stats(2),stats(2),remote).kind,'saved');
 const uploaded={kind:'saved',stats:stats(2),revision:3};
 assert.equal(reconcileInFlight(stats(3),stats(2),uploaded).kind,'saved');
});

function verificationClient(verified,error=null){
 let reads=0;
 return {from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>++reads===1?{data:null,error:null}:{data:verified,error}})})}),
  rpc:async()=>({data:{saved:true,revision:1},error:null})};
}
test('an acknowledged upload must also pass server read-back verification',async()=>{
 const verified={stats:stats(2),revision:1};
 assert.deepEqual(await syncSnapshot(verificationClient(verified),'one',stats(2),{},0),{kind:'saved',...verified});
});
test('missing or failed verification leaves the batch eligible for retry',async()=>{
 await assert.rejects(syncSnapshot(verificationClient(null),'one',stats(2),{},0),/verify/);
 await assert.rejects(syncSnapshot(verificationClient(null,Error('Offline')),'one',stats(2),{},0),/Offline/);
});
test('another device changing progress before verification is a conflict',async()=>{
 const newer={stats:stats(5),revision:2};
 assert.deepEqual(await syncSnapshot(verificationClient(newer),'one',stats(2),{},0),{kind:'conflict',...newer});
});

// Model jsonb's freedom to reorder every object, without changing any values.
const reordered=value=>value&&typeof value==='object'
 ?Object.fromEntries(Object.entries(value).reverse().map(([key,item])=>[key,reordered(item)]))
 :value;
const multiCardStats=()=>({
 '3b-u10-v2':{seen:3,missed:1,streak:2,flagged:false,lastResult:true},
 '2b-u11-v1':{seen:2,missed:2,streak:0,flagged:true,lastResult:false},
 '3b-u15-v4':{seen:0,missed:0,streak:0,flagged:false}
});
test('progress equality ignores card and field order without mutating either copy',()=>{
 const local=multiCardStats(),remote=reordered(local);
 const before=JSON.stringify(local),remoteBefore=JSON.stringify(remote);
 assert.notEqual(before,remoteBefore);
 assert.ok(sameProgress(local,remote));
 assert.ok(sameProgress(remote,local));
 assert.equal(JSON.stringify(local),before);
 assert.equal(JSON.stringify(remote),remoteBefore);
});
test('progress equality still notices every changed statistic, flag and card',()=>{
 const local=multiCardStats();
 for(const [key,value] of Object.entries({seen:4,missed:2,streak:0,flagged:true,lastResult:false})){
  const remote=reordered(local);remote['3b-u10-v2'][key]=value;
  assert.equal(sameProgress(local,remote),false,key);
 }
 const missing=reordered(local);delete missing['3b-u15-v4'];
 assert.equal(sameProgress(local,missing),false);
 const missingFlag=reordered(local);delete missingFlag['3b-u15-v4'].flagged;
 assert.equal(sameProgress(local,missingFlag),false);
});
test('server read-back with reordered JSON verifies the successful upload',async()=>{
 const local=multiCardStats(),verified={stats:reordered(local),revision:1};
 assert.deepEqual(await syncSnapshot(verificationClient(verified),'one',local,{},0),{kind:'saved',...verified});
});
test('stale revision with semantically identical cloud progress resolves without another upload',async()=>{
 const local=multiCardStats(),remote={stats:reordered(local),revision:2},client=fakeClient(remote);
 assert.deepEqual(await syncSnapshot(client,'one',local,stats(1),1),{kind:'saved',...remote});
 assert.deepEqual(client.calls,[['read','one']]);
});
test('an unchanged but reordered base adopts cloud updates without writing',async()=>{
 const local=multiCardStats(),base=reordered(local),remoteStats=reordered(local);
 remoteStats['3b-u10-v2'].seen++;
 const remote={stats:remoteStats,revision:2},client=fakeClient(remote);
 assert.deepEqual(await syncSnapshot(client,'one',local,base,1),{kind:'saved',...remote});
 assert.deepEqual(client.calls,[['read','one']]);
});
test('genuine pending changes remain a conflict despite reordered JSON',async()=>{
 const base=multiCardStats(),local=structuredClone(base),remoteStats=reordered(base);
 local['3b-u10-v2'].seen++;local['3b-u10-v2'].streak++;
 remoteStats['2b-u11-v1'].flagged=false;
 const remote={stats:remoteStats,revision:2},client=fakeClient(remote);
 assert.deepEqual(await syncSnapshot(client,'one',local,base,1),{kind:'conflict',...remote});
 assert.deepEqual(client.calls,[['read','one']]);
});
test('reordered upload verification preserves an answer given while syncing',()=>{
 const snapshot=multiCardStats(),current=structuredClone(snapshot);
 current['3b-u10-v2'].seen++;current['3b-u10-v2'].streak++;
 const uploaded={kind:'saved',stats:reordered(snapshot),revision:2};
 assert.deepEqual(reconcileInFlight(current,snapshot,uploaded),uploaded);
 const changedElsewhere={...uploaded,stats:reordered(current)};
 changedElsewhere.stats['2b-u11-v1'].flagged=false;
 assert.equal(reconcileInFlight(current,snapshot,changedElsewhere).kind,'conflict');
});
