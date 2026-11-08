import test from 'node:test';
import assert from 'node:assert/strict';
const values=new Map();
globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
const {get,record,switchProfile,guestProgress,notice}=await import('../js/storage.js');
test('guest and separate accounts retain independent progress',()=>{
 record('guest-word',true);
 switchProfile('user-a');assert.deepEqual(get().stats,{});
 record('a-word',false);
 switchProfile('user-b');assert.deepEqual(get().stats,{});
 record('b-word',true);
 switchProfile('user-a');assert.equal(get().stats['a-word'].missed,1);assert.equal(get().stats['b-word'],undefined);
 assert.equal(guestProgress()['guest-word'].seen,1);
 switchProfile();assert.equal(get().stats['guest-word'].seen,1);assert.equal(get().stats['a-word'],undefined);
});
test('storage failure keeps progress in memory with a visible warning',()=>{
 localStorage.setItem=()=>{throw Error('Quota exceeded');};
 record('offline-word',true);
 assert.equal(get().stats['offline-word'].seen,1);
 assert.match(notice(),/Could not save progress/);
 switchProfile('user-a');switchProfile();
 assert.equal(get().stats['offline-word'].seen,1);
});
