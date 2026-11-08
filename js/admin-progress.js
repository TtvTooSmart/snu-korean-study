import {studyProgress} from './progress.js';
import {inSelectedUnits} from './vocab-sources.js';

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
