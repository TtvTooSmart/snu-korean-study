import test from 'node:test';
import assert from 'node:assert/strict';
import {mastery,studyProgress} from '../js/progress.js';
import {levelDeck} from '../js/vocab-levels.js';
import {upgradePreferences,normalizeTheme} from '../js/preferences.js';
import {backup} from '../js/data-loader.js';
import {get,defaults} from '../js/storage.js';

test('progress counts unique mastered cards and respects the streak target',()=>{
 const items=[{id:'a'},{id:'a'},{id:'b'},{id:'c'}];
 assert.deepEqual(mastery(items,{a:{streak:2},b:{streak:1}},2),{mastered:1,total:3,percent:33});
 assert.deepEqual(mastery([],{},1),{mastered:0,total:0,percent:0});
});
test('progress separates grammar, easy and hard within the selected book',()=>{
 const words=[{id:'a',book:'3b'},{id:'b',book:'3b',difficulty:'hard'},{id:'c',book:'4a'}];
 const stats={a:{streak:1},b:{streak:0},q:{streak:1}};
 const result=studyProgress(words,[{id:'q',book:'3b'}],new Set(['3b']),stats);
 assert.deepEqual(result.map(r=>[r.mastered,r.total,r.percent]),[[1,1,100],[1,1,100],[0,1,0]]);
 assert.ok(studyProgress(words,[],new Set(),stats).every(r=>r.total===0));
});
test('direct chapter practice excludes out-of-chapter flags',()=>{
 const cards=[{id:'a',book:'3b',unit:10},{id:'b',book:'3b',unit:11}];
 const options={books:new Set(['3b']),units:new Set(['3b:10']),stats:{b:{flagged:true}}};
 assert.deepEqual(levelDeck(cards,{...options,includeFlaggedOutsideUnits:false}).map(c=>c.id),['a']);
 assert.equal(levelDeck(cards,options).length,2);
});
test('Korean default migrates once while preserving a paused session',()=>{
 const state={settings:{direction:'mixed',theme:'auto'},session:{options:{direction:'en'}}};
 const upgraded=upgradePreferences(state);
 assert.equal(upgraded.settings.direction,'ko');assert.equal(upgraded.settings.theme,'green');
 assert.deepEqual(upgraded.session,state.session);assert.equal(state.settings.direction,'mixed');
 upgraded.settings.direction='en';assert.equal(upgradePreferences(upgraded).settings.direction,'en');
});
test('all four themes and older theme settings restore without resetting direction',()=>{
 for(const theme of ['green','black','white','autumn','auto','light','dark']){
  backup({version:1,imports:[],stats:{},settings:{streak:1,min:3,max:8,direction:'en',mode:'typed',theme}});
  assert.equal(get().settings.theme,normalizeTheme(theme));
  assert.equal(upgradePreferences(get()).settings.direction,'en');
  assert.equal(get().vocabChoiceUpgrade,true);
 }
 assert.throws(()=>backup({version:1,imports:[],stats:{},settings:{streak:1,min:3,max:8,direction:'ko',mode:'mcq',theme:'invalid'}}),/Invalid backup settings/);
});
test('Autumn is the fresh or missing-theme default while explicit saved themes stay unchanged',()=>{
 assert.equal(defaults.theme,'autumn');
 for(const theme of [undefined,null,'invalid']){
  const state={settings:{theme,direction:'en'},koreanDirectionDefault:true,stats:{word:{seen:2,missed:0,streak:2}}};
  const upgraded=upgradePreferences(state);
  assert.equal(upgraded.settings.theme,'autumn');
  assert.equal(upgraded.settings.direction,'en');
  assert.deepEqual(upgraded.stats,state.stats);
 }
 for(const theme of ['green','black','white','autumn']){
  assert.equal(upgradePreferences({settings:{theme}}).settings.theme,theme);
 }
});
