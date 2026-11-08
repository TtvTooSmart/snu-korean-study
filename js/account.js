import {accountError} from './account-errors.js';
import {createSyncQueue} from './sync-queue.js';
import {verifyAdmin} from './admin-access.js';
import {accountConfig} from './account-config.js';
import {get,save,switchProfile,guestProgress} from './storage.js';
import {syncSnapshot,sameProgress,validStats,reconcileInFlight} from './cloud-progress.js';
let client, user=null, syncing=false, syncInterval, conflict=null, message='', suppress=false;
let onChange=()=>{}, signedIn=false, verifiedAdmin=false;
export const canManageData=()=>verifiedAdmin;
async function refreshAdmin(){
 const id=user?.id;
 const allowed=await verifyAdmin(client,id);
 if(user?.id!==id)return false;
 verifiedAdmin=allowed;emit();return allowed;
}
export async function requireAdmin(){
 if(!await refreshAdmin()){onChange();throw Error('Import and backup are available only to the administrator.');}
}
export async function fetchStudentProgress({search='',offset=0,limit=25}={}){
 await requireAdmin();
 const owner=user?.id;
 const {data,error}=await client.rpc('admin_student_progress',{p_search:search,p_offset:offset,p_limit:limit});
 if(error)throw Error(error.code==='42501'?'Administrator access required.':'Could not load students. Please try again.');
 if(user?.id!==owner||!verifiedAdmin)throw Error('Administrator access required.');
 if(!data||!Array.isArray(data.students)||!Number.isInteger(data.total)||data.total<0)throw Error('Invalid student progress response.');
 return {...data,students:data.students.map(student=>{
  try{validStats(student.stats);return student;}
  catch{return {...student,stats:{},progressUnavailable:true};}
 })};
}
const clone=x=>structuredClone(x);
export const accountsEnabled=()=>!!(accountConfig.enabled&&accountConfig.url&&accountConfig.publishableKey);
const emit=()=>document.dispatchEvent(new Event('account-status'));
const status=text=>{message=text;emit();};

