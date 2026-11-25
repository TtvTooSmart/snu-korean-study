import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {studyProgress} from '../js/progress.js';

const read=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url)));
const book=read('1a');
const flatten=b=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book:b.book,unit:u.unit})));
const cards=flatten(book);
const oldCards=['2b','3b','4b','5b'].flatMap(id=>flatten(read(id)));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('1A activates eight chapters and all 32 indexed grammar patterns',()=>{
  validateBook(book);
  assert.equal(book.placeholder,false);
  assert.equal(read('books').find(b=>b.id==='1a').available,true);
  assert.equal(read('books').find(b=>b.id==='1b').available,false);
  assert.deepEqual(book.units.map(u=>u.unit),[1,2,3,4,5,6,7,8]);
  assert.equal(cards.length,447);
  const grammar=book.units.flatMap(u=>u.grammar);
  assert.equal(grammar.length,32);
  assert.deepEqual(grammar.map(g=>g.sourceBookletPage),Array.from({length:32},(_,i)=>i+4));
  for(const u of book.units){
    assert.equal(u.grammar.length,4);
    for(const g of u.grammar){
      assert.deepEqual(g.questions.map(q=>q.type),['mcq','fill']);
      assert.equal(new Set(g.questions[0].choices).size,4);
      assert.equal(g.questions[0].choices.filter(c=>c===g.questions[0].answer).length,1);
    }
  }
  const ids=[...cards,...oldCards,...grammar,...grammar.flatMap(g=>g.questions)].map(c=>c.id);
  assert.equal(new Set(ids).size,ids.length);
});

test('1A preserves 500 source occurrences and the first-page-only Standard rule',()=>{
  const openings=[22,28,38,44,54,60,70,76,86,92,102,108,118,124,134,140];
  assert.equal(cards.filter(c=>c.difficulty==='standard').length,124);
  assert.equal(cards.filter(c=>c.difficulty==='hard').length,323);
  assert.deepEqual([...new Set(cards.filter(c=>c.difficulty==='standard').map(c=>c.sourcePage))],openings);
  const counts={'student-book':0,workbook:0};
  for(const card of cards)for(const source of card.sources){
    counts[source.sourceType]++;
    assert.ok(source.gloss.trim());
    assert.deepEqual(source.units,[card.unit]);
    assert.equal(card.difficulty,source.sourceType==='student-book'&&openings.includes(source.sourcePage)?'standard':'hard',`${card.ko} p${source.sourcePage}`);
  }
  assert.deepEqual(counts,{'student-book':368,workbook:132});
  for(const page of [23,29,39,45,55,61,71,77,87,103,109,119,125,135,141]){
    assert.ok(cards.some(c=>c.sources.some(s=>s.sourceType==='student-book'&&s.sourcePage===page)));
  }
  assert.ok(cards.some(c=>c.ko==='한국어로'&&c.sources.some(s=>s.sourcePage===42)));
  assert.ok(cards.some(c=>c.ko==='중국어로'&&c.sources.some(s=>s.sourcePage===42)));
});

test('1A merges matching meanings but preserves chapter and sense boundaries',()=>{
  const noraebang=cards.filter(c=>c.unit===6&&c.ko==='노래방');
  assert.equal(noraebang.length,1);
  assert.deepEqual(noraebang[0].sources.map(s=>[s.sourceType,s.sourcePage]),[['student-book',106],['workbook',123]]);
  assert.deepEqual(cards.filter(c=>c.unit===6&&c.ko==='점심').map(c=>c.en),['afternoon','lunch']);
  assert.ok(cards.some(c=>c.unit===2&&c.ko==='우리'&&c.en==='our'));
  assert.ok(cards.some(c=>c.unit===4&&c.ko==='우리'&&c.en==='we'));
  for(const unit of book.units)for(const level of ['standard','hard']){
    const deck=levelDeck([...oldCards,...cards],{books:new Set(['1a']),units:new Set([`1a:${unit.unit}`]),level});
    assert.ok(deck.length);
    assert.ok(deck.every(c=>c.book==='1a'&&c.unit===unit.unit&&c.difficulty===level));
  }
  const stats=Object.fromEntries(oldCards.map(c=>[c.id,{streak:3}]));
  const progress=studyProgress([...oldCards,...cards],[],new Set(['1a']),stats);
  assert.deepEqual(progress.map(p=>p.total),[0,124,323]);
  assert.ok(progress.every(p=>p.mastered===0));
});

test('every 1A card has four distinct choices in both directions and honest language fallback',()=>{
  for(const card of cards)for(const direction of ['ko','en']){
    const choices=buildChoices(card,[...oldCards,...cards],direction,()=>.42);
    assert.equal(choices?.length,4,card.id);
    assert.equal(new Set(choices).size,4,card.id);
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
