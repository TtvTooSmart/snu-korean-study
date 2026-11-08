export const defaults={streak:1,min:3,max:8,direction:'ko',mode:'self',theme:'auto'};
let warning='';
const fresh=()=>({version:1,settings:{...defaults},stats:{},imports:[],session:null});
let state;try{state=JSON.parse(localStorage.getItem('snu-study'))||fresh();}catch{state=fresh();warning='Storage is unavailable or damaged. This session works in memory; export a backup before leaving.';}
if(state.version!==1||!state.stats||!Array.isArray(state.imports))state=fresh();
state.settings={...defaults,...state.settings};
export function get(){return state;}
export function notice(){return warning;}
export function save(){try{localStorage.setItem('snu-study',JSON.stringify(state));}catch{warning='Could not save progress (storage unavailable or full). Export a backup before leaving.';document.dispatchEvent(new Event('storage-warning'));}}
export function record(id,correct){const s=state.stats[id]||{seen:0,missed:0,streak:0,flagged:false};s.seen++;s.missed+=!correct;s.lastResult=correct;s.streak=correct?s.streak+1:0;state.stats[id]=s;save();}
export function flag(id){state.stats[id]||={seen:0,missed:0,streak:0};state.stats[id].flagged=!state.stats[id].flagged;save();}
export function restore(data){state=data;save();}
