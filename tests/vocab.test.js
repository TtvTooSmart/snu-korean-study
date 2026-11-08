import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildChoices,vocabChoiceView} from '../js/quiz-vocab.js';
const b=JSON.parse(fs.readFileSync(new URL('../data/3b.json',import.meta.url)));const pool=b.units.flatMap(u=>u.vocab);
test('every 3B card has four distinct choices and one exact answer in both directions',()=>{for(const c of pool)for(const d of ['ko','en']){const a=buildChoices(c,pool,d,()=>.4);assert.equal(a.length,4);assert.equal(new Set(a).size,4);assert.equal(a.filter(x=>x===c[d==='ko'?'en':'ko']).length,1);}});
test('excludes overlapping accepted alternatives',()=>{const c={id:'a',ko:'행복하다',en:'happy; glad'};const p=[c,{id:'b',ko:'기쁘다',en:'glad'},{id:'c',ko:'가다',en:'go'},{id:'d',ko:'오다',en:'come'},{id:'e',ko:'먹다',en:'eat'}];assert.ok(!buildChoices(c,p,'ko').includes('glad'));});
test('insufficient unique distractors returns null',()=>assert.equal(buildChoices(pool[0],[pool[0]],'ko'),null));
test('MCQ view does not offer reveal or self marking before submission',()=>{const v=vocabChoiceView(pool[0],'ko',buildChoices(pool[0],pool,'ko'),String);assert.equal((v.html.match(/type="radio"/g)||[]).length,4);assert.ok(v.html.includes('id="reveal" hidden'));assert.ok(!v.html.includes('id="flip"'));});
