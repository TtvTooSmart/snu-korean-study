import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildChoices,vocabChoiceView,vocabView,matches} from '../js/quiz-vocab.js';
import {meaning,studyLanguages} from '../js/vocab-language.js';
import {validateBook,merge} from '../js/data-loader.js';
import {translateText} from '../js/i18n.js';
const book=JSON.parse(fs.readFileSync(new URL('../data/3b.json',import.meta.url)));
const pool=book.units.flatMap(u=>u.vocab);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

test('all 564 published 3B words have Vietnamese, Chinese and Russian meanings',()=>{
 assert.equal(pool.length,564);validateBook(book);
 for(const card of pool)for(const language of ['vi','zh','ru'])assert.ok(card.translations[language].trim(),`${card.id}: ${language}`);
});
test('every card has four unambiguous options in every language and both directions',()=>{
 const tokens=s=>s.split(/[;/]/).map(x=>x.normalize('NFC').trim().toLowerCase());
 for(const card of pool)for(const direction of ['ko','en']){
  const choices=buildChoices(card,pool,direction,()=>.42);
  assert.equal(choices.length,4,card.id);
  for(const language of studyLanguages){
   const byEnglish=new Map(pool.map(v=>[v.en,v]));byEnglish.set(card.en,card);
   const labels=choices.map(v=>direction==='en'?v:meaning(byEnglish.get(v),language));
   const allTokens=labels.flatMap(tokens);
   assert.equal(new Set(allTokens).size,allTokens.length,`${card.id} ${language} ${direction}`);
   const view=vocabChoiceView(card,direction,choices,esc,language,pool);
   assert.equal(view.answer,direction==='en'?card.ko:card.en);
   for(const label of labels)assert.ok(view.html.includes(esc(label)));
   assert.ok(!view.html.includes('Translation unavailable'));
  }
 }
});
test('switching language changes labels, not saved values, order or correct answer',()=>{
 const c=pool.find(v=>v.ko==='삼복'),choices=buildChoices(c,pool,'ko',()=>.3);
 for(const language of ['vi','zh','ru']){
  const view=vocabChoiceView(c,'ko',choices,esc,language,pool);
  assert.ok(view.html.includes(c.translations[language]));
  assert.deepEqual([...view.html.matchAll(/value="([^"]*)"/g)].map(x=>x[1]),choices.map(esc));
  assert.equal(view.answer,c.en);
 }
});
test('reverse prompts and flashcards use the selected language; typed accepts alternatives',()=>{
 const c=pool.find(v=>v.ko==='삼복');
 for(const language of ['vi','zh','ru']){
  const reverse=vocabChoiceView(c,'en',buildChoices(c,pool,'en'),esc,language,pool);
  assert.ok(reverse.html.includes(c.translations[language]));assert.equal(reverse.answer,c.ko);
  const typed=vocabView(c,'ko',true,esc,language);
  assert.ok(matches(c.translations[language].toUpperCase(),typed.acceptedAnswer));
  assert.ok(matches(c.en,typed.acceptedAnswer));
 }
});
test('imported words without translations show a clear whole-question English fallback',()=>{
 const c={id:'import',ko:'사과',en:'apple'},p=[c,...pool];
 const choices=buildChoices(c,p,'ko',()=>.4),view=vocabChoiceView(c,'ko',choices,esc,'vi',p);
 assert.ok(view.html.includes('Translation unavailable'));
 assert.ok(view.html.includes('Korean → English'));
 for(const choice of choices)assert.ok(view.html.includes(esc(choice)));
 assert.equal(view.answer,'apple');
});
test('malformed translations fail validation and direction labels reflect the study language',()=>{
 for(const translations of [[],{vi:42},{fr:'mot'},{ru:''}]){
  const changed=structuredClone(book);changed.units[0].vocab[0].translations=translations;
  assert.throws(()=>validateBook(changed),/translation/i);
 }
 assert.equal(translateText('Korean → English','vi'),'Tiếng Hàn → Tiếng Việt');
 assert.equal(translateText('EN → KO','ru'),'RU → KO');
});
test('editing an imported meaning invalidates old translations unless replacements are supplied',()=>{
 const edited=structuredClone(book);const word=edited.units[0].vocab[0];word.en='a different meaning';delete word.translations;
 assert.equal(merge(book,edited).units[0].vocab[0].translations,undefined);
});
