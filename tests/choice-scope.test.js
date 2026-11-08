import test from 'node:test';
import assert from 'node:assert/strict';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';

const card=(id,ko,en,zh,extra={})=>({id,ko,en,translations:{zh},book:'2b',difficulty:'standard',unit:10,...extra});
const current=card('apple','사과','apple','苹果');
const bank=card('bank','은행','bank','银行');
const house=card('house','집','house','房子');
const train=card('train','기차','train','火车');
const base=[current,bank,house,train];
const render=(c,pool,choices=buildChoices(c,pool,'ko',()=>.4))=>vocabChoiceView(c,'ko',choices,String,'zh',pool);
const labels=view=>[...view.html.matchAll(/<span lang="zh"><small>\d<\/small> ([^<]*)<\/span>/g)].map(match=>match[1]);

test('choices and their translations stay in the current book and difficulty',()=>{
 const pool=[...base,
  card('3b-bank','강둑','bank','河岸',{book:'3b'}),
  card('hard-bank','둑','bank','堤岸',{difficulty:'hard'}),
  card('foreign','강','river','河流',{book:'3b'}),
  card('hard','산','mountain','山',{difficulty:'hard'})];
 const choices=buildChoices(current,pool,'ko',()=>.4);
 assert.deepEqual(new Set(choices),new Set(['apple','bank','house','train']));
 assert.deepEqual(new Set(labels(render(current,pool,choices))),new Set(['苹果','银行','房子','火车']));
 assert.deepEqual(new Set(buildChoices(current,pool,'en',()=>.4)),new Set(['사과','은행','집','기차']));
});

test('same-book English polysemy uses the same representative for validation and labels',()=>{
 const c=card('target','환하다','bright','明亮');
 // The final "light" record is the one displayed; it overlaps the right answer.
 const pool=[c,card('light-weight','가볍다','light','轻'),
  card('light-bright','밝다','light','明亮'),bank,house,train];
 for(const rng of [()=>0,()=>.4,()=>.99]){
  const choices=buildChoices(c,pool,'ko',rng);
  assert.equal(choices.length,4);
  assert.ok(!choices.includes('light'));
  assert.deepEqual(new Set(labels(render(c,pool,choices))),new Set(['明亮','银行','房子','火车']));
 }
});

test('same-book English polysemy cannot create duplicate translated distractors',()=>{
 const c=card('target','자동차','car','汽车');
 const pool=[c,card('weight','가볍다','light','轻'),
  card('brightness','밝다','light','明亮'),card('bright','환하다','bright','明亮'),bank,house,train];
 for(const rng of [()=>0,()=>.4,()=>.99]){
  const choices=buildChoices(c,pool,'ko',rng),view=render(c,pool,choices);
  const shown=labels(view);
  assert.equal(shown.length,4);
  assert.equal(new Set(shown).size,4);
  if(choices.includes('light'))assert.ok(shown.includes('明亮'));
  assert.ok(!shown.includes('轻'));
 }
});

test('the current card owns its meaning even when a scoped homonym comes later',()=>{
 const c=card('financial','은행','bank','银行');
 const pool=[c,current,house,train,card('river-bank','강둑','bank','河岸')];
 const choices=buildChoices(c,pool,'ko',()=>.4),view=render(c,pool,choices);
 assert.equal(view.answer,'bank');
 assert.ok(labels(view).includes('银行'));
 assert.ok(!labels(view).includes('河岸'));
});

test('saved string choices retain their values and order after a scope change',()=>{
 const saved=['bank','apple','house','train'];
 const view=render(current,[...base,card('outside','강둑','bank','河岸',{book:'3b'})],saved);
 assert.equal(view.answer,'apple');
 assert.deepEqual([...view.html.matchAll(/value="([^"]*)"/g)].map(match=>match[1]),saved);
 assert.deepEqual(labels(view),['银行','苹果','房子','火车']);
});

test('older ambiguous translated choices fall back to English without changing grading',()=>{
 const c=card('target','환하다','bright','明亮');
 const pool=[c,card('light','밝다','light','明亮'),bank,house];
 const saved=['light','bank','bright','house'],view=render(c,pool,saved);
 assert.equal(view.answer,'bright');
 assert.ok(view.html.includes('Translation unavailable'));
 assert.ok(view.html.includes('Korean → English'));
 assert.deepEqual([...view.html.matchAll(/value="([^"]*)"/g)].map(match=>match[1]),saved);
 assert.deepEqual(labels(view),[]);
});

test('an old choice found only in another book uses whole-question English fallback',()=>{
 const pool=[current,house,train,card('outside','강둑','bank','河岸',{book:'3b'})];
 const view=render(current,pool,['bank','apple','house','train']);
 assert.ok(view.html.includes('Translation unavailable'));
 assert.ok(!view.html.includes('河岸'));
 assert.equal(view.answer,'apple');
});
