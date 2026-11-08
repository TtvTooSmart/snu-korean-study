import test from 'node:test';
import assert from 'node:assert/strict';
import {isVerifiedAdmin,verifyAdmin} from '../js/admin-access.js';
const admin={id:'owner',email:'shivamj8866@gmail.com',email_confirmed_at:'2026-11-08T00:00:00Z'};
test('only the confirmed owner email has admin access',()=>{
 assert.equal(isVerifiedAdmin(admin),true);
 for(const u of [null,{...admin,email:'student@example.com'},{...admin,email_confirmed_at:null},{...admin,is_anonymous:true},{id:'student',user_metadata:{email:admin.email,role:'admin'}}])assert.equal(isVerifiedAdmin(u),false);
});
test('admin verification rejects stale identity, errors and missing sessions',async()=>{
 const client={auth:{getUser:async()=>({data:{user:admin},error:null})}};
 assert.equal(await verifyAdmin(client,'owner'),true);
 assert.equal(await verifyAdmin(client,'different-user'),false);
 assert.equal(await verifyAdmin(client,null),false);
 assert.equal(await verifyAdmin({auth:{getUser:async()=>({data:{user:admin},error:Error('expired')})}},'owner'),false);
 assert.equal(await verifyAdmin({auth:{getUser:async()=>{throw Error('offline');}}},'owner'),false);
});
