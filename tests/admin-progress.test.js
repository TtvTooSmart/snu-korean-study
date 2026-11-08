import test from 'node:test';
import assert from 'node:assert/strict';
import {studentProgress,studiedBookIds,renderStudentBooks} from '../js/admin-progress.js';
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

const twoBooks={
 '3b':{units:books['3b'].units.map(unit=>({...unit,title:`3B chapter ${unit.unit}`}))},
 '2b':{units:[{unit:10,title:'학교생활',vocab:[{id:'2b-easy'},{id:'2b-hard',difficulty:'hard'}],grammar:[{id:'2b-pattern',questions:[{id:'2b-question'}]}]}]}
};
const attempted=(seen=1,missed=0)=>({seen,missed,streak:seen-missed,flagged:false});
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const shownBooks=html=>[...html.matchAll(/class="student-book" data-book="([^"]+)"/g)].map(match=>match[1]);

test('each student gets only their attempted published books in stable level order',()=>{
 const studentA={easy:attempted(),'2b-easy':attempted(2)};
 const studentB={easy:attempted(),'2b-easy':{seen:0,missed:0,streak:0,flagged:true}};
 assert.deepEqual(studiedBookIds(twoBooks,studentA),['2b','3b']);
 assert.deepEqual(studiedBookIds(twoBooks,studentB),['3b']);
 assert.deepEqual(studiedBookIds({'2b':twoBooks['2b'],'3b':twoBooks['3b']},studentA),['2b','3b']);
});
test('wrong-only vocabulary and grammar-only attempts count despite zero mastery',()=>{
 assert.deepEqual(studiedBookIds(twoBooks,{'2b-hard':attempted(3,3)}),['2b']);
 assert.deepEqual(studiedBookIds(twoBooks,{'2b-question':attempted(1,1)}),['2b']);
 assert.deepEqual(studiedBookIds(twoBooks,{question:attempted(2,2)}),['3b']);
});
test('flags, unseen cards, unknown and imported IDs do not count as book study',()=>{
 const stats={
  '2b-easy':{seen:0,missed:0,streak:0,flagged:true},
  easy:{seen:0,missed:0,streak:0,flagged:false},
  '2b-import-10-custom':attempted(10),'3b-u99-v1':attempted(5),
  '2b-pattern':attempted(3),unknown:attempted(100)
 };
 assert.deepEqual(studiedBookIds(twoBooks,stats),[]);
 assert.deepEqual(studiedBookIds(twoBooks,{}),[]);
 assert.deepEqual(studiedBookIds({},stats),[]);
});
test('rendered student cards have separate book sections and chapter details per studied book',()=>{
 const htmlA=renderStudentBooks(twoBooks,{stats:{easy:attempted(),'2b-question':attempted()}},esc);
 const htmlB=renderStudentBooks(twoBooks,{stats:{easy:attempted()}},esc);
 assert.deepEqual(shownBooks(htmlA),['2b','3b']);
 assert.deepEqual(shownBooks(htmlB),['3b']);
 assert.equal((htmlA.match(/<details>/g)||[]).length,2);
 assert.equal((htmlB.match(/<details>/g)||[]).length,1);
 assert.ok(htmlA.includes('<span>Book</span> 2B'));
 assert.ok(htmlA.includes('<span>Book</span> 3B'));
 assert.ok(!htmlB.includes('<span>Book</span> 2B'));
 // Every displayed book retains its three total bars and all chapters, even untouched ones.
 assert.equal((htmlA.match(/<progress /g)||[]).length,3*(2+twoBooks['2b'].units.length+twoBooks['3b'].units.length));
 assert.ok(htmlB.includes('<span>Chapter</span> 11'));
});
test('wrong-only activity renders a real zero-percent book rather than the empty state',()=>{
 const html=renderStudentBooks(twoBooks,{stats:{'2b-question':attempted(2,2)}},esc);
 assert.deepEqual(shownBooks(html),['2b']);
 assert.ok(html.includes('<strong>0%</strong>'));
 assert.ok(html.includes('<span>Accuracy</span>: 0%'));
 assert.ok(!html.includes('No study activity yet.'));
});
test('new and flag-only students show an empty state while unreadable progress keeps its error',()=>{
 for(const stats of [{},{easy:{seen:0,missed:0,streak:0,flagged:true}}, {'2b-import-custom':attempted()}]){
  const html=renderStudentBooks(twoBooks,{stats},esc);
  assert.ok(html.includes('No study activity yet.'));
  assert.deepEqual(shownBooks(html),[]);
  assert.ok(!html.includes('<progress'));
 }
 const unavailable=renderStudentBooks(twoBooks,{progressUnavailable:true,stats:{easy:attempted()}},esc);
 assert.equal(unavailable,'<p>Saved progress could not be read.</p>');
 assert.ok(!unavailable.includes('No study activity yet.'));
});
test('rendered chapter titles are escaped',()=>{
 const altered=structuredClone(twoBooks);altered['2b'].units[0].title='<img src=x onerror=alert(1)>';
 const html=renderStudentBooks(altered,{stats:{'2b-easy':attempted()}},esc);
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img'));
});
