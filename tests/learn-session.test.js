import test from 'node:test';
import assert from 'node:assert/strict';
import {answerLearnQuestion,continueLearn,createLearnSession,learnBatch,learnProgress,localizeLearnQuestion,nextLearnBatch,startLearnPractice} from '../js/learn-session.js';

const steady=()=>.999;
const words=Array.from({length:8},(_,i)=>({id:`3b-u10-v${i+1}`,book:'3b',unit:10,ko:`단어${i+1}`,en:`meaning ${i+1}`}));
const session=(deck=words,settings={})=>createLearnSession(deck,{books:['3b'],units:['3b:10'],level:'standard'},settings);
const answerRight=state=>answerLearnQuestion(state,state.question.type==='mcq'?state.question.answer:state.question.answerLabel);
const finishSet=state=>{
 let current=startLearnPractice(state,'en',steady),records=[];
 while(current.phase==='practice'){
  const answer=answerRight(current);records.push(answer.record);
  current=continueLearn(answer.session,'en',steady);
 }
 return {session:current,records};
};

test('learn mode preserves book order in sets of three and keeps the final partial set',()=>{
 const state=session();
 assert.deepEqual(state.batches,words.map(w=>w.id).reduce((sets,id,i)=>{if(i%3===0)sets.push([]);sets.at(-1).push(id);return sets;},[]));
 assert.deepEqual(learnBatch(state),words.slice(0,3));
 assert.equal(state.phase,'learn');
 assert.deepEqual(learnProgress(state),{totalCards:8,totalSets:3,completedSets:0,completedCards:0,batchNumber:1,batchSize:3,remainingInSet:3,percent:0});
});

test('reading a set or requesting the next set cannot mark cards or skip practice',()=>{
 const state=session();
 for(let i=0;i<3;i++)learnBatch(state);
 assert.equal(nextLearnBatch(state),state);
 assert.equal(continueLearn(state),state);
 assert.deepEqual(answerLearnQuestion(state,'anything'),{session:state,record:null});
 assert.equal(state.correct,0);assert.equal(state.wrong,0);assert.deepEqual(state.first,{});
});

test('sets never mix chapters or books and duplicate IDs are not counted twice',()=>{
 const deck=[words[0],{...words[1],unit:11},{...words[2],book:'2b'},words[3],words[0]];
 const state=session(deck);
 assert.deepEqual(state.batches,[[words[0].id,words[3].id],[words[1].id],[words[2].id]]);
 assert.equal(state.deck.length,4);
});

test('practice questions and distractors come only from the active set',()=>{
 let state=startLearnPractice(session(),'en',steady);
 const allowed=new Set(words.slice(0,3).map(w=>w.id));
 assert.equal(state.question.type,'mcq');
 assert.equal(state.question.choices.length,3);
 while(state.phase==='practice'){
  assert.ok(allowed.has(state.question.cardId));
  assert.ok(state.question.choices.every(choice=>allowed.has(choice.value)));
  state=continueLearn(answerRight(state).session,'en',steady);
 }
 assert.equal(state.phase,'set-complete');
 assert.equal(learnProgress(state).completedCards,3);
 assert.equal(learnProgress(state).completedSets,1);
});

test('a missed word repeats within the same set until answered correctly',()=>{
 const original=startLearnPractice(session(words.slice(0,3)),'en',steady);
 const id=original.question.cardId;
 const wrong=original.question.choices.find(choice=>choice.value!==id).value;
 const answer=answerLearnQuestion(original,wrong);
 assert.deepEqual(answer.record,{id,correct:false});
 let state=continueLearn(answer.session,'en',steady);
 assert.deepEqual(state.queue,[words[1].id,words[2].id,id]);
 assert.equal(state.misses[id],1);assert.equal(state.first[id],false);
 for(let i=0;i<2;i++)state=continueLearn(answerRight(state).session,'en',steady);
 assert.equal(state.question.cardId,id);
 state=continueLearn(answerRight(state).session,'en',steady);
 assert.equal(state.phase,'complete');
 assert.equal(state.correct,3);assert.equal(state.wrong,1);
 assert.equal(state.first[id],false);assert.equal(state.misses[id],1);
 assert.equal(learnProgress(state).percent,100);
});

test('a correct streak must be rebuilt after a miss and cannot advance early',()=>{
 let state=startLearnPractice(session(words.slice(0,1),{streak:2}),'en',steady);
 state=continueLearn(answerRight(state).session,'en',steady);
 assert.equal(state.phase,'practice');assert.equal(state.streaks[words[0].id],1);
 state=continueLearn(answerLearnQuestion(state,'wrong').session,'en',steady);
 assert.equal(state.streaks[words[0].id],0);
 state=continueLearn(answerRight(state).session,'en',steady);
 assert.equal(state.phase,'practice');
 state=continueLearn(answerRight(state).session,'en',steady);
 assert.equal(state.phase,'complete');assert.equal(state.correct,3);assert.equal(state.wrong,1);
});

