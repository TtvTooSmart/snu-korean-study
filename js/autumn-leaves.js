import {FallingLeaves} from './vendor/falling-leaves/index.js';

let effect=null,theme='',paused=false,initialized=false,motion;
function refresh(){
 const button=document.querySelector('#toggle-leaves');
 if(button){button.hidden=theme!=='autumn'||motion.matches;button.textContent=paused?'Resume leaves':'Pause leaves';}
 const enabled=theme==='autumn'&&!paused&&!motion.matches&&!document.hidden;
 if(!enabled){effect?.destroy();effect=null;return;}
 if(!effect)effect=new FallingLeaves({
  count:window.innerWidth<650?10:20,size:[18,32],speed:[0.5,1.15],
  wind:[-0.15,0.5],sway:[0.4,1],shapes:['maple','ginkgo','oak'],
  opacity:0.58,zIndex:0,respectReducedMotion:true
 });
}
export function updateAutumnLeaves(value){
 theme=value;
 if(!initialized){
  initialized=true;motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  try{paused=localStorage.getItem('snu-leaves-paused')==='true';}catch{}
  motion.addEventListener('change',refresh);
  document.addEventListener('visibilitychange',refresh);
  document.querySelector('#toggle-leaves')?.addEventListener('click',()=>{
   paused=!paused;try{localStorage.setItem('snu-leaves-paused',String(paused));}catch{}refresh();
  });
 }
 refresh();
}
