import test from 'node:test';
import assert from 'node:assert/strict';
import {syncSnapshot,validStats,reconcileInFlight} from '../js/cloud-progress.js';
const stats=n=>({word:{seen:n,missed:0,streak:n,flagged:false,lastResult:true}});
function fakeClient(remote,writeResult){
 const calls=[];
 return {calls,from:()=>({select:()=>({eq:(_key,user)=>{calls.push(['read',user]);return {maybeSingle:async()=>({data:remote,error:null})};}})}),rpc:async(name,args)=>{calls.push([name,args]);return {data:writeResult,error:null};}};
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
 assert.equal(client.calls.length,2);
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
