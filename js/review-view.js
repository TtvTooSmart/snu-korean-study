import {meaning} from './vocab-language.js';

// The existing flag is the folder membership. Correct answers never remove it,
// and stale IDs are ignored when a textbook/import is no longer available.
export function savedVocabulary(cards,stats={}) {
 const seen=new Set();
 return cards.filter(card=>{
  if(!card?.id||!stats?.[card.id]?.flagged||seen.has(card.id))return false;
  seen.add(card.id);return true;
 });
}

export function reviewView(cards,stats,esc,language='en') {
 const saved=savedVocabulary(cards,stats);
 return `<a href="#home">← Back to home</a><p class="eyebrow">Saved vocabulary</p><h1>Saved vocabulary</h1><p>Saved words stay here until you remove them.</p><p>Your saved words also remain in normal vocabulary practice.</p><div class="review-toolbar"><p><strong>${saved.length}</strong> <span>saved words</span></p><button id="practice-review" type="button" ${saved.length?'':'disabled'}>Practise saved words</button></div>${saved.length?`<div class="review-list">${saved.map(card=>{
  const translated=meaning(card,language);
  return `<article class="review-word"><p class="review-source"><span>Book</span> ${esc((card.book||'').toUpperCase())} · <span>Chapter</span> ${esc(card.unit??'')} · <span>${card.difficulty==='hard'?'Hard':'Easy'}</span></p><div data-vocab-localized><h2 lang="ko">${esc(card.ko)}</h2><p class="review-en" lang="en">${esc(card.en)}</p>${language!=='en'&&translated!==card.en?`<p class="review-translation" lang="${esc(language)}">${esc(translated)}</p>`:''}${card.example?`<p class="review-example" lang="ko">${esc(card.example)}</p>`:''}</div><button type="button" class="secondary" data-remove-review="${esc(card.id)}">Remove from review</button></article>`;
 }).join('')}</div>`:'<section class="panel review-empty"><h2>No saved vocabulary yet.</h2><p>Save words with “Practise this again” or the save button in Learn mode.</p></section>'}`;
}