test('duplicate submits and restored feedback cannot return a second progress record',()=>{
 const original=startLearnPractice(session(),'en',steady);
 const graded=answerRight(original);
 const restored=JSON.parse(JSON.stringify(graded.session));
 assert.equal(restored.answered,true);assert.equal(restored.result,true);
 assert.deepEqual(restored.question,original.question);
 assert.deepEqual(answerRight(restored),{session:restored,record:null});
 assert.equal(restored.correct,1);
 const next=continueLearn(restored,'en',steady);
 assert.equal(next.queue.length,2);assert.equal(next.correct,1);
 assert.equal(continueLearn(next),next);
});

test('empty and invalid MCQ submissions do not alter progress',()=>{
 const state=startLearnPractice(session(),'en',steady);
 for(const value of ['', ' ',null,undefined,'unlisted-card'])assert.deepEqual(answerLearnQuestion(state,value),{session:state,record:null});
 assert.equal(state.correct,0);assert.equal(state.wrong,0);
});

test('next set requires finishing the current set, and a chapter completes only after every set',()=>{
 let state=session(),records=[];
 for(let i=0;i<3;i++){
  const practicing=startLearnPractice(state,'en',steady);
  assert.equal(nextLearnBatch(practicing),practicing);
  const finished=finishSet(state);state=finished.session;records.push(...finished.records);
  if(i<2){
   assert.equal(state.phase,'set-complete');
   state=nextLearnBatch(state);assert.equal(state.phase,'learn');
   assert.equal(state.batchIndex,i+1);
  }
 }
 assert.equal(state.phase,'complete');
 assert.deepEqual(new Set(records.map(record=>record.id)),new Set(words.map(word=>word.id)));
 assert.equal(records.length,8);
 assert.deepEqual(learnProgress(state),{totalCards:8,totalSets:3,completedSets:3,completedCards:8,batchNumber:3,batchSize:2,remainingInSet:0,percent:100});
 assert.equal(nextLearnBatch(state),state);
});

test('empty and single-word chapters remain valid without a trivial one-choice quiz',()=>{
 const empty=session([]);assert.equal(empty.phase,'complete');assert.equal(startLearnPractice(empty),empty);
 assert.deepEqual(learnProgress(empty),{totalCards:0,totalSets:0,completedSets:0,completedCards:0,batchNumber:0,batchSize:0,remainingInSet:0,percent:0});
 const one=startLearnPractice(session(words.slice(0,1)),'en',steady);
 assert.equal(one.question.type,'fill');assert.deepEqual(one.question.choices,[]);
 assert.equal(continueLearn(answerRight(one).session).phase,'complete');
});

test('overlapping meaning alternatives use typed recall within the set',()=>{
 const overlap=[{...words[0],en:'comfort; console'},{...words[1],en:'console / cheer'}];
 const state=startLearnPractice(session(overlap),'en',steady);
 assert.equal(state.question.type,'fill');assert.deepEqual(state.question.choices,[]);
 assert.equal(answerLearnQuestion(state,'  CONSOLE ').record.correct,true);
});

test('practice uses the selected language and accepts English alternatives for typed answers',()=>{
 const translated=[{...words[0],en:'hello / hi',translations:{vi:'xin chào'}},{...words[1],translations:{vi:'tạm biệt'}}];
 const state=startLearnPractice(session(translated),'vi',steady);
 assert.equal(state.question.language,'vi');
 assert.deepEqual(state.question.choices.map(choice=>choice.label),['xin chào','tạm biệt']);
 const single=startLearnPractice(session(translated.slice(0,1)),'vi',steady);
 for(const value of ['xin chào','  HI  '])assert.equal(answerLearnQuestion(single,value).record.correct,true);
 assert.equal(startLearnPractice(session(translated),'ru',steady).question.language,'en');
});

test('persisted questions retain choices, language and answer when resumed',()=>{
 const state=startLearnPractice(session(),'en',()=>.2);
 const restored=JSON.parse(JSON.stringify(state));
 assert.deepEqual(restored,state);
 assert.equal(startLearnPractice(restored,'ru'),restored);
 assert.deepEqual(restored.question,state.question);
});

test('transitions do not mutate source session, deck, options or settings',()=>{
 const options={books:['3b'],units:['3b:10']},settings={streak:3,min:0,max:2};
 const original=createLearnSession(words,options,settings),snapshot=JSON.stringify(original);
 const practicing=startLearnPractice(original,'en',steady),practiceSnapshot=JSON.stringify(practicing);
 const graded=answerRight(practicing),gradedSnapshot=JSON.stringify(graded.session);
 continueLearn(graded.session,'en',steady);
 assert.equal(JSON.stringify(original),snapshot);
 assert.equal(JSON.stringify(practicing),practiceSnapshot);
 assert.equal(JSON.stringify(graded.session),gradedSnapshot);
 original.options.books.push('2b');assert.deepEqual(options.books,['3b']);
 assert.deepEqual(settings,{streak:3,min:0,max:2});
 assert.equal(words.length,8);
});

