import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the real storage events and account sync with an in-memory server.
const values=new Map(), nav={append(){}};
globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
globalThis.document=Object.assign(new EventTarget(),{
 createElement:()=>({}), querySelector:s=>s==='nav'?nav:null
});
let intervalCallback, intervalMs;
globalThis.setInterval=(fn,ms)=>{intervalCallback=fn;intervalMs=ms;return 1;};
globalThis.clearInterval=()=>{};
const owner={id:'sync-test-user',email:'student@example.com',email_confirmed_at:'2026-11-08'};
let remote=null, writes=0, activeWrites=0, maxWrites=0, offline=false, holdWrite=null, authChanged;
const client={
 auth:{getSession:async()=>({data:{session:{user:owner}}}),
  getUser:async()=>({data:{user:owner}}),onAuthStateChange:fn=>{authChanged=fn;}},
 from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>{
  if(offline)throw Error('Offline');
  return {data:structuredClone(remote),error:null};
 }})})}),
 rpc:async(_name,args)=>{
  writes++;activeWrites++;maxWrites=Math.max(maxWrites,activeWrites);
  try{
   if(holdWrite)await holdWrite();
   assert.equal(args.expected_revision,remote?.revision||0);
   remote={stats:structuredClone(args.new_stats),revision:(remote?.revision||0)+1};
   return {data:{saved:true,revision:remote.revision},error:null};
  }finally{activeWrites--;}
 }
};
globalThis.window=Object.assign(new EventTarget(),{supabase:{createClient:()=>client}});
const {record,get,save}=await import('../js/storage.js');
const {initAccounts,sync,isSignedIn}=await import('../js/account.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('progress batches every 30 seconds and survives interrupted sessions',async t=>{
 const changes=[];
 await initAccounts(profileChanged=>changes.push(profileChanged));
 assert.equal(intervalMs,30000);assert.equal(isSignedIn(),true);
 await t.test('answers save locally without an upload until the batch timer fires',async()=>{
  record('3b-vocab-test',true);record('3b-grammar-test',false);
  await tick();assert.equal(writes,0);assert.equal(remote,null);
  const cached=JSON.parse(values.get('snu-study-account:sync-test-user'));
  assert.equal(cached.stats['3b-grammar-test'].missed,1);
  intervalCallback();await tick();
  assert.equal(remote.stats['3b-vocab-test'].seen,1);
  assert.equal(remote.stats['3b-grammar-test'].missed,1);
  assert.equal(writes,1);
  intervalCallback();await tick();assert.equal(writes,1);
 });
 await t.test('answers during a slow upload stay pending until the next batch',async()=>{
  let release, started;
  const began=new Promise(r=>{started=r;});
  const gate=new Promise(r=>{release=r;});
  holdWrite=()=>{holdWrite=null;started();return gate;};
  record('3b-vocab-test',false);intervalCallback();await began;
  record('3b-grammar-test',true);record('3b-vocab-test',true);
  release();await tick();
  assert.equal(remote.stats['3b-vocab-test'].seen,2);
  assert.equal(get().stats['3b-vocab-test'].seen,3);
  intervalCallback();await tick();
  assert.equal(remote.stats['3b-vocab-test'].seen,3);
  assert.equal(remote.stats['3b-vocab-test'].missed,1);
  assert.equal(remote.stats['3b-grammar-test'].seen,2);
  assert.equal(maxWrites,1);assert.deepEqual(remote.stats,get().stats);
 });
 await t.test('offline answers remain local and upload on the next connected batch',async()=>{
  offline=true;record('3b-offline-test',true);intervalCallback();await tick();
  assert.equal(get().stats['3b-offline-test'].seen,1);
  assert.equal(remote.stats['3b-offline-test'],undefined);
  offline=false;intervalCallback();await tick();
  assert.equal(remote.stats['3b-offline-test'].seen,1);
 });
 await t.test('a batch preserves the active quiz, queue, answers and 18% completion',async()=>{
  const session={type:'vocab',deck:Array.from({length:50},(_,i)=>({id:`card-${i}`})),
   queue:Array.from({length:41},(_,i)=>`card-${i+9}`),correct:9,wrong:0,
   first:{'card-8':true},streaks:{'card-8':1},misses:{},answered:false,
   choices:['one','two','three','four'],cardDirection:'ko',answer:'one'};
  get().session=structuredClone(session);save();
  record('3b-session-sync-test',true);
  changes.length=0;intervalCallback();await tick();
  assert.deepEqual(get().session,session);
  assert.equal((session.deck.length-get().session.queue.length)/session.deck.length,0.18);
  assert.deepEqual(changes,[false], 'sync updates mastery without resetting the route');
  assert.deepEqual(JSON.parse(values.get('snu-study-account:sync-test-user')).session,session);
  assert.equal(remote.stats['3b-session-sync-test'].seen,1);
 });
 await t.test('reopening restores pending answers and login reconciles them',async()=>{
  record('3b-pending-test',false);await tick();
  assert.equal(remote.stats['3b-pending-test'],undefined);
  // A fresh storage module has no memory cache: it must load localStorage.
  const reopened=await import('../js/storage.js?reopened');
  reopened.switchProfile(owner.id);
  assert.equal(reopened.get().stats['3b-pending-test'].missed,1);
  assert.equal(reopened.get().cloud.base['3b-pending-test'],undefined);
  authChanged('SIGNED_OUT',null);await new Promise(r=>setTimeout(r,10));
  authChanged('SIGNED_IN',{user:owner});await new Promise(r=>setTimeout(r,10));
  assert.equal(remote.stats['3b-pending-test'].missed,1);
 });
 await t.test('guest answers stay local and unchanged settings do not upload',async()=>{
  const before=writes;save();intervalCallback();await tick();assert.equal(writes,before);
  authChanged('SIGNED_OUT',null);await new Promise(r=>setTimeout(r,10));
  assert.equal(isSignedIn(),false);
  record('guest-only',true);intervalCallback();await sync();
  assert.equal(writes,before);assert.equal(remote.stats['guest-only'],undefined);
 });
});
