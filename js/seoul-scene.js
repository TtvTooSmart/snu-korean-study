// A small, dependency-free winter layer. Decorations never receive pointer input.
const pauseKey='korean-study-seoul-paused';
export const snowCount=width=>width<650?28:55;
export function stepSnowflake(flake,seconds,width,height){
 const dt=Math.min(.1,Math.max(0,Number.isFinite(seconds)?seconds:0));
 return {...flake,
  x:((flake.x+flake.drift*dt)%width+width)%width,
  y:((flake.y+flake.speed*dt+12)%(height+24))-12,
  age:flake.age+dt};
}
const tree=`<svg class="seoul-tree" viewBox="0 0 40 48" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><path fill="#c68b58" d="M17 37h6v9h-6z"/><path fill="#28564c" d="M18 6h4v4h4v5h4v5h-4v3h8v5h-5v3h8v7H3v-7h8v-3H6v-5h8v-3h-4v-5h4v-5h4z"/><path fill="#519880" d="M18 10h4v5h4v5H14v-5h4zM10 25h20v3H10zM7 34h26v3H7z"/><path fill="#d4e9f1" d="M18 9h4v3h-4zM10 20h7v3h-7zM23 28h8v3h-8zM3 37h34v3H3z"/><path fill="#ffd987" d="M18 0h4v4h4v3h-4v4h-4V7h-4V4h4zM16 17h3v3h-3zM23 23h3v3h-3zM13 30h3v3h-3z"/><path fill="#e8949c" d="M23 16h3v3h-3zM12 24h3v3h-3zM27 32h3v3h-3z"/></svg>`;
const gifts=`<svg class="seoul-gifts" viewBox="0 0 42 29" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><path fill="#a95e70" d="M2 12h21v16H2zM0 9h25v6H0z"/><path fill="#efd095" d="M10 9h5v19h-5zM5 3h6v3H8v3H4V5h1zM16 3h5v2h1v4h-4V6h-3V3z"/><path fill="#527a93" d="M24 18h16v10H24zM22 15h20v5H22z"/><path fill="#f2cc8e" d="M30 15h4v13h-4zM26 11h5v4h-3v-2h-2zM34 11h4v2h-2v2h-3v-4z"/><path fill="#dcebf4" d="M0 27h42v2H0z"/></svg>`;
let layer=null,canvas=null,context=null,button=null,frame=null,lastTime=null;
let flakes=[],width=1,height=1,motion=null,paused=false,active=false;
const colors=['#ffe2a2','#ee9ca8','#9acbdb','#b7d7b0'];
function lights(){
 const bulbs=Array.from({length:20},(_,i)=>{
  const x=(i+.5)/20,t=(x*1000%250)/250,hang=8+64*t*(1-t);
  return `<i class="seoul-light" style="--light-x:${x*100}%;--light-y:${hang}px;--light-color:${colors[i%4]};--light-delay:${-i*.37}s;--light-duration:${5+(i%4)*.6}s"></i>`;
 }).join('');
 return `<div class="seoul-lights"><svg viewBox="0 0 1000 48" preserveAspectRatio="none"><path d="M0 8Q125 40 250 8Q375 40 500 8Q625 40 750 8Q875 40 1000 8" fill="none" stroke="#5b857c" stroke-width="2"/></svg>${bulbs}</div>`;
}
function resize(){
 if(!canvas)return;
 width=Math.max(1,window.innerWidth);height=Math.max(1,window.innerHeight);
 const ratio=Math.min(2,window.devicePixelRatio||1);
 canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
 context?.setTransform(ratio,0,0,ratio,0,0);
 flakes=Array.from({length:snowCount(width)},()=>({
  x:Math.random()*width,y:Math.random()*height,age:Math.random()*6,
  speed:20+Math.random()*24,drift:-5+Math.random()*10,
  size:Math.random()<.18?3:2,opacity:.35+Math.random()*.4
 }));
}
function draw(time){
 frame=null;
 if(!active||paused||motion.matches||document.hidden||!context)return;
 const dt=lastTime===null?0:(time-lastTime)/1000;lastTime=time;
 context.clearRect(0,0,width,height);context.fillStyle='#e4f2ff';
 flakes=flakes.map(flake=>stepSnowflake(flake,dt,width,height));
 for(const flake of flakes){
  const x=Math.round(flake.x+Math.sin(flake.age)*7),y=Math.round(flake.y);
  context.globalAlpha=flake.opacity;
  context.fillRect(x,y,flake.size,flake.size);
  if(flake.size===3){context.fillRect(x-2,y+1,7,1);context.fillRect(x+1,y-2,1,7);}
 }
 context.globalAlpha=1;frame=requestAnimationFrame(draw);
}
function refresh(){
 if(!layer)return;
 const running=!paused&&!motion.matches&&!document.hidden;
 layer.classList.toggle('is-paused',!running);
 if(button){button.hidden=motion.matches;button.textContent=paused?'Resume Seoul animation':'Pause Seoul animation';button.setAttribute('aria-pressed',String(paused));}
 if(!running){if(frame!==null)cancelAnimationFrame(frame);frame=null;lastTime=null;return;}
 if(frame===null&&context){lastTime=null;frame=requestAnimationFrame(draw);}
}
function toggle(){
 paused=!paused;
 try{localStorage.setItem(pauseKey,String(paused));}catch{}
 refresh();
}
function remove(){
 if(frame!==null)cancelAnimationFrame(frame);frame=null;lastTime=null;
 window.removeEventListener('resize',resize);
 document.removeEventListener('visibilitychange',refresh);
 motion?.removeEventListener('change',refresh);
 button?.removeEventListener('click',toggle);
 layer?.remove();button?.remove();
 layer=canvas=context=button=motion=null;flakes=[];
}
export function updateSeoulScene(theme){
 active=theme==='seoul';
 if(!active){remove();return;}
 if(layer){refresh();return;}
 paused=false;try{paused=localStorage.getItem(pauseKey)==='true';}catch{}
 motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 layer=document.createElement('div');layer.className='seoul-scene';layer.setAttribute('aria-hidden','true');
 layer.innerHTML=lights()+tree+gifts;
 canvas=document.createElement('canvas');canvas.className='seoul-snow';layer.prepend(canvas);
 context=canvas.getContext('2d');document.body.append(layer);
 button=document.createElement('button');button.id='toggle-seoul';button.type='button';button.className='secondary';
 (document.querySelector('footer')||document.body).append(button);
 button.addEventListener('click',toggle);
 window.addEventListener('resize',resize,{passive:true});
 document.addEventListener('visibilitychange',refresh);
 motion.addEventListener('change',refresh);
 resize();refresh();
}
