import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {studyProgress} from '../js/progress.js';

const read=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url)));
const book=read('1b');
const flatten=b=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book:b.book,unit:u.unit})));
const cards=flatten(book);
const oldCards=['1a','2b','3a','3b','4a','4b','5a','5b'].flatMap(id=>flatten(read(id)));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('1B activates eight chapters and all 32 indexed grammar patterns',()=>{
  validateBook(book);
  assert.equal(book.placeholder,false);
  assert.equal(read('books').find(b=>b.id==='1b').available,true);
  assert.deepEqual(book.units.map(u=>u.unit),[9,10,11,12,13,14,15,16]);
  assert.equal(cards.length,406);
  const grammar=book.units.flatMap(u=>u.grammar);
  assert.equal(grammar.length,32);
  assert.deepEqual(grammar.map(g=>g.sourceBookletPage),[4,5,6,7,8,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37]);
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

test('1B preserves 425 source occurrences and the first-page-only Standard rule',()=>{
  const openings=[22,28,38,44,54,60,70,76,86,92,102,108,118,124,134,140];
  assert.equal(cards.filter(c=>c.difficulty==='standard').length,107);
  assert.equal(cards.filter(c=>c.difficulty==='hard').length,299);
  assert.deepEqual([...new Set(cards.filter(c=>c.difficulty==='standard').map(c=>c.sourcePage))],openings);
  const counts={'student-book':0,workbook:0};
  for(const card of cards)for(const source of card.sources){
    counts[source.sourceType]++;
    assert.ok(source.gloss.trim());
    assert.deepEqual(source.units,[card.unit]);
    assert.equal(card.difficulty,source.sourceType==='student-book'&&openings.includes(source.sourcePage)?'standard':'hard',`${card.ko} p${source.sourcePage}`);
  }
  assert.deepEqual(counts,{'student-book':338,workbook:87});
  for(const page of [23,29,39,45,55,61,71,77,87,103,109,119,125,135,141]){
    assert.ok(cards.some(c=>c.sources.some(s=>s.sourceType==='student-book'&&s.sourcePage===page)));
  }
  const paired=cards.flatMap(c=>c.sources).filter(s=>s.sourceHeadword);
  assert.equal(paired.length,18);
  assert.ok(paired.every(s=>s.sourceHeadword.includes(' - ')));
  assert.ok(cards.some(c=>c.ko==='생신'&&c.en==='birthday (honorific)'));
  assert.ok(cards.some(c=>c.ko==='대학원'&&c.sources.some(s=>s.gloss==='grad(udate) school')));
});

test('1B merges matching meanings but preserves chapter and sense boundaries',()=>{
  const direction=cards.filter(c=>c.unit===11&&c.ko==='저쪽');
  assert.equal(direction.length,1);
  assert.deepEqual(direction[0].sources.map(s=>s.sourcePage),[56,61]);
  assert.deepEqual(cards.filter(c=>c.unit===15&&c.ko==='드시다').map(c=>c.en),['to eat (honorific)','to drink (honorific)']);
  assert.ok(cards.some(c=>c.unit===9&&c.ko==='쓰다'));
  assert.ok(cards.some(c=>c.unit===13&&c.ko==='쓰다'));
  for(const [unit,ko,pages] of [[15,'이분',[120,142]],[16,'한번',[142,165]]]){
    const matches=cards.filter(c=>c.unit===unit&&c.ko===ko&&c.difficulty==='hard');
    assert.equal(matches.length,1);
    assert.deepEqual(matches[0].sources.map(s=>s.sourcePage),pages);
  }
  assert.ok(cards.every(c=>c.sources.every(s=>!s.subchapter.startsWith('Review'))));
  for(const unit of book.units)for(const level of ['standard','hard']){
    const deck=levelDeck([...oldCards,...cards],{books:new Set(['1b']),units:new Set([`1b:${unit.unit}`]),level});
    assert.ok(deck.length);
    assert.ok(deck.every(c=>c.book==='1b'&&c.unit===unit.unit&&c.difficulty===level));
  }
  const stats=Object.fromEntries(oldCards.map(c=>[c.id,{streak:3}]));
  const progress=studyProgress([...oldCards,...cards],[],new Set(['1b']),stats);
  assert.deepEqual(progress.map(p=>p.total),[0,107,299]);
  assert.ok(progress.every(p=>p.mastered===0));
});

test('every 1B card has four distinct choices in both directions and honest language fallback',()=>{
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
