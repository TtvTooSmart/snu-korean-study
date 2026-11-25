import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {studyProgress} from '../js/progress.js';
import {matches} from '../js/queue.js';
const read=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url)));
const book=read('6b');
const flatten=b=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book:b.book,unit:u.unit})));
const cards=flatten(book);
const oldCards=['1a','1b','2a','2b','3a','3b','4a','4b','5a','5b','6a'].flatMap(id=>flatten(read(id)));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('6B provides eight chapters and all 32 indexed grammar patterns with gradable keys',()=>{
 validateBook(book);
 assert.equal(book.placeholder,false);
 assert.equal(read('books').find(b=>b.id==='6b').available,true);
 assert.deepEqual(book.units.map(u=>u.unit),[9,10,11,12,13,14,15,16]);
 assert.deepEqual(book.units.map(u=>u.vocab.length),[107,124,166,99,100,161,104,110]);
 assert.equal(cards.length,971);
 const grammar=book.units.flatMap(u=>u.grammar);
 assert.equal(grammar.length,32);
 assert.deepEqual(grammar.map(g=>g.sourceBookletPage),Array.from({length:32},(_,i)=>4+Math.floor(i/2)));
 assert.deepEqual(grammar.map(g=>g.pattern),["N(이)라고는", "V-건대", "V/A-던 차에/차이다", "N만 해도", "V-자니", "V-(으)라 V-(으)라", "V-(으)ㄴ 끝에, N 끝에", "N에도 불구하고", "V/A-(으)ㄹ 성싶다", "V-노라면", "V-는 둥 마는 둥 하다", "N(이)고 N(이)고 (간에)", "V/A-(으)ㄹ 법하다", "V/A-건만, N(이)건만", "N(으)로 말미암아", "V/A-지, N이지", "V/A-(으)ㄹ 턱이 없다, N일 턱이 없다", "V/A-건 (간에)", "V-기란", "V-게끔", "V-는 양, A-(으)ㄴ 양, N인 양", "V/A-(으)ㄹ 판에/판이다", "N에 지나지 않다", "V-ㄴ/는다고 치다, A-다고 치다, N(이)라고 치다", "V-ㄴ/는다손 치더라도, A-다손 치더라도, N(이)라손 치더라도", "V/A-기로서니", "V-는 격이다, A-(으)ㄴ 격이다", "V-느니만 못하다", "V-아/어 주십사 (하다)", "V/A-아/어 봤자", "V/A-던가, N(이)던가", "V-고서는"]);

 for(const u of book.units){
  assert.equal(u.grammar.length,4);
  for(const g of u.grammar){
   assert.deepEqual(g.questions.map(q=>q.type),['mcq','fill']);
   const q=g.questions[0];assert.equal(new Set(q.choices).size,4);
   assert.equal(q.choices.filter(c=>matches(c,q.answer)).length,1,`${q.id}: exact selected answer must grade correctly`);
   assert.ok(matches(q.answer,q.answer));
   assert.ok(matches(g.questions[1].answer,g.questions[1].answer));
  }
 }
 const ids=[...cards,...oldCards,...grammar,...grammar.flatMap(g=>g.questions)].map(c=>c.id);
 assert.equal(new Set(ids).size,ids.length);
});

