// Session streaks are separate from the per-card mastery streak.
export function nextAnswerStreak(previous,correct){
 return correct ? (Number.isSafeInteger(previous)&&previous>=0?previous:0)+1 : 0;
}
export function celebrationPlan(streak,compact=false){
 if(!Number.isSafeInteger(streak)||!(streak===3||streak===5||streak>=10&&streak%5===0))return null;
 // Increasing bursts, capped to keep long rounds comfortable on phones.
 return {count:Math.min(compact?110:200,Math.round((28+streak*8)*(compact?.65:1))),duration:Math.min(3300,1800+streak*60)};
}
export function cheerText(streak,language='en'){
 const tier=streak>=20?3:streak>=10?2:streak>=5?1:0;
 const words={en:['Nice!','Great work!','Amazing!','Unstoppable!'],vi:['Giỏi lắm!','Tuyệt lắm!','Xuất sắc!','Không thể ngăn cản!'],zh:['不错！','太棒了！','真厉害！','势不可挡！'],ru:['Здорово!','Отличная работа!','Потрясающе!','Не остановить!']};
 const title=(words[language]||words.en)[tier];
 return {en:`${title} ${streak} correct in a row`,vi:`${title} Đúng ${streak} câu liên tiếp`,zh:`${title} 连续答对 ${streak} 题`,ru:`${title} ${streak} верных ответов подряд`}[language]||`${title} ${streak} correct in a row`;
}
let canvas,toast,frame,timer,listening=false;
export function clearCelebration(){
 if(frame!=null)cancelAnimationFrame(frame);clearTimeout(timer);
 frame=null;canvas?.remove();toast?.remove();canvas=null;toast=null;
}
export function celebrateStreak(streak,language='en'){
 const plan=celebrationPlan(streak,window.innerWidth<650);
 if(!plan||document.hidden)return;
 clearCelebration();
 if(!listening){document.addEventListener('visibilitychange',()=>{if(document.hidden)clearCelebration();});listening=true;}
 toast=document.createElement('div');toast.className='streak-cheer';toast.dataset.vocabLocalized='';
 toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.textContent=cheerText(streak,language);document.body.append(toast);
 timer=setTimeout(clearCelebration,plan.duration+500);
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(motion.matches)return; // Text-only cheering; no motion or sound.
 canvas=document.createElement('canvas');canvas.className='streak-confetti';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();canvas=null;return;}
 const width=window.innerWidth,height=window.innerHeight,scale=Math.min(window.devicePixelRatio||1,2);
 canvas.width=width*scale;canvas.height=height*scale;ctx.scale(scale,scale);
 const colors=document.documentElement.dataset.theme==='autumn'?['#d87936','#eeb955','#9e4f37','#a8b75d','#f4dec0']:['#88c5a2','#e9bb67','#7fa7e8','#e88fae','#b4a0e8'];
 const particles=Array.from({length:plan.count},()=>({x:Math.random()*width,y:-30-Math.random()*height*.4,vx:(Math.random()-.5)*150,vy:85+Math.random()*170,size:4+Math.random()*5,angle:Math.random()*Math.PI,spin:(Math.random()-.5)*8,color:colors[Math.floor(Math.random()*colors.length)]}));
 let started,last;
 function draw(time){
  if(!canvas||document.hidden||motion.matches){clearCelebration();return;}
  started??=time;last??=time;const dt=Math.min((time-last)/1000,.05),elapsed=time-started;last=time;
  ctx.clearRect(0,0,width,height);ctx.globalAlpha=Math.min(1,Math.max(0,(plan.duration-elapsed)/650));
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=35*dt;p.angle+=p.spin*dt;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.55);ctx.restore();}
  if(elapsed<plan.duration)frame=requestAnimationFrame(draw);else{canvas.remove();canvas=null;frame=null;}
 }
 frame=requestAnimationFrame(draw);
}