test('changing language relabels MCQ choices without changing checked IDs or question order',()=>{
 const deck=words.slice(0,3).map((word,index)=>({...word,translations:{vi:`nghĩa ${index}`,zh:`意思${index}`}}));
 const original=startLearnPractice(session(deck),'en',()=>.2),snapshot=JSON.stringify(original);
 const checked=original.question.choices[1].value;
 const translated=localizeLearnQuestion(original,'vi');
 assert.equal(translated.question.language,'vi');
 assert.deepEqual(translated.question.choices.map(c=>c.value),original.question.choices.map(c=>c.value));
 assert.deepEqual(translated.question.choices.map(c=>c.label),translated.question.choices.map(c=>deck.find(word=>word.id===c.value).translations.vi));
 for(const key of ['type','cardId','prompt','answer'])assert.equal(translated.question[key],original.question[key]);
 for(const key of ['queue','streaks','misses','first','correct','wrong','answerStreak','submitted','result','answered','phase','batchIndex'])assert.deepEqual(translated[key],original[key]);
 assert.deepEqual(answerLearnQuestion(translated,checked).record,answerLearnQuestion(original,checked).record);
 assert.equal(JSON.stringify(original),snapshot);
});

test('language changes preserve answered feedback and resume without recording an answer twice',()=>{
 const deck=words.slice(0,3).map((word,index)=>({...word,translations:{vi:`nghĩa ${index}`,zh:`意思${index}`}}));
 const original=startLearnPractice(session(deck),'vi',steady);
 const wrong=original.question.choices.find(choice=>choice.value!==original.question.answer).value;
 const graded=answerLearnQuestion(original,wrong).session;
 const restored=JSON.parse(JSON.stringify(graded));
 const translated=localizeLearnQuestion(restored,'zh');
 assert.equal(translated.question.language,'zh');
 assert.equal(translated.question.answer,graded.question.answer);
 assert.equal(translated.answered,true);assert.equal(translated.result,false);assert.equal(translated.submitted,wrong);
 assert.equal(translated.wrong,1);assert.equal(translated.correct,0);
 assert.deepEqual(translated.queue,graded.queue);assert.deepEqual(translated.misses,graded.misses);assert.deepEqual(translated.first,graded.first);
 assert.deepEqual(answerLearnQuestion(translated,translated.question.answer),{session:translated,record:null});
 assert.deepEqual(JSON.parse(JSON.stringify(translated)),translated);
});

test('missing or ambiguous translations fall back to English while retaining MCQ type',()=>{
 const deck=[{...words[0],translations:{vi:'chung; giống'}},{...words[1],translations:{vi:'giống'}}];
 const original=startLearnPractice(session(deck),'en',steady);
 for(const language of ['vi','ru']){
  const translated=localizeLearnQuestion(original,language);
  assert.equal(translated.question.type,'mcq');assert.equal(translated.question.language,'en');
  assert.deepEqual(translated.question.choices,original.question.choices);
 }
 const englishOverlap=[{...deck[0],en:'common',translations:{vi:'một'}},{...deck[1],en:'common',translations:{vi:'hai'}}];
 const safe=startLearnPractice(session(englishOverlap),'vi',steady);
 assert.equal(safe.question.type,'mcq');
 assert.equal(localizeLearnQuestion(safe,'en'),safe);
});

test('typed recall preserves earlier-language drafts and English aliases after switching languages',()=>{
 const card={...words[0],en:'Hello / Hi',translations:{vi:'xin chào',ru:'привет'}};
 const original=startLearnPractice(session([card]),'vi',steady),snapshot=JSON.stringify(original);
 let translated=localizeLearnQuestion(original,'ru');
 assert.equal(translated.question.type,'fill');assert.equal(translated.question.language,'ru');
 assert.equal(translated.question.answer,original.question.answer);
 assert.deepEqual(translated.question.choices,[]);
 for(const answer of ['xin chào','привет',' HELLO ','hi'])assert.equal(answerLearnQuestion(translated,answer).record.correct,true);
 for(let i=0;i<20;i++)translated=localizeLearnQuestion(translated,i%2?'vi':'ru');
 assert.equal(translated.question.acceptedAnswer.split(';').length,4);
 assert.equal(JSON.stringify(original),snapshot);
 assert.equal(localizeLearnQuestion(session(),'vi').phase,'learn');
 const empty=session([]);assert.equal(localizeLearnQuestion(empty,'vi'),empty);
});
