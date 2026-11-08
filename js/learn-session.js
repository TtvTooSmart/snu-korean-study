import {advance,matches,shuffle} from './queue.js';
import {hasMeaning,meaning,studyLanguages} from './vocab-language.js';

// Learn sessions are JSON-only values. Views never change counters or mastery;
// only an accepted answer returns a record for the controller to save once.
const batchSize=3;
const resetAnswer={answered:false,result:null,submitted:null,question:null};
const tokens=value=>value.split(/[;/]/).map(text=>text.normalize('NFC').trim().toLowerCase().replace(/\s+/g,' ')).filter(Boolean);
const distinctMeanings=(batch,language)=>{
 const labels=new Set();
 return batch.every(item=>[...new Set(tokens(meaning(item,language)))].every(token=>{
  if(labels.has(token))return false;
  labels.add(token);return true;
 }));
};

export function createLearnSession(deck,options={},settings={}) {
 const seen=new Set(),cards=deck.filter(card=>{
  if(seen.has(card.id))return false;
  seen.add(card.id);return true;
 }).map(card=>({...card}));
 // Keep textbook order and prevent a short chapter's final set from borrowing
 // words from the next chapter, even if a caller supplies several chapters.
 const groups=new Map();
 for(const card of cards){
  const key=JSON.stringify([card.book,card.unit]);
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(card.id);
 }
 const batches=[];
 for(const ids of groups.values())for(let i=0;i<ids.length;i+=batchSize)batches.push(ids.slice(i,i+batchSize));
 const streak=[1,2,3].includes(settings.streak)?settings.streak:1;
 const min=Number.isInteger(settings.min)&&settings.min>=0?Math.min(settings.min,100):3;
 const max=Number.isInteger(settings.max)&&settings.max>=min?Math.min(settings.max,100):Math.max(min,8);
 return {
  type:'learn',learnVersion:1,deck:cards,batches,batchIndex:0,
  phase:batches.length?'learn':'complete',queue:[],streaks:{},misses:{},first:{},
  correct:0,wrong:0,answerStreak:0,
  options:structuredClone(options),settings:{...settings,streak,min,max},...resetAnswer
 };
}

export function learnBatch(session) {
 const cards=new Map(session.deck.map(card=>[card.id,card]));
 return (session.batches[session.batchIndex]||[]).map(id=>cards.get(id));
}

function makeQuestion(session,requestedLanguage,rng) {
 const batch=learnBatch(session),card=batch.find(item=>item.id===session.queue[0]);
 if(!card)return null;
 const language=studyLanguages.includes(requestedLanguage)&&batch.every(item=>hasMeaning(item,requestedLanguage))?requestedLanguage:'en';
 const distinct=distinctMeanings(batch,language);
 // A single choice would reveal the answer. Overlapping alternatives could
 // produce two correct choices, so either case uses a typed recall question.
 const type=batch.length>1&&distinct?'mcq':'fill';
 const answerLabel=meaning(card,language);
 return {
  type,cardId:card.id,prompt:card.ko,language,answer:card.id,answerLabel,
  acceptedAnswer:[...new Set([answerLabel,card.en])].join(';'),
  choices:type==='mcq'?shuffle(batch.map(item=>({value:item.id,label:meaning(item,language)})),rng):[]
 };
}

export function startLearnPractice(session,language='en',rng=Math.random) {
 if(session.phase!=='learn')return session;
 const next={...session,...resetAnswer,phase:'practice',queue:shuffle(session.batches[session.batchIndex],rng)};
 return {...next,question:makeQuestion(next,language,rng)};
}

// Changing interface language relabels the existing question without rerolling
// it. Stable choice IDs preserve the selected radio and any recorded result.
export function localizeLearnQuestion(session,requestedLanguage) {
 const question=session.question;
 if(session.phase!=='practice'||!question)return session;
 const batch=learnBatch(session),cards=new Map(batch.map(card=>[card.id,card]));
 const card=cards.get(question.cardId);
 let language=studyLanguages.includes(requestedLanguage)&&batch.every(item=>hasMeaning(item,requestedLanguage))?requestedLanguage:'en';
 if(question.type==='mcq'&&!distinctMeanings(batch,language))language='en';
 // An originally translated set may have overlapping English meanings too.
 // Keep its known-safe labels rather than introducing two correct choices.
 if(question.type==='mcq'&&!distinctMeanings(batch,language))return session;
 const answerLabel=meaning(card,language);
 const acceptedAnswer=question.type==='fill'
  ?[...new Set(tokens([answerLabel,card.en,question.acceptedAnswer].join(';')))].join(';')
  :[...new Set([answerLabel,card.en])].join(';');
 return {...session,question:{
  ...question,language,answerLabel,acceptedAnswer,
  choices:question.choices.map(choice=>({...choice,label:meaning(cards.get(choice.value),language)}))
 }};
}

export function answerLearnQuestion(session,value) {
 const question=session.question;
 if(session.phase!=='practice'||session.answered||!question||typeof value!=='string'||!value.trim())return {session,record:null};
 if(question.type==='mcq'&&!question.choices.some(choice=>choice.value===value))return {session,record:null};
 const correct=question.type==='mcq'?value===question.answer:matches(value,question.acceptedAnswer);
 const id=question.cardId;
 return {
  session:{
   ...session,answered:true,result:correct,submitted:value,
   correct:session.correct+Number(correct),wrong:session.wrong+Number(!correct),
   answerStreak:correct?session.answerStreak+1:0,
   first:Object.hasOwn(session.first,id)?session.first:{...session.first,[id]:correct},
   misses:correct?session.misses:{...session.misses,[id]:(session.misses[id]||0)+1}
  },
  record:{id,correct}
 };
}

export function continueLearn(session,language='en',rng=Math.random) {
 if(session.phase!=='practice'||!session.answered)return session;
 const next={...session,...advance(session.queue,session.streaks,session.result,session.settings.streak,session.settings.min,session.settings.max,rng),...resetAnswer};
 if(!next.queue.length)return {...next,phase:next.batchIndex===next.batches.length-1?'complete':'set-complete'};
 return {...next,question:makeQuestion(next,language,rng)};
}

export function nextLearnBatch(session) {
 if(session.phase!=='set-complete')return session;
 const batchIndex=session.batchIndex+1;
 return {...session,...resetAnswer,batchIndex,queue:[],phase:batchIndex<session.batches.length?'learn':'complete'};
}

// A card is complete only after its quiz queue entry is removed. Reading a set
// does not count; a correct answer still waiting on Continue is not double-counted.
export function learnProgress(session) {
 const totalSets=session.batches.length,totalCards=session.deck.length;
 const completedSets=session.phase==='complete'?totalSets:session.batchIndex+Number(session.phase==='set-complete');
 let completedCards=session.batches.slice(0,completedSets).reduce((sum,batch)=>sum+batch.length,0);
 const size=session.batches[session.batchIndex]?.length||0;
 if(session.phase==='practice')completedCards+=size-session.queue.length;
 return {
  totalCards,totalSets,completedSets,completedCards,
  batchNumber:totalSets?Math.min(session.batchIndex+1,totalSets):0,
  batchSize:size,
  remainingInSet:session.phase==='practice'?session.queue.length:session.phase==='learn'?size:0,
  percent:totalCards?Math.round(completedCards/totalCards*100):0
 };
}