async function loadSDK(){
 // Official browser SDK handles sessions, URL callbacks and token refresh.
 if(!window.supabase)await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0';
  script.onload=resolve;script.onerror=()=>reject(Error('Could not load sign-in. Check your connection.'));
  document.head.append(script);
 });
 return window.supabase.createClient(accountConfig.url,accountConfig.publishableKey);
}
export async function initAccounts(changed){
 onChange=changed;
 const link=document.createElement('a');link.href='#signin';link.id='account-link';link.textContent='Sign in';
 document.querySelector('nav').append(link);
 const signup=document.createElement('a');signup.href='#signup';signup.id='signup-link';signup.textContent='Sign up';document.querySelector('nav').append(signup);
 if(!accountsEnabled())return;
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
  if(!user||suppress||sameProgress(get().stats,get().cloud?.base||{}))return;
  if(!syncing&&!conflict)status('Saved on this device. Auto-sync runs every 30 seconds.');
 });
 // Answers stay durable in localStorage until the next batch. Login also
 // reconciles the cached snapshot, including pending work from a closed tab.
 clearInterval(syncInterval);
 syncInterval=setInterval(()=>{
  if(user&&!conflict&&!sameProgress(get().stats,get().cloud?.base||{}))sync();
 },30000);
}
async function activate(next){
 if((next?.id||null)===(user?.id||null)){const before=verifiedAdmin;await refreshAdmin();if(before!==verifiedAdmin)onChange();return;}
 suppress=true;user=next;verifiedAdmin=false;conflict=null;
 switchProfile(user?.id);signedIn=!!user;suppress=false;
 await refreshAdmin();
 onChange();status(user?'Syncing progress…':'Signed out. Your guest progress is available.');
 if(user)await sync();
}
export const sync=createSyncQueue(syncOnce);
async function syncOnce(){
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
  save();suppress=false;onChange(false);
  if(!sameProgress(state.stats,state.cloud.base))status('Saved on this device. Auto-sync runs every 30 seconds.');
  else status('Progress saved to your account.');
 }catch(e){if(user?.id===owner)status('Progress is saved on this device. Cloud sync will retry every 30 seconds.');}
 finally{syncing=false;suppress=false;}
}
const guestButton='<button id="continue-guest" class="secondary">Continue as guest</button><p><small>Guest progress is saved only in this browser, not to an account.</small></p>';
function wireGuest(app){app.querySelector('#continue-guest')?.addEventListener('click',()=>{alert('Guest mode: your progress is saved only in this browser. It will not sync across devices and may be lost if browser data is cleared. Sign in to save progress to an account.');location.hash='home';});}
export function accountView(app,esc){
 const signingUp=location.hash==='#signup';
 if(!accountsEnabled()){
  app.innerHTML=`<h1>${signingUp?'Sign up':'Sign in'}</h1><div class="panel"><p>Account sign-in is being set up. You can study as a guest now.</p>${guestButton}</div>`;wireGuest(app);return;
 }
 if(user){
  app.innerHTML=`<p class="eyebrow">Your study account</p><h1>Your progress, wherever you study.</h1><section class="panel"><p>${esc(user.email)}</p><p id="account-status" role="status">${esc(message)}</p><div class="actions"><button id="sync-now">Sync now</button><button id="sign-out" class="secondary">Sign out</button></div><div id="sync-conflict" ${conflict?'':'hidden'}><p>Both copies are kept on this device before resolving a conflict.</p><div class="actions"><button id="use-cloud">Use cloud progress</button><button id="use-device" class="secondary">Use this device’s progress</button></div></div><details><summary>Bring your guest progress into this account</summary><p>This replaces this account’s current progress with the guest progress saved in this browser. A local recovery copy is kept.</p><button id="copy-guest" class="secondary">Copy guest progress</button></details><p><small>Word and grammar statistics and flags sync. Imported books, settings and unfinished sessions stay on each device. Import and backup tools are available to the administrator. Your administrator can view your synced study progress.</small></p></section>`;
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
  app.innerHTML=`<p class="eyebrow">Your study account</p><h1>${signingUp?'Create your study account.':'Welcome back.'}</h1><div class="actions"><a class="button" href="#signin">Sign in</a><a class="button" href="#signup">Sign up</a></div><div class="panel">${accountConfig.emailLimited?'<p class="banner">Email sign-in is currently limited to project team members while email delivery is being set up. Everyone can continue as a guest.</p>':''}<p>Sign in with an email link to save your progress across devices. You can also keep studying as a guest.</p><p><small>Your administrator can view your synced study progress.</small></p><form id="sign-in"><label>Email<input type="email" id="account-email" autocomplete="email" required></label><button ${client?'':'disabled'}>Email me a sign-in link</button></form><p id="account-status" role="status">${esc(message)}</p>${guestButton}</div>`;
  wireGuest(app);
  app.querySelector('#sign-in').onsubmit=async e=>{
   e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
   try{const {error}=await client.auth.signInWithOtp({email:app.querySelector('#account-email').value.trim(),options:{shouldCreateUser:signingUp,emailRedirectTo:location.origin+location.pathname}});if(error)throw error;status('Check your email for the sign-in link.');}catch(e){status(accountError(e,signingUp));}finally{button.disabled=false;}
  };
 }
}
document.addEventListener('account-status',()=>{
 const adminLink=document.querySelector('#admin-import-link');if(adminLink)adminLink.hidden=!verifiedAdmin;
 const studentsLink=document.querySelector('#admin-students-link');if(studentsLink)studentsLink.hidden=!verifiedAdmin;
 const node=document.querySelector('#account-status');if(node)node.textContent=message;
 const box=document.querySelector('#sync-conflict');if(box)box.hidden=!conflict;
 const link=document.querySelector('#account-link');if(link){link.textContent=signedIn?(conflict?'Account · sync needed':'Account'):'Sign in';link.href=signedIn?'#account':'#signin';}
 const signup=document.querySelector('#signup-link');if(signup)signup.hidden=signedIn;
});
