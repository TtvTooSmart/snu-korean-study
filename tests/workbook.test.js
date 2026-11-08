import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {levelDeck} from '../js/vocab-levels.js';
import {vocabSources,sourceNote} from '../js/vocab-sources.js';
import {merge,validateBook} from '../js/data-loader.js';
import {translateText} from '../js/i18n.js';
const book=JSON.parse(fs.readFileSync(new URL('../data/3b.json',import.meta.url)));
const cards=book.units.flatMap(u=>u.vocab.map(c=>({...c,book:book.book,unit:u.unit})));
test('all 130 workbook footnotes appear in Hard and Standard retains 198 cards',()=>{
 validateBook(book);
 const workbook=cards.flatMap(c=>vocabSources(c).filter(s=>s.sourceType==='workbook').map(s=>({c,s})));
 assert.equal(workbook.length,130);
 assert.equal(cards.filter(c=>c.sourceType==='workbook').length,122);
 assert.equal(cards.filter(c=>c.difficulty==='standard').length,198);
 assert.equal(cards.filter(c=>c.difficulty==='hard').length,366);
 for(const {c,s} of workbook){assert.equal(c.difficulty,'hard');assert.ok(s.sourcePage>=14&&s.sourcePage<=175);assert.ok(s.subchapter);assert.ok(s.gloss);}
});
test('workbook opening-page footnotes use Hard, not student-book opening boundaries',()=>{
 const speaker=cards.find(c=>c.ko==='스피커');
 assert.equal(speaker.sourcePage,14);assert.equal(speaker.difficulty,'hard');
 assert.match(sourceNote(speaker,String),/Workbook page/);
 assert.match(sourceNote(cards.find(c=>c.difficulty==='standard'),String),/Student book page/);
});
test('review words follow any covered unit and appear once in multi-unit decks',()=>{
 const review=cards.find(c=>c.ko==='필터');
 for(const unit of [10,11,12])assert.ok(levelDeck(cards,{books:new Set(['3b']),units:new Set([`3b:${unit}`]),level:'hard'}).some(c=>c.id===review.id));
 assert.ok(!levelDeck(cards,{books:new Set(['3b']),units:new Set(['3b:13']),level:'hard'}).some(c=>c.id===review.id));
 assert.equal(levelDeck(cards,{books:new Set(['3b']),units:new Set(['3b:10','3b:12']),level:'hard'}).filter(c=>c.id===review.id).length,1);
});
test('shared words retain both sources and source-unit filters',()=>{
 const poor=cards.find(c=>c.id==='3b-u18-v1');
 assert.deepEqual(vocabSources(poor).map(s=>s.sourceType),['student-book','workbook']);
 for(const unit of [16,18])assert.ok(levelDeck(cards,{books:new Set(['3b']),units:new Set([`3b:${unit}`]),level:'hard'}).some(c=>c.id===poor.id));
});
test('older imported records retain newly added workbook provenance',()=>{
 const old={book:'3b',units:[{unit:18,vocab:[{id:'3b-u18-v1',ko:'가난하다',en:'poor',difficulty:'hard'}],grammar:[]}]};
 const result=merge(book,old).units.find(u=>u.unit===18).vocab.find(c=>c.id==='3b-u18-v1');
 assert.equal(result.sources.length,2);assert.deepEqual(result.relatedUnits,[16,18]);
});
test('source labels and new Hard selector translate into all interface languages',()=>{
 for(const language of ['vi','zh','ru'])for(const text of ['Workbook page','Student book page','Hard · student book + workbook'])assert.notEqual(translateText(text,language),text);
});

test('malformed source metadata gets a friendly validation error',()=>{
 for(const metadata of [{sources:'workbook'},{sources:[null]},{sourcePage:-1},{relatedUnits:'10'},{sourceType:'unknown'}]){
  const bad=structuredClone(book);Object.assign(bad.units[0].vocab[0],metadata);assert.throws(()=>validateBook(bad),/source|Source|units/);
 }
});
