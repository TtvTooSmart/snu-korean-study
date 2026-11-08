import {matches,shuffle} from './queue.js';
import {meaning,hasMeaning,studyLanguages,directionLabel,choicePrompt,translationFallback} from './vocab-language.js';
export {matches};
const tokens=s=>s.split(/[;/]/).map(x=>x.normalize('NFC').trim().toLowerCase()).filter(Boolean);
const unit=(c,esc)=>c.subchapter?.startsWith('Review ')?esc(c.subchapter):'Unit '+esc(c.unit);

// Saved choices are English strings, so each value needs one shared representative.
// Resolve within this book and difficulty before checking or displaying translations.
const choicePool=(card,pool)=>pool.filter(v=>v.book===card.book&&
 (v.difficulty||'standard')===(card.difficulty||'standard'));
function byEnglish(card,pool){
 const map=new Map(choicePool(card,pool).map(v=>[v.en,v]));
 map.set(card.en,card); // The current card always owns its own answer's translation.
 return map;
}
function distinctMeanings(cards,language){
 const used=new Set();
 for(const card of cards){
  const values=tokens(meaning(card,language));
  if(values.some(value=>used.has(value)))return false;
  values.forEach(value=>used.add(value));
 }
 return true;
}

export function vocabView(c,direction,typed,esc,language='en'){
 const reverse=direction==='en'||direction==='mixed'&&Math.random()<.5;
 const lang=hasMeaning(c,language)?language:'en';
 const front=reverse?meaning(c,lang):c.ko,answer=reverse?c.ko:meaning(c,lang);
 return {answer,acceptedAnswer:reverse?c.ko:[answer,c.en].join(';'),html:`${lang!==language?translationFallback:''}<p class="eyebrow" data-vocab-localized>${directionLabel(reverse,lang)} · ${unit(c,esc)}</p><button class="flashcard" id="flip" aria-label="Flip flashcard"><span lang="${reverse?lang:'ko'}">${esc(front)}</span><small>Click or press Space to reveal</small></button><div id="reveal" hidden><h2 lang="${reverse?'ko':lang}">${esc(answer)}</h2><p lang="ko">${esc(c.example||'')}</p></div>${typed?'<form id="answer-form"><label>Your answer<input id="answer" autocomplete="off" required></label><button>Check answer</button></form>':'<div id="mark" hidden class="actions"><button id="miss" class="danger">Missed ✗ <small>J / ←</small></button><button id="got">Got it ✓ <small>K / →</small></button></div>'}`};
}

// Keep canonical values for grading and saved sessions. Reject overlapping meanings
// in EVERY supported language, so changing language never creates two right answers.
export function buildChoices(card,pool,direction,rng=Math.random){
 const reverse=direction==='en',key=reverse?'ko':'en';
 const variants=v=>reverse?[v.ko]:studyLanguages.map(lang=>meaning(v,lang));
 const used=variants(card).map(value=>new Set(tokens(value)));
 const scoped=reverse?choicePool(card,pool):[...byEnglish(card,pool).values()];
 const candidates=shuffle(scoped.filter(v=>v.id!==card.id&&v.ko!==card.ko&&
  (!reverse||!studyLanguages.some(lang=>tokens(meaning(v,lang)).some(t=>tokens(meaning(card,lang)).includes(t))))),rng);
 const wrong=[];
 for(const v of candidates){
  const values=variants(v).map(tokens);
  if(values.some((list,i)=>list.some(x=>used[i].has(x))))continue;
  wrong.push(v[key]);values.forEach((list,i)=>list.forEach(x=>used[i].add(x)));
  if(wrong.length===3)break;
 }
 if(wrong.length<3)return null;
 return shuffle([card[key],...wrong],rng);
}
export function vocabChoiceView(c,direction,choices,esc,language='en',pool=[c]){
 const reverse=direction==='en',answer=reverse?c.ko:c.en;
 const meanings=byEnglish(c,pool);
 const cards=reverse?[c]:choices.map(value=>meanings.get(value));
 // Older saved sessions can contain values no longer in scope or translated overlaps.
 // Preserve their grading values and order, but safely show the English question.
 const lang=cards.every(v=>v&&hasMeaning(v,language))&&distinctMeanings(cards,language)?language:'en';
 const label=value=>reverse?value:meaning(meanings.get(value)||{en:value},lang);
 return {answer,html:`${lang!==language?translationFallback:''}<p class="eyebrow" data-vocab-localized>${directionLabel(reverse,lang)} · ${unit(c,esc)}</p><div class="flashcard"><span lang="${reverse?lang:'ko'}">${esc(reverse?meaning(c,lang):c.ko)}</span><small data-vocab-localized>${choicePrompt(reverse,lang)}</small></div><form id="answer-form"><div class="choices">${choices.map((a,i)=>`<label><input type="radio" name="choice" value="${esc(a)}" required><span lang="${reverse?'ko':lang}"><small>${i+1}</small> ${esc(label(a))}</span></label>`).join('')}</div><button>Check answer</button></form><div id="reveal" hidden><h2 lang="${reverse?'ko':lang}">${esc(reverse?c.ko:meaning(c,lang))}</h2><p lang="ko">${esc(c.example||'')}</p></div>`};
}
