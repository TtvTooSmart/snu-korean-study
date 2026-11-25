import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {studyProgress} from '../js/progress.js';

const read=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url)));
const book=read('2a');
const flatten=b=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book:b.book,unit:u.unit})));
const cards=flatten(book);
const oldCards=['1a','1b','2b','3a','3b','4a','4b','5a','5b'].flatMap(id=>flatten(read(id)));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('2A activates nine chapters and all 36 indexed grammar patterns',()=>{
  validateBook(book);
  assert.equal(book.placeholder,false);
  assert.equal(read('books').find(b=>b.id==='2a').available,true);
  assert.deepEqual(book.units.map(u=>u.unit),[1,2,3,4,5,6,7,8,9]);
  assert.equal(cards.length,574);
  const grammar=book.units.flatMap(u=>u.grammar);
  assert.equal(grammar.length,36);
  assert.deepEqual(grammar.map(g=>g.sourceBookletPage),[4,5,6,7,8,9,10,11,12,13,15,16,17,19,20,21,22,24,25,26,27,28,29,30,31,32,33,35,36,37,38,39,40,41,42,43]);
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

test('2A preserves 579 source occurrences and first-page-only Standard classification',()=>{
  const openings=[22,28,38,44,54,60,70,76,86,92,102,108,118,124,134,140,150,156];
  assert.equal(cards.filter(c=>c.difficulty==='standard').length,122);
  assert.equal(cards.filter(c=>c.difficulty==='hard').length,452);
  assert.deepEqual([...new Set(cards.filter(c=>c.difficulty==='standard').map(c=>c.sourcePage))],openings);
  const counts={'student-book':0,workbook:0};
  for(const card of cards)for(const source of card.sources){
    counts[source.sourceType]++;
    assert.ok(source.gloss.trim());
    assert.equal(card.difficulty,source.sourceType==='student-book'&&openings.includes(source.sourcePage)?'standard':'hard',`${card.ko} p${source.sourcePage}`);
    assert.ok(source.units.every(n=>card.relatedUnits.includes(n)));
  }
  assert.deepEqual(counts,{'student-book':414,workbook:165});
  const splitSources=cards.flatMap(c=>c.sources).filter(s=>s.sourceGloss);
  assert.equal(splitSources.length,30);
  assert.ok(splitSources.every(s=>s.sourceHeadword.includes('/')));
  const clinic=cards.find(c=>c.ko==='피부과');
  assert.equal(clinic.en,'dermatology/skin clinic');
  assert.equal(clinic.sources[0].gloss,'dermatologist');
  assert.ok(cards.some(c=>c.ko==='가격이 싸다'&&c.difficulty==='standard'));
  assert.ok(cards.some(c=>c.ko==='가격이 비싸다'&&c.difficulty==='standard'));
  assert.ok(!cards.some(c=>c.ko==='시간'&&c.sourcePage===135)); // glossary refers to running text

});

test('2A merges matching meanings and exposes every review word to all its units',()=>{
  for(const [ko,unit,sbPage,wbPage] of [['시간이 나다',2,40,29],['홈페이지',2,47,34],['이제',6,105,100],['자꾸',9,152,159],['피가 나다',9,154,162]]){
    const matches=cards.filter(c=>c.unit===unit&&c.difficulty==='hard'&&c.ko===ko);
    assert.equal(matches.length,1);
    assert.deepEqual(matches[0].sources.map(s=>[s.sourceType,s.sourcePage]),[['student-book',sbPage],['workbook',wbPage]]);
  }
  for(const [review,scope] of [[1,[1,2,3]],[2,[4,5,6]],[3,[7,8,9]]]){
    const shared=cards.filter(c=>c.sources.some(s=>s.subchapter===`Review ${review}`));
    assert.ok(shared.length);
    for(const c of shared)assert.deepEqual(c.relatedUnits,scope);
    for(const unit of scope){
      const deck=levelDeck([...oldCards,...cards],{books:new Set(['2a']),units:new Set([`2a:${unit}`]),level:'hard'});
      assert.ok(shared.every(c=>deck.some(d=>d.id===c.id)));
      assert.ok(deck.every(c=>c.book==='2a'&&c.relatedUnits.includes(unit)));
    }
    const outside=levelDeck(cards,{books:new Set(['2a']),units:new Set([`2a:${review===1?4:1}`]),level:'hard'});
    assert.ok(shared.every(c=>!outside.some(d=>d.id===c.id)));
  }
  const stats=Object.fromEntries(oldCards.map(c=>[c.id,{streak:3}]));
  const progress=studyProgress([...oldCards,...cards],[],new Set(['2a']),stats);
  assert.deepEqual(progress.map(p=>p.total),[0,122,452]);
  assert.ok(progress.every(p=>p.mastered===0));
});

test('every 2A card has four distinct choices in both directions and explicit language fallback',()=>{
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