test('6B preserves all glossary and workbook sources with correct classification',()=>{
 assert.equal(cards.filter(c=>c.difficulty==='standard').length,292);
 assert.equal(cards.filter(c=>c.difficulty==='hard').length,679);
 const counts={'student-book':0,workbook:0},wbPages=new Set();
 const ranges=[[36,41],[64,69],[94,103],[126,129],[152,157],[180,187],[212,217],[240,245]];
 for(const card of cards)for(const s of card.sources){
  counts[s.sourceType]++;assert.ok(s.gloss.trim());
  assert.ok(s.units.every(n=>card.relatedUnits.includes(n)));
  assert.equal(card.difficulty,s.sourceType==='student-book'&&s.section==='주제 어휘'?'standard':'hard');
  if(s.sourceType==='student-book'){
   const [lo,hi]=ranges[card.unit-9];assert.ok(s.sourcePage>=lo&&s.sourcePage<=hi);
   assert.equal(s.glossLanguage,'en');
  }else{
   assert.equal(s.glossLanguage,'ko');assert.match(s.gloss,/[가-힣]/);assert.equal(s.studyGloss,card.en);
   assert.ok(s.sourcePage>=14&&s.sourcePage<=171);wbPages.add(s.sourcePage);
  }
 }
 assert.deepEqual(counts,{'student-book':749,workbook:222});assert.equal(wbPages.size,88);
 assert.ok(!book.source.knownSourceGaps?.length);
 for(const [ko,p] of [['배를 곯다',99],['설움',100],['획',103],['뾰쪽한 생각',100],['솜방망이 처벌',153],['옮다',87]])assert.ok(cards.some(c=>c.ko===ko&&c.sourcePage===p));
 for(const ko of ['공공의 이익을 우선시하다','공익을 우선시하다']){
  const c=cards.find(c=>c.ko===ko);assert.equal(c.difficulty,'standard');
  assert.equal(c.sources[0].sourceHeadword,'공공의 이익/공익을 우선시하다');
  assert.equal(c.sources[0].sourceGloss,'to prioritize public interest');
 }
 for(const ko of ['가상 융합 세계','메타버스'])assert.equal(cards.find(c=>c.ko===ko).sources[0].sourceHeadword,'가상 융합 세계/메타버스');
 const sourceTypo=cards.find(c=>c.ko==='이산가족 상봉');
 assert.equal(sourceTypo.sources[0].gloss,'seperated family reunion');assert.equal(sourceTypo.en,'reunion of separated families');
 assert.equal(cards.find(c=>c.ko==='뇌 질환').en,'brain disorder');
});

test('6B review notes belong to both covered units and preserve progress isolation',()=>{
 for(const [review,scope,n] of [[5,[9,10],16],[6,[11,12],25],[7,[13,14],8],[8,[15,16],7]]){
  const shared=cards.filter(c=>c.sources.some(s=>s.subchapter===`Review ${review}`));assert.equal(shared.length,n);
  for(const c of shared){assert.equal(c.unit,scope[1]);assert.deepEqual(c.relatedUnits,scope);}
  for(const unit of scope){
   const deck=levelDeck([...oldCards,...cards],{books:new Set(['6b']),units:new Set([`6b:${unit}`]),level:'hard'});
   assert.ok(shared.every(c=>deck.some(d=>d.id===c.id)));
   assert.ok(deck.every(c=>c.book==='6b'&&c.relatedUnits.includes(unit)));
  }
  const outside=levelDeck(cards,{books:new Set(['6b']),units:new Set([`6b:${review===5?11:9}`]),level:'hard'});
  assert.ok(shared.every(c=>!outside.some(d=>d.id===c.id)));
 }
 const stats=Object.fromEntries(oldCards.map(c=>[c.id,{streak:3}]));
 const progress=studyProgress([...oldCards,...cards],[],new Set(['6b']),stats);
 assert.deepEqual(progress.map(p=>p.total),[0,292,679]);assert.ok(progress.every(p=>p.mastered===0));
});

test('every 6B card has four distinct choices in both directions and explicit language fallback',()=>{
 for(const card of cards)for(const direction of ['ko','en']){
  const choices=buildChoices(card,[...oldCards,...cards],direction,()=>.42);
  assert.equal(choices?.length,4,card.id);assert.equal(new Set(choices).size,4,card.id);
  assert.equal(choices.filter(c=>c===(direction==='ko'?card.en:card.ko)).length,1);
  for(const language of ['en','vi','zh','ru']){
   const view=vocabChoiceView(card,direction,choices,esc,language,[...oldCards,...cards]);
   assert.equal((view.html.match(/type="radio"/g)||[]).length,4);
   const labels=[...view.html.matchAll(/<small>\d<\/small> ([\s\S]*?)<\/span>/g)].map(m=>m[1]);
   assert.equal(new Set(labels).size,4,`${card.id} ${direction} ${language}`);
   assert.equal(view.html.includes('Translation unavailable'),language!=='en');
  }
 }
});
