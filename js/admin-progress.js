import {studyProgress} from './progress.js';
import {inSelectedUnits} from './vocab-sources.js';

// A real attempt counts as study, even when every answer was wrong. Match exact
// published IDs so flags, imports and unknown IDs cannot create empty book cards.
export function studiedBookIds(books,stats={}) {
 const attempted=id=>(stats[id]?.seen||0)>0;
 return Object.keys(books).sort((a,b)=>a.localeCompare(b,'en',{numeric:true})).filter(id=>
  books[id].units.some(unit=>unit.vocab.some(card=>attempted(card.id))||
   unit.grammar.some(pattern=>pattern.questions.some(question=>attempted(question.id)))));
}

// Use published textbook IDs and a consistent one-correct-answer benchmark.
// Student streak preferences are device-local and are not shared with admins.
export function studentProgress(books,stats={},bookId,unit=null) {
 const book=books[bookId];
 if(!book)return [];
 const scope=unit===null?new Set():new Set([`${bookId}:${unit}`]);
 const words=book.units.flatMap(u=>u.vocab.map(v=>({...v,book:bookId,unit:u.unit})))
   .filter(v=>inSelectedUnits(v,scope));
 const questions=book.units.filter(u=>unit===null||u.unit===unit)
   .flatMap(u=>u.grammar.flatMap(g=>g.questions.map(q=>({...q,book:bookId}))));
 const rows=studyProgress(words,questions,new Set([bookId]),stats,1);
 return rows.map(row=>{
   const items=row.key==='grammar'?questions:words.filter(v=>(v.difficulty||'standard')===(row.key==='hard'?'hard':'standard'));
   const unique=[...new Set(items.map(v=>v.id))];
   const seen=unique.reduce((n,id)=>n+(stats[id]?.seen||0),0);
   const missed=unique.reduce((n,id)=>n+(stats[id]?.missed||0),0);
   return {...row,seen,missed,accuracy:seen?Math.round((seen-missed)/seen*100):null};
 });
}

// Pure markup keeps per-student book selection independently testable. The page
// controller still owns authorization, fetching and the lifetime of student data.
export function renderStudentBooks(books,student,esc) {
 if(student.progressUnavailable)return '<p>Saved progress could not be read.</p>';
 const stats=student.stats||{},bookIds=studiedBookIds(books,stats);
 if(!bookIds.length)return '<p class="student-empty">No study activity yet.</p>';
 const bars=rows=>`<div class="student-metrics">${rows.map(row=>`<div class="student-metric"><div><span>${esc(row.label)}</span><strong>${row.percent}%</strong></div><progress aria-label="${esc(row.label)}" value="${row.mastered}" max="${row.total||1}"></progress><small>${row.mastered} / ${row.total} · <span>Accuracy</span>: ${row.accuracy===null?'—':row.accuracy+'%'}</small></div>`).join('')}</div>`;
 return bookIds.map(bookId=>`<section class="student-book" data-book="${esc(bookId)}"><h3><span>Book</span> ${esc(bookId.toUpperCase())}</h3>${bars(studentProgress(books,stats,bookId))}<details><summary>Chapter details</summary><div class="student-chapters">${books[bookId].units.map(unit=>`<section><h4><span>Chapter</span> ${esc(unit.unit)} · <span lang="ko">${esc(unit.title)}</span></h4>${bars(studentProgress(books,stats,bookId,unit.unit))}</section>`).join('')}</div></details></section>`).join('');
}
