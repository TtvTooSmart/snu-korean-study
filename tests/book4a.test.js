import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {studyProgress} from '../js/progress.js';

const read=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url)));
const book=read('4a');
const flatten=b=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book:b.book,unit:u.unit})));
const cards=flatten(book);
const oldCards=['1a','2b','3b','4b','5b'].flatMap(id=>flatten(read(id)));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('4A activates nine chapters and all 36 indexed grammar patterns',()=>{
  validateBook(book);
  assert.equal(book.placeholder,false);
  assert.equal(read('books').find(b=>b.id==='4a').available,true);
  assert.deepEqual(book.units.map(u=>u.unit),[1,2,3,4,5,6,7,8,9]);
  assert.equal(cards.length,790);
  const grammar=book.units.flatMap(u=>u.grammar);
  assert.equal(grammar.length,36);
  assert.deepEqual(grammar.map(g=>g.sourceBookletPage),[4,5,6,7,8,9,10,11,12,13,14,15,17,19,20,21,22,23,24,25,26,27,28,29,30,32,33,34,35,37,38,39,40,41,42,43]);
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

test('4A preserves 792 source occurrences and first-page-only Standard classification',()=>{
  const openings=[24,30,40,46,56,62,72,78,88,94,104,110,120,126,136,142,152,158];
  assert.equal(cards.filter(c=>c.difficulty==='standard').length,238);
  assert.equal(cards.filter(c=>c.difficulty==='hard').length,552);
  assert.deepEqual([...new Set(cards.filter(c=>c.difficulty==='standard').map(c=>c.sourcePage))],openings);
  const counts={'student-book':0,workbook:0};
  for(const card of cards)for(const source of card.sources){
    counts[source.sourceType]++;
    assert.ok(source.gloss.trim());
    assert.equal(card.difficulty,source.sourceType==='student-book'&&openings.includes(source.sourcePage)?'standard':'hard',`${card.ko} p${source.sourcePage}`);
    assert.ok(source.units.every(n=>card.relatedUnits.includes(n)));
  }
  assert.deepEqual(counts,{'student-book':601,workbook:191});
  const fraction=cards.find(c=>c.ko==='삼분의 일');
  assert.equal(fraction.sources[0].sourceHeadword,'1/3');
  assert.ok(cards.some(c=>c.ko==='기술품'&&c.sourceType==='workbook'&&c.sourcePage===81));
  const consumption=cards.find(c=>c.ko==='소비');
  assert.equal(consumption.en,'consumption');
  assert.equal(consumption.sources[0].gloss,'consume');
});

test('4A merges matching meanings and exposes every review word to all its units',()=>{
  for(const [ko,wbPage] of [['책임지다',15],['이끌다',22]]){
    const matches=cards.filter(c=>c.unit===1&&c.difficulty==='hard'&&c.ko===ko);
    assert.equal(matches.length,1);
    assert.deepEqual(matches[0].sources.map(s=>[s.sourceType,s.sourcePage]),[['student-book',32],['workbook',wbPage]]);
  }
  for(const [review,scope] of [[1,[1,2,3]],[2,[4,5,6]],[3,[7,8,9]]]){
    const shared=cards.filter(c=>c.sources.some(s=>s.subchapter===`Review ${review}`));
    assert.ok(shared.length);
    for(const c of shared)assert.deepEqual(c.relatedUnits,scope);
    for(const unit of scope){
      const deck=levelDeck([...oldCards,...cards],{books:new Set(['4a']),units:new Set([`4a:${unit}`]),level:'hard'});
      assert.ok(shared.every(c=>deck.some(d=>d.id===c.id)));
      assert.ok(deck.every(c=>c.book==='4a'&&c.relatedUnits.includes(unit)));
    }
    const outside=levelDeck(cards,{books:new Set(['4a']),units:new Set([`4a:${review===1?4:1}`]),level:'hard'});
    assert.ok(shared.every(c=>!outside.some(d=>d.id===c.id)));
  }
  const stats=Object.fromEntries(oldCards.map(c=>[c.id,{streak:3}]));
  const progress=studyProgress([...oldCards,...cards],[],new Set(['4a']),stats);
  assert.deepEqual(progress.map(p=>p.total),[0,238,552]);
  assert.ok(progress.every(p=>p.mastered===0));
});

test('every 4A card has four distinct choices in both directions and explicit language fallback',()=>{
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
