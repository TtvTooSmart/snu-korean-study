import test from 'node:test';
import assert from 'node:assert/strict';
import {snowCount,stepSnowflake} from '../js/seoul-scene.js';

test('snow is bounded for small and large screens',()=>{
 for(const width of [320,375,649])assert.equal(snowCount(width),28);
 for(const width of [650,1440,10000])assert.equal(snowCount(width),55);
});
test('snow travel is frame-rate independent without mutating the input',()=>{
 const original={x:100,y:100,age:0,speed:24,drift:-6,size:2,opacity:.5};
 const advance=fps=>Array.from({length:fps}).reduce(f=>stepSnowflake(f,1/fps,1000,800),original);
 const slow=advance(30),fast=advance(60);
 for(const key of ['x','y','age'])assert.ok(Math.abs(slow[key]-fast[key])<1e-8,key);
 assert.ok(Math.abs(fast.y-124)<1e-8);assert.ok(Math.abs(fast.x-94)<1e-8);
 assert.equal(original.x,100);assert.equal(original.y,100);
});
test('snow wraps at the edges and a suspended frame cannot jump across the scene',()=>{
 const f={x:1,y:810,age:0,speed:40,drift:-20,size:3,opacity:.7};
 const next=stepSnowflake(f,60,1000,800);
 assert.ok(next.x>=0&&next.x<1000);assert.ok(next.y>=-12&&next.y<812);
 assert.equal(next.age,.1);assert.equal(next.y,-10);
 assert.deepEqual(stepSnowflake(f,-1,1000,800),f);
});

test('Seoul pauses, resumes and cleans up without duplicate animation loops',async()=>{
 const {updateSeoulScene}=await import('../js/seoul-scene.js');
 const globals=['document','window','localStorage','requestAnimationFrame','cancelAnimationFrame'];
 const before=new Map(globals.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 class Node extends EventTarget{
  constructor(tag){super();this.tag=tag;this.children=[];this.attributes={};this.classList={toggle:(name,value)=>{this[name]=value;}};}
  append(node){this.children.push(node);node.parent=this;}
  prepend(node){this.children.unshift(node);node.parent=this;}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.removed=true;}
  setAttribute(key,value){this.attributes[key]=value;}
  getContext(){return {setTransform(){},clearRect(){},fillRect(){}};}
 }
 const body=new Node('body'),footer=new Node('footer');
 const motion=Object.assign(new EventTarget(),{matches:false});
 const frames=new Map(),values=new Map();let nextFrame=0;
 globalThis.document=Object.assign(new EventTarget(),{body,hidden:false,querySelector:selector=>selector==='footer'?footer:null,createElement:tag=>new Node(tag)});
 globalThis.window=Object.assign(new EventTarget(),{innerWidth:375,innerHeight:812,devicePixelRatio:3,matchMedia:()=>motion});
 globalThis.localStorage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 globalThis.requestAnimationFrame=callback=>{frames.set(++nextFrame,callback);return nextFrame;};
 globalThis.cancelAnimationFrame=id=>frames.delete(id);
 try{
  updateSeoulScene('seoul');updateSeoulScene('seoul');
  assert.equal(body.children.length,1);assert.equal(footer.children.length,1);assert.equal(frames.size,1);
  const scene=body.children[0],button=footer.children[0],canvas=scene.children[0];
  assert.equal(scene.attributes['aria-hidden'],'true');assert.equal(canvas.width,750);
  button.dispatchEvent(new Event('click'));
  assert.equal(frames.size,0);assert.equal(scene['is-paused'],true);
  assert.equal(values.get('korean-study-seoul-paused'),'true');
  button.dispatchEvent(new Event('click'));assert.equal(frames.size,1);
  document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(frames.size,0);
  document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));assert.equal(frames.size,1);
  motion.matches=true;motion.dispatchEvent(new Event('change'));
  assert.equal(frames.size,0);assert.equal(button.hidden,true);assert.equal(scene['is-paused'],true);
  updateSeoulScene('autumn');
  assert.equal(body.children.length,0);assert.equal(footer.children.length,0);assert.equal(frames.size,0);
  motion.matches=false;motion.dispatchEvent(new Event('change'));document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(frames.size,0);
 }finally{
  updateSeoulScene('green');
  for(const key of globals){const descriptor=before.get(key);if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
 }
});
