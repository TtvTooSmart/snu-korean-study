import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateBook} from '../js/data-loader.js';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
import {levelDeck} from '../js/vocab-levels.js';
import {studyProgress} from '../js/progress.js';

const read=id=>JSON.parse(fs.readFileSync(new URL(`../data/${id}.json`,import.meta.url)));
const book=read('5a');
const flatten=b=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book:b.book,unit:u.unit})));
const cards=flatten(book);
const oldCards=['1a','2b','3a','3b','4a','4b','5b'].flatMap(id=>flatten(read(id)));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('5A activates all eight chapters and the 32 indexed patterns',()=>{
  validateBook(book);
  assert.equal(book.placeholder,false);
  assert.equal(read('books').find(b=>b.id==='5a').available,true);
  assert.deepEqual(book.units.map(u=>u.unit),[1,2,3,4,5,6,7,8]);
  assert.deepEqual(book.units.map(u=>u.vocab.length),[125,102,86,93,121,138,78,111]);
  assert.equal(cards.length,854);
  const grammar=book.units.flatMap(u=>u.grammar);
  assert.equal(grammar.length,32);
  assert.deepEqual(grammar.map(g=>g.sourceBookletPage),Array.from({length:32},(_,i)=>4+Math.floor(i/2)));
  assert.deepEqual(grammar.map(g=>g.pattern),[
    'V-는 데(에)','V-(으)라면','V-되','V/A-(으)ㄹ뿐더러',
    'N이란','V-(으)ㅁ에 따라','V-(으)ㅁ으로써','N에 따르면',
    'V-는/A-(으)ㄴ/N인 데(에) 반해(서)','V-는/A-(으)ㄴ/N인 데(에) 비해(서)','N(에) 못지않게','V-고서',
    'N을/를 막론하고','V/A-(으)면 몰라도, N이면 몰라도','V-기 십상이다','V-(으)ㄹ 겸',
    'V-다시피','V-는/A-(으)ㄴ 한','V-는가 하면, A-(으)ㄴ가 하면','V/A-(으)ㄹ 따름이다, N일 따름이다',
    'V/A-지 않을까 하다, N이/가 아닐까 하다','V-고자 하다','N 같아서는','V/A-고 해서, N이고 해서',
    'V-고 보다','V/A-(으)ㄴ 나머지','V-아/어 내다','V-는다면, A-다면, N이라면',
    'N이자 N','V-는 것을 계기로, N을/를 계기로','V/A-기도 하고 V/A-기도 하다','V-는 바 있다/없다'
  ]);
  for(const u of book.units){
    assert.equal(u.grammar.length,4);
    for(const g of u.grammar){
      assert.deepEqual(g.questions.map(q=>q.type),['mcq','fill']);
      assert.equal(new Set(g.questions[0].choices).size,4);
      assert.equal(g.questions[0].choices.filter(c=>c===g.questions[0].answer).length,1);
    }
  }
  assert.equal(grammar[1].questions[0].answer,'으라면');
  assert.equal(grammar[24].questions[0].answer,'고 보니');
  const ids=[...cards,...oldCards,...grammar,...grammar.flatMap(g=>g.questions)].map(c=>c.id);
  assert.equal(new Set(ids).size,ids.length);
});

test('5A preserves all 706 glossary entries and 148 Korean-definition workbook notes',()=>{
  assert.equal(cards.filter(c=>c.difficulty==='standard').length,319);
  assert.equal(cards.filter(c=>c.difficulty==='hard').length,535);
  const counts={'student-book':0,workbook:0};
  const sections={};const wbPages=new Set();
  const ranges=[[38,44],[66,70],[94,99],[122,126],[150,156],[178,185],[206,210],[234,239]];
  for(const card of cards)for(const source of card.sources){
    counts[source.sourceType]++;
    assert.ok(source.gloss.trim());
    assert.ok(source.units.every(n=>card.relatedUnits.includes(n)));
    assert.equal(card.difficulty,source.sourceType==='student-book'&&source.section==='주제 어휘'?'standard':'hard');
    if(source.sourceType==='student-book'){
      const [lo,hi]=ranges[card.unit-1];
      assert.ok(source.sourcePage>=lo&&source.sourcePage<=hi);
      assert.equal(source.glossLanguage,'en');
      sections[source.section]=(sections[source.section]||0)+1;
    }else{
      wbPages.add(source.sourcePage);
      assert.equal(source.glossLanguage,'ko');
      assert.match(source.gloss,/[가-힣]/);
      assert.equal(source.studyGloss,card.en);
      assert.ok(source.sourcePage>=14&&source.sourcePage<=171);
    }
  }
  assert.deepEqual(counts,{'student-book':706,workbook:148});
  assert.deepEqual(sections,{'주제 어휘':319,'듣기':143,'말하기':38,'읽기':184,'쓰기':22});
  assert.equal(wbPages.size,89);
  for(const [ko,page] of [['밥상',40],['무',41],['턱',43],['손이 크다',94],['콜록콜록',95],['짐',124],['그르다',183],['담장',183],['문득',183],['우물',184],['또래',236]]){
    const found=cards.filter(c=>c.ko===ko&&c.sourceType==='student-book'&&c.sourcePage===page);
    assert.equal(found.length,1,ko);
  }
  assert.equal(cards.find(c=>c.ko==='무').en,'white radish');
  const suffix=cards.find(c=>c.ko==='여');
  assert.equal(suffix.en,'over/more than (after a number)');
  assert.equal(suffix.sources[0].gloss,'approximately');
  const casual=cards.find(c=>c.ko==='비정규직');
  assert.equal(casual.en,'non-regular/temporary employee');
  assert.equal(casual.sources[0].gloss,'part-time employee');
  assert.equal(cards.filter(c=>c.ko==='잔잔하다').length,2);
  assert.deepEqual(cards.filter(c=>c.ko==='잔잔하다').map(c=>c.en),['to be quiet and low (of sound)','to be calm (in demeanor)']);
});

test('5A exposes every review note to its two units and isolates new progress',()=>{
  for(const [review,scope,expected] of [[1,[1,2],9],[2,[3,4],9],[3,[5,6],9],[4,[7,8],11]]){
    const shared=cards.filter(c=>c.sources.some(s=>s.subchapter===`Review ${review}`));
    assert.equal(shared.length,expected);
    for(const c of shared){assert.equal(c.unit,scope[1]);assert.deepEqual(c.relatedUnits,scope);}
    for(const unit of scope){
      const deck=levelDeck([...oldCards,...cards],{books:new Set(['5a']),units:new Set([`5a:${unit}`]),level:'hard'});
      assert.ok(shared.every(c=>deck.some(d=>d.id===c.id)));
      assert.ok(deck.every(c=>c.book==='5a'&&c.relatedUnits.includes(unit)));
    }
    const outside=levelDeck(cards,{books:new Set(['5a']),units:new Set([`5a:${review===1?3:1}`]),level:'hard'});
    assert.ok(shared.every(c=>!outside.some(d=>d.id===c.id)));
  }
  const stats=Object.fromEntries(oldCards.map(c=>[c.id,{streak:3}]));
  const progress=studyProgress([...oldCards,...cards],[],new Set(['5a']),stats);
  assert.deepEqual(progress.map(p=>p.total),[0,319,535]);
  assert.ok(progress.every(p=>p.mastered===0));
});

test('every 5A card has four distinct choices in both directions and explicit language fallback',()=>{
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
