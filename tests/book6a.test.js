import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {studyProgress} from '../js/progress.js';
import {matches} from '../js/queue.js';
const read=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url)));
const book=read('6a');
const flatten=b=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book:b.book,unit:u.unit})));
const cards=flatten(book);
const oldCards=['1a','1b','2a','2b','3a','3b','4a','4b','5a','5b'].flatMap(id=>flatten(read(id)));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('6A provides eight chapters and all 32 indexed grammar patterns with gradable keys',()=>{
 validateBook(book);
 assert.equal(book.placeholder,false);
 assert.equal(read('books').find(b=>b.id==='6a').available,true);
 assert.deepEqual(book.units.map(u=>u.unit),[1,2,3,4,5,6,7,8]);
 assert.deepEqual(book.units.map(u=>u.vocab.length),[167,166,123,127,153,157,97,175]);
 assert.equal(cards.length,1165);
 const grammar=book.units.flatMap(u=>u.grammar);
 assert.equal(grammar.length,32);
 assert.deepEqual(grammar.map(g=>g.sourceBookletPage),Array.from({length:32},(_,i)=>4+Math.floor(i/2)));
 assert.deepEqual(grammar.map(g=>g.pattern),[
 'V-는 터라, A-(으)ㄴ 터라, N인 터라','A-기 짝이 없다','V-는답시고, A-답시고, N(이)랍시고','V/A-(으)려니 하다, N(이)려니 하다',
 'N와/과 맞먹다','V-자','N은/는 물론이거니와','N(이)라면',
 'V-기 일쑤(이)다','V-ㄴ/는다든지 V-ㄴ/는다든지 하다, A-다든지 A-다든지 하다','N(으)로 보다','V-자면',
 'N을/를 불문하고','V-는 게 고작이다','V-기에는','V-(으)ㄴ 후에야 (비로소)',
 'N을/를 N(으)로 삼다','A-(으)면서(도)','A-기(가) 이를 데 없다','V/A-(으)리라',
 'V/A-(으)ㄹ지언정','V-는지라, A-(으)ㄴ지라, N인지라','V-는 까닭에, A-(으)ㄴ 까닭에, N인 까닭에','N에서 비롯되다',
 'N은/는 고사하고','V-(으)려다가도','V/A-(으)ㄹ지라도, N일지라도','V-느냐에 달려 있다, A-(으)냐에 달려 있다, N에 달려 있다',
 'V-는 통에, N 통에','V/A-(으)ㄹ망정','V-는 한편','V-는 한이 있어도'
 ]);
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

test('6A preserves 1165 occurrences, glossary classification and the missing source page',()=>{
 assert.equal(cards.filter(c=>c.difficulty==='standard').length,351);
 assert.equal(cards.filter(c=>c.difficulty==='hard').length,814);
 const counts={'student-book':0,workbook:0},sections={},wbPages=new Set();
 const ranges=[[40,49],[74,81],[102,108],[136,143],[168,175],[198,205],[230,235],[260,269]];
 for(const card of cards)for(const s of card.sources){
  counts[s.sourceType]++;assert.ok(s.gloss.trim());
  assert.ok(s.units.every(n=>card.relatedUnits.includes(n)));
  assert.equal(card.difficulty,s.sourceType==='student-book'&&s.section==='주제 어휘'?'standard':'hard');
  if(s.sourceType==='student-book'){
   const [lo,hi]=ranges[card.unit-1];assert.ok(s.sourcePage>=lo&&s.sourcePage<=hi);
   assert.equal(s.glossLanguage,'en');sections[s.section]=(sections[s.section]||0)+1;
  }else{
   assert.equal(s.glossLanguage,'ko');assert.match(s.gloss,/[가-힣]/);assert.equal(s.studyGloss,card.en);
   assert.ok(s.sourcePage>=14&&s.sourcePage<=173);assert.notEqual(s.sourcePage,42);wbPages.add(s.sourcePage);
  }
 }
 assert.deepEqual(counts,{'student-book':960,workbook:205});
 assert.deepEqual(sections,{'주제 어휘':351,'듣기':227,'말하기':35,'읽기':279,'쓰기':68});
 assert.equal(wbPages.size,85);
 assert.equal(book.source.knownSourceGaps[0].printedPage,42);
 for(const [ko,p] of [['꼬르륵',105],['뜰',173],['우뚝',174],['갯벌',198],['논',201],['밭',201],['째',47],['얼핏',204]])assert.ok(cards.some(c=>c.ko===ko&&c.sourcePage===p));
 const typo=cards.find(c=>c.ko==='분포되다');assert.equal(typo.sources[0].sourceHeadword,'분포내다');
 assert.ok(!cards.some(c=>c.ko==='분포내다'));
 for(const ko of ['앱을 활용하다','애플리케이션을 활용하다']){
  const c=cards.find(c=>c.ko===ko);assert.equal(c.difficulty,'standard');
  assert.equal(c.sources[0].sourceHeadword,'앱/애플리케이션을 활용하다');
  assert.equal(c.sources[0].sourceGloss,'to use an app/application');
 }
 assert.equal(cards.find(c=>c.ko==='의태어가 풍부하다').sources[0].gloss,'to be rich with memetic words');
 assert.equal(cards.find(c=>c.ko==='의태어가 풍부하다').en,'to be rich in mimetic words');
 const rough=cards.filter(c=>c.ko==='거칠다');assert.equal(rough.length,2);assert.notEqual(rough[0].en,rough[1].en);
});

test('6A review notes belong to both covered units and preserve progress isolation',()=>{
 for(const [review,scope,n] of [[1,[1,2],26],[2,[3,4],7],[3,[5,6],17],[4,[7,8],7]]){
  const shared=cards.filter(c=>c.sources.some(s=>s.subchapter===`Review ${review}`));assert.equal(shared.length,n);
  for(const c of shared){assert.equal(c.unit,scope[1]);assert.deepEqual(c.relatedUnits,scope);}
  for(const unit of scope){
   const deck=levelDeck([...oldCards,...cards],{books:new Set(['6a']),units:new Set([`6a:${unit}`]),level:'hard'});
   assert.ok(shared.every(c=>deck.some(d=>d.id===c.id)));
   assert.ok(deck.every(c=>c.book==='6a'&&c.relatedUnits.includes(unit)));
  }
  const outside=levelDeck(cards,{books:new Set(['6a']),units:new Set([`6a:${review===1?3:1}`]),level:'hard'});
  assert.ok(shared.every(c=>!outside.some(d=>d.id===c.id)));
 }
 const stats=Object.fromEntries(oldCards.map(c=>[c.id,{streak:3}]));
 const progress=studyProgress([...oldCards,...cards],[],new Set(['6a']),stats);
 assert.deepEqual(progress.map(p=>p.total),[0,351,814]);assert.ok(progress.every(p=>p.mastered===0));
});

test('every 6A card has four distinct choices in both directions and explicit language fallback',()=>{
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
