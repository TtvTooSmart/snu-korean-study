import {matches,shuffle} from './queue.js';
export function vocabView(c,direction,typed,esc){const reverse=direction==='en'||direction==='mixed'&&Math.random()<.5;const front=reverse?c.en:c.ko,answer=reverse?c.ko:c.en;return {answer,html:`<p class="eyebrow">${reverse?'English → Korean':'Korean → English'} · ${c.subchapter?.startsWith('Review ')?esc(c.subchapter):'Unit '+esc(c.unit)}</p><button class="flashcard" id="flip" aria-label="Flip flashcard"><span lang="${reverse?'en':'ko'}">${esc(front)}</span><small>Click or press Space to reveal</small></button><div id="reveal" hidden><h2 lang="${reverse?'ko':'en'}">${esc(answer)}</h2><p lang="ko">${esc(c.example||'')}</p></div>${typed?'<form id="answer-form"><label>Your answer<input id="answer" autocomplete="off" required></label><button>Check answer</button></form>':'<div id="mark" hidden class="actions"><button id="miss" class="danger">Missed ✗ <small>J / ←</small></button><button id="got">Got it ✓ <small>K / →</small></button></div>'}`};}
export {matches};

// Build four distinct options from real vocabulary; reject overlapping accepted answers.
export function buildChoices(card,pool,direction,rng=Math.random){
 const key=direction==='en'?'ko':'en',front=direction==='en'?'en':'ko';
 const tokens=s=>s.split(/[;/]/).map(x=>x.normalize('NFC').trim().toLowerCase());
 const correct=card[key],used=new Set(tokens(correct));
 const candidates=shuffle(pool.filter(v=>v.id!==card.id&&v[front]!==card[front]),rng);
 const wrong=[];
 for(const v of candidates){const values=tokens(v[key]);if(values.some(x=>used.has(x)))continue;wrong.push(v[key]);values.forEach(x=>used.add(x));if(wrong.length===3)break;}
 if(wrong.length<3)return null;
 return shuffle([correct,...wrong],rng);
}
export function vocabChoiceView(c,direction,choices,esc){
 const reverse=direction==='en',answer=reverse?c.ko:c.en;
 return {answer,html:`<p class="eyebrow">${reverse?'English → Korean':'Korean → English'} · ${c.subchapter?.startsWith('Review ')?esc(c.subchapter):'Unit '+esc(c.unit)}</p><div class="flashcard"><span lang="${reverse?'en':'ko'}">${esc(reverse?c.en:c.ko)}</span><small>Choose the correct ${reverse?'Korean word':'English meaning'}</small></div><form id="answer-form"><div class="choices">${choices.map((a,i)=>`<label><input type="radio" name="choice" value="${esc(a)}" required><span><small>${i+1}</small> ${esc(a)}</span></label>`).join('')}</div><button>Check answer</button></form><div id="reveal" hidden><h2>${esc(answer)}</h2><p lang="ko">${esc(c.example||'')}</p></div>`};
}
