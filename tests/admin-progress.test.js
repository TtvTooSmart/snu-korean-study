import test from 'node:test';
import assert from 'node:assert/strict';
import {studentProgress} from '../js/admin-progress.js';
const books={'3b':{units:[
 {unit:10,vocab:[{id:'easy'},{id:'shared',difficulty:'hard',relatedUnits:[11]}],grammar:[{questions:[{id:'question'}]}]},
 {unit:11,vocab:[{id:'other'}],grammar:[]}
]}};
test('dashboard separates mastery and attempt accuracy using a fixed benchmark',()=>{
 const stats={easy:{seen:4,missed:1,streak:1},shared:{seen:2,missed:2,streak:0},question:{seen:3,missed:1,streak:1},unknown:{seen:100,missed:0,streak:100}};
 const rows=studentProgress(books,stats,'3b');
 assert.deepEqual(rows.map(r=>[r.key,r.mastered,r.total,r.accuracy]),[['grammar',1,1,67],['easy',1,2,75],['hard',0,1,0]]);
});
test('chapter details include shared workbook words without duplicating totals',()=>{
 const rows=studentProgress(books,{shared:{seen:1,missed:0,streak:1}},'3b',11);
 assert.deepEqual(rows.map(r=>[r.total,r.mastered]),[[0,0],[1,0],[1,1]]);
});
test('new students and empty books show zero progress and no fabricated accuracy',()=>{
 assert.ok(studentProgress(books,{},'3b').every(r=>r.mastered===0&&r.accuracy===null));
 assert.deepEqual(studentProgress(books,{},'1a'),[]);
});
