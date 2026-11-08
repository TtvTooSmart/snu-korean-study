import test from 'node:test';
import assert from 'node:assert/strict';
import {savedVocabulary,reviewView} from '../js/review-view.js';
const cards=[
 {id:'2b-one',book:'2b',unit:10,ko:'아침',en:'morning',translations:{vi:'buổi sáng'}},
 {id:'3b-two',book:'3b',unit:11,ko:'점심',en:'lunch',difficulty:'hard'},
 {id:'3b-three',book:'3b',unit:12,ko:'저녁',en:'evening'}
];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('existing flags populate one folder across books and difficulties without mutation',()=>{
 const stats={'2b-one':{flagged:true,seen:0},'3b-two':{flagged:true,seen:3},'3b-three':{flagged:false,missed:4}};
 const before=structuredClone(stats);
 assert.deepEqual(savedVocabulary(cards,stats).map(card=>card.id),['2b-one','3b-two']);
 assert.deepEqual(stats,before);
});
test('the folder deduplicates shared cards and ignores removed content and unflagged IDs',()=>{
 const stats={'2b-one':{flagged:true},'deleted-import':{flagged:true},'3b-two':{flagged:false}};
 assert.deepEqual(savedVocabulary([cards[0],cards[0],cards[1]],stats),[cards[0]]);
 assert.deepEqual(savedVocabulary(cards,{}),[]);
});
test('correct answers retain saved membership until the user explicitly removes it',async()=>{
 const values=new Map();
 globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
 const {get,restore,record,flag}=await import('../js/storage.js?review-retention');
 restore({version:1,settings:{},stats:{},imports:[],session:null});
 flag('2b-one');record('2b-one',true);record('2b-one',true);
 assert.equal(get().stats['2b-one'].seen,2);
 assert.equal(get().stats['2b-one'].flagged,true);
 assert.deepEqual(savedVocabulary(cards,get().stats),[cards[0]]);
 flag('2b-one');assert.deepEqual(savedVocabulary(cards,get().stats),[]);
 assert.equal(get().stats['2b-one'].seen,2);
});
test('folder renders only saved words, retains English alongside translations, and escapes content',()=>{
 const malicious={...cards[0],id:'"><script>',ko:'<img src=x>',en:'<b>morning</b>'};
 const html=reviewView([malicious,cards[1]],{[malicious.id]:{flagged:true}},esc,'vi');
 assert.ok(html.includes('&lt;img src=x&gt;'));
 assert.ok(html.includes('&lt;b&gt;morning&lt;/b&gt;'));
 assert.ok(html.includes('buổi sáng'));
 assert.ok(html.includes('data-remove-review="&quot;&gt;&lt;script&gt;"'));
 assert.ok(!html.includes('점심'));
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('id="practice-review" type="button" disabled'));
});
test('empty folder offers guidance and disables starting an empty review',()=>{
 const html=reviewView(cards,{},esc);
 assert.ok(html.includes('No saved vocabulary yet.'));
 assert.ok(html.includes('id="practice-review" type="button" disabled'));
 assert.ok(!html.includes('data-remove-review='));
});
