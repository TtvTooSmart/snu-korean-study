import {accountConfig} from './account-config.js';
import {get,save,switchProfile,guestProgress} from './storage.js';
import {syncSnapshot,sameProgress,validStats,reconcileInFlight} from './cloud-progress.js';
let client, user=null, syncing=false, timer, conflict=null, message='', suppress=false;
let onChange=()=>{}, signedIn=false;
const clone=x=>structuredClone(x);
export const accountsEnabled=()=>!!(accountConfig.url&&accountConfig.publishableKey);
const emit=()=>document.dispatchEvent(new Event('account-status'));
const status=text=>{message=text;emit();};

async function loadSDK(){
 // Official browser SDK handles sessions, URL callbacks and token refresh.
 if(!window.supabase)await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload=resolve;script.onerror=()=>reject(Error('Could not load sign-in. Check your connection.'));
  document.head.append(script);
 });
 return window.supabase.createClient(accountConfig.url,accountConfig.publishableKey);
}
export async function initAccounts(changed){
 if(!accountsEnabled())return;
 onChange=changed;
 const link=document.createElement('a');link.href='#account';link.id='account-link';link.textContent='Account';
 document.querySelector('nav').append(link);
 try{
  client=await loadSDK();
  client.auth.onAuthStateChange((_event,session)=>{
   // Supabase callbacks must return before calling another auth/database method.
   setTimeout(()=>activate(session?.user||null),0);
  });
  const {data,error}=await client.auth.getSession();if(error)throw error;
  await activate(data.session?.user||null);
  onChange();
 }catch(e){status(e.message||'Sign-in is temporarily unavailable.');}
 document.addEventListener('study-saved',()=>{
  if(!user||suppress)return;
  clearTimeout(timer);timer=setTimeout(sync,800);
 });
 window.addEventListener('online',()=>sync());
 window.addEventListener('focus',()=>sync());
}
async function activate(next){
 if((next?.id||null)===(user?.id||null))return;
 clearTimeout(timer);suppress=true;user=next;conflict=null;
 switchProfile(user?.id);signedIn=!!user;suppress=false;
 onChange();status(user?'Syncing progress…':'Signed out. Your guest progress is available.');
 if(user)await sync();
}
export async function sync(){
 if(!client||!user||syncing||conflict)return;
 const owner=user.id, state=get(), snapshot=clone(state.stats);
 const meta=state.cloud||{base:{},revision:0};
 syncing=true;status('Syncing progress…');
 try{
  let result=await syncSnapshot(client,owner,snapshot,meta.base,meta.revision);
  if(user?.id!==owner)return;
  result=reconcileInFlight(state.stats,snapshot,result);
  if(result.kind==='conflict'){conflict=result;status('Progress also changed on another device. Choose which copy to keep.');return;}
  suppress=true;
  state.cloud={base:clone(result.stats),revision:result.revision};
  // Avoid dropping an answer given while the network request was running.
  if(sameProgress(state.stats,snapshot))state.stats=clone(result.stats);
  save();suppress=false;onChange(false);status('Progress saved to your account.');
  if(!sameProgress(state.stats,state.cloud.base))timer=setTimeout(sync,100);
 }catch(e){status('Progress is saved on this device. Cloud sync failed; try Sync now when connected.');}
 finally{syncing=false;suppress=false;}
}
export function accountView(app,esc){
 if(!accountsEnabled()){
  app.innerHTML='<h1>Accounts</h1><div class="panel"><p>Account sync is not enabled yet. Your progress is saved on this device. Use Import & backup to transfer it.</p></div>';return;
 }
 if(user){
  app.innerHTML=`<p class="eyebrow">Your study account</p><h1>Your progress, wherever you study.</h1><section class="panel"><p>${esc(user.email)}</p><p id="account-status" role="status">${esc(message)}</p><div class="actions"><button id="sync-now">Sync now</button><button id="sign-out" class="secondary">Sign out</button></div><div id="sync-conflict" ${conflict?'':'hidden'}><p>Both copies are kept on this device before resolving a conflict.</p><div class="actions"><button id="use-cloud">Use cloud progress</button><button id="use-device" class="secondary">Use this device’s progress</button></div></div><details><summary>Bring your guest progress into this account</summary><p>This replaces this account’s current progress with the guest progress saved in this browser. A local recovery copy is kept.</p><button id="copy-guest" class="secondary">Copy guest progress</button></details><p><small>Word and grammar statistics and flags sync. Imported books, settings and unfinished sessions stay on each device; use Export for a full backup.</small></p></section>`;
  app.querySelector('#sync-now').onclick=()=>sync();
  app.querySelector('#sign-out').onclick=async()=>{
   try{await sync();const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;await activate(null);accountView(app,esc);}catch(e){status(e.message);}
  };
  const resolve=async useCloud=>{
   if(!conflict||syncing)return;
   const state=get();state.cloudRecovery={local:clone(state.stats),remote:clone(conflict.stats),savedAt:new Date().toISOString()};
   state.cloud={base:clone(conflict.stats),revision:conflict.revision};
   if(useCloud){state.stats=clone(conflict.stats);state.session=null;}
   conflict=null;suppress=true;save();suppress=false;onChange(useCloud);await sync();accountView(app,esc);
  };
  app.querySelector('#use-cloud').onclick=()=>resolve(true);
  app.querySelector('#use-device').onclick=()=>resolve(false);
  app.querySelector('#copy-guest').onclick=()=>{
   if(!confirm('Replace this account’s progress with this browser’s guest progress? A recovery copy will be kept.'))return;
   const guest=validStats(guestProgress());const state=get();state.cloudRecovery={local:clone(state.stats),savedAt:new Date().toISOString()};
   state.stats=clone(guest);state.session=null;save();onChange();sync();
  };
 }else{
  app.innerHTML=`<p class="eyebrow">Your study account</p><h1>Keep your progress with you.</h1><div class="panel"><p>Sign in with an email link to save your progress across devices. You can also keep studying as a guest.</p><form id="sign-in"><label>Email<input type="email" id="account-email" autocomplete="email" required></label><button ${client?'':'disabled'}>Email me a sign-in link</button></form><p id="account-status" role="status">${esc(message)}</p></div>`;
  app.querySelector('#sign-in').onsubmit=async e=>{
   e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
   try{const {error}=await client.auth.signInWithOtp({email:app.querySelector('#account-email').value.trim(),options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;status('Check your email for the sign-in link.');}catch(e){status(e.message||'Could not send the sign-in link.');}finally{button.disabled=false;}
  };
 }
}
document.addEventListener('account-status',()=>{
 const node=document.querySelector('#account-status');if(node)node.textContent=message;
 const box=document.querySelector('#sync-conflict');if(box)box.hidden=!conflict;
 const link=document.querySelector('#account-link');if(link)link.textContent=signedIn?(conflict?'Account · sync needed':'Account'):'Sign in';
});
