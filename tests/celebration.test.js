import test from 'node:test';
import assert from 'node:assert/strict';
import {nextAnswerStreak,celebrationPlan,cheerText} from '../js/streak-celebration.js';
import {catDestination,catSprite} from '../js/autumn-cat.js';
test('celebrations fire at 3, 5, 10 and every 5 thereafter',()=>{
 assert.deepEqual(Array.from({length:31},(_,i)=>i).filter(n=>celebrationPlan(n)),[3,5,10,15,20,25,30]);
 for(const n of [undefined,NaN,-1,3.5,Infinity])assert.equal(celebrationPlan(n),null);
});
test('confetti grows at each early milestone with a safe long-session cap',()=>{
 for(const compact of [false,true]){
  const counts=[3,5,10,15,20].map(n=>celebrationPlan(n,compact).count);
  assert.ok(counts.every((n,i)=>!i||n>counts[i-1]));
  assert.ok(celebrationPlan(100000,compact).count<=(compact?110:200));
 }
});
test('a miss resets the run and an old saved session starts counting safely',()=>{
 let streak;const milestones=[];
 for(const correct of [true,true,true,false,true,true,true,true,true]){
  streak=nextAnswerStreak(streak,correct);if(celebrationPlan(streak))milestones.push(streak);
 }
 assert.deepEqual(milestones,[3,3,5]);
 assert.equal(nextAnswerStreak(10,false),0);
});
test('cheering follows the selected study language',()=>{
 assert.match(cheerText(10,'en'),/10 correct/);assert.match(cheerText(10,'vi'),/10 câu/);
 assert.match(cheerText(10,'zh'),/10 题/);assert.match(cheerText(10,'ru'),/10 верных/);
});
test('cat destinations stay within phone and desktop edges',()=>{
 for(const width of [320,375,768,1440])for(const rng of [()=>0,()=>.5,()=>1]){
  const x=catDestination(width,78,rng);assert.ok(x>=8&&x+78<=width-8);
 }
 assert.ok(catSprite.includes('shape-rendering="crispEdges"'));assert.ok(!catSprite.includes('http',catSprite.indexOf('xmlns=')+45));
});
test('reduced-motion users get only the cheer text and cleanup removes it',async()=>{
 const appended=[];
 globalThis.document=Object.assign(new EventTarget(),{hidden:false,body:{append:node=>appended.push(node)},
  createElement:tag=>({tag,dataset:{},setAttribute(){},remove(){this.removed=true;},getContext(){throw Error('Reduced motion must not create a canvas');}})});
 globalThis.window={innerWidth:375,matchMedia:()=>({matches:true})};
 const {celebrateStreak,clearCelebration}=await import('../js/streak-celebration.js');
 celebrateStreak(3,'vi');assert.equal(appended.length,1);assert.equal(appended[0].tag,'div');
 assert.match(appended[0].textContent,/3 câu/);clearCelebration();assert.equal(appended[0].removed,true);
});
