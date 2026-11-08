import {upgradePreferences} from './preferences.js';
export const defaults={streak:1,min:3,max:8,direction:'ko',mode:'mcq',theme:'seoul'};
let warning='';
let profileKey='snu-study';
const memoryProfiles=new Map();
const fresh=()=>({version:1,settings:{...defaults},stats:{},imports:[],session:null});
let state;try{state=JSON.parse(localStorage.getItem('snu-study'))||fresh();}catch{state=fresh();warning='Storage is unavailable or damaged. This session works in memory; export a backup before leaving.';}
if(state.version!==1||!state.stats||!Array.isArray(state.imports))state=fresh();
state.settings={...defaults,...state.settings};
state=upgradePreferences(state);
export function get(){return state;}
export function notice(){return warning;}
export function save(){memoryProfiles.set(profileKey,structuredClone(state));try{localStorage.setItem(profileKey,JSON.stringify(state));}catch{warning='Could not save progress (storage unavailable or full). Export a backup before leaving.';if(typeof document!=='undefined')document.dispatchEvent(new Event('storage-warning'));}if(typeof document!=='undefined')document.dispatchEvent(new Event('study-saved'));}
export function record(id,correct){const s=state.stats[id]||{seen:0,missed:0,streak:0,flagged:false};s.seen++;s.missed+=!correct;s.lastResult=correct;s.streak=correct?s.streak+1:0;state.stats[id]=s;save();}
export function flag(id){state.stats[id]||={seen:0,missed:0,streak:0};state.stats[id].flagged=!state.stats[id].flagged;save();}
export function restore(data){state=data;save();}

// One-time upgrade: existing learners start new vocabulary rounds in MCQ mode.
if(!state.vocabChoiceUpgrade){state.settings.mode='mcq';if(state.session?.type==='vocab'&&!state.session.answered){state.session.options.mode='mcq';state.session.flipped=false;}state.vocabChoiceUpgrade=true;save();}

// Persist migration without changing an in-progress quiz.
save();

// Each signed-in account has a distinct cache. Signing out restores the guest shelf.
export function switchProfile(userId=null){
 save();
 const previous=state;
 profileKey=userId?`snu-study-account:${userId}`:'snu-study';
 let stored=memoryProfiles.get(profileKey);
 try{stored=stored||JSON.parse(localStorage.getItem(profileKey));}catch{}
 state=stored?.version===1&&stored.stats&&Array.isArray(stored.imports)?stored:{...fresh(),settings:{...previous.settings},imports:structuredClone(previous.imports)};
 state=upgradePreferences(state);state.vocabChoiceUpgrade=true;save();
 return state;
}
export function guestProgress(){
 try{return JSON.parse(localStorage.getItem('snu-study'))?.stats||{};}catch{return memoryProfiles.get('snu-study')?.stats||{};}
}
