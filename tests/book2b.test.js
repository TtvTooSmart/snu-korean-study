import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {vocabSources} from '../js/vocab-sources.js';
import {studyProgress} from '../js/progress.js';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
const book=read('2b'),old=read('3b');
const cards=book.units.flatMap(u=>u.vocab.map(v=>({...v,book:'2b',unit:u.unit})));
const oldCards=old.units.flatMap(u=>u.vocab.map(v=>({...v,book:'3b',unit:u.unit})));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('2B is available with nine original-numbered chapters and 35 complete patterns',()=>{
 validateBook(book);assert.equal(book.placeholder,false);
 assert.equal(read('books').find(b=>b.id==='2b').available,true);
 assert.equal(read('books').find(b=>b.id==='2a').available,false);
 assert.deepEqual(book.units.map(u=>u.unit),[10,11,12,13,14,15,16,17,18]);
 assert.equal(cards.length,628);
 for(const u of book.units){
  assert.equal(u.grammar.length,u.unit===17?3:4);
  for(const g of u.grammar){
   assert.deepEqual(g.questions.map(q=>q.type),['mcq','fill']);
   assert.equal(g.questions[0].choices.filter(c=>c===g.questions[0].answer).length,1);
   assert.ok(g.meaning&&g.sourceBookletPage);
  }
 }
 const ids=[...cards.map(c=>c.id),...oldCards.map(c=>c.id),...book.units.flatMap(u=>u.grammar.flatMap(g=>[g.id,...g.questions.map(q=>q.id)]))];
 assert.equal(new Set(ids).size,ids.length);
});

test('Easy uses only first-page boxes; second spreads and every workbook note are Hard',()=>{
 assert.equal(cards.filter(v=>v.difficulty==='standard').length,118);
 assert.equal(cards.filter(v=>v.difficulty==='hard').length,510);
 const workbook=[];
 for(const c of cards)for(const s of vocabSources(c)){
  if(s.sourceType==='workbook'){workbook.push(s);assert.equal(c.difficulty,'hard');}
  else assert.equal(c.difficulty,s.sourcePage===book.source.subchapterOpeningPages[s.subchapter]?'standard':'hard',`${c.ko} p${s.sourcePage}`);
 }
 assert.equal(workbook.length,160);
 for(const [review,total] of [['Review 4',20],['Review 5',19],['Review 6',17]])assert.equal(workbook.filter(s=>s.subchapter===review).length,total);
 assert.equal(cards.find(c=>c.ko==='악기').sourcePage,138);
 assert.equal(cards.find(c=>c.ko==='악기').difficulty,'hard');
 assert.equal(cards.find(c=>c.ko==='면접').sourcePage,59);
 assert.ok(cards.some(c=>c.ko==='나뭇잎이 떨어지다'&&c.sourcePage===151));
 assert.equal(book.source.subchapterOpeningPages['17-2'],140);
 const spread=cards.filter(c=>c.sources.some(s=>s.sourceType==='student-book'&&s.sourcePage===23));
 assert.ok(spread.length);assert.ok(spread.every(c=>c.difficulty==='hard'));
});

test('2B chapter decks include review words once without mixing books or difficulty',()=>{
 for(const u of book.units)for(const level of ['standard','hard']){
  const deck=levelDeck([...cards,...oldCards],{books:new Set(['2b','3b']),units:new Set([`2b:${u.unit}`]),level,includeFlaggedOutsideUnits:false});
  assert.ok(deck.length);assert.ok(deck.every(c=>c.book==='2b'&&c.difficulty===level));
 }
 for(const c of cards.filter(c=>c.sources.some(s=>s.subchapter.startsWith('Review ')))){
  for(const unit of new Set(c.sources.filter(s=>s.subchapter.startsWith('Review ')).flatMap(s=>s.units))){
   const deck=levelDeck(cards,{books:new Set(['2b']),units:new Set([`2b:${unit}`]),level:'hard'});
   assert.equal(deck.filter(v=>v.id===c.id).length,1);
  }
 }
});

test('every 2B word offers four distinct translated choices in both directions',()=>{
 for(const c of cards)for(const direction of ['ko','en']){
  const pool=cards.filter(v=>v.difficulty===c.difficulty);
  const choices=buildChoices(c,pool,direction,()=>.42);
  assert.equal(choices?.length,4,c.id);
  assert.equal(choices.filter(a=>a===(direction==='en'?c.ko:c.en)).length,1);
  for(const language of ['en','vi','zh','ru']){
   if(language!=='en')assert.ok(c.translations[language]?.trim(),`${c.id}: ${language}`);
   const view=vocabChoiceView(c,direction,choices,esc,language,[...cards,...oldCards]);
   assert.ok(!view.html.includes('Translation unavailable'),c.id);
   assert.equal((view.html.match(/type="radio"/g)||[]).length,4);
   const labels=[...view.html.matchAll(/<small>\d<\/small> ([\s\S]*?)<\/span>/g)].map(x=>x[1]);
   assert.equal(new Set(labels).size,4,`${c.id} ${direction} ${language}`);
  }
 }
});

test('2B progress bars count its own chapters and leave 3B mastery separate',()=>{
 const vocab=[...cards,...oldCards];
 const grammar=book.units.flatMap(u=>u.grammar.flatMap(g=>g.questions.map(q=>({...q,book:'2b',unit:u.unit}))));
 const stats=Object.fromEntries([...oldCards,...cards.filter(c=>c.unit===10)].map(c=>[c.id,{streak:1}]));
 const full=studyProgress(vocab,grammar,new Set(['2b']),stats);
 assert.deepEqual(full.map(p=>p.total),[70,118,510]);
 assert.deepEqual(full.map(p=>p.mastered),[0,11,45]);
 const chapterWords=level=>levelDeck(vocab,{books:new Set(['2b']),units:new Set(['2b:10']),level});
 const chapter=studyProgress([...chapterWords('standard'),...chapterWords('hard')],grammar.filter(q=>q.unit===10),new Set(['2b']),stats);
 assert.equal(chapter[0].total,8);
 assert.equal(chapter[1].percent,100);
 assert.equal(chapter[1].total,11);
 assert.equal(studyProgress(vocab,[],new Set(['3b']),stats)[1].percent,100);
});
