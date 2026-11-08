import {learnBatch,learnProgress} from './learn-session.js';
import {meaning,directionLabel,choicePrompt} from './vocab-language.js';

// Views never record progress: reading a word is separate from answering it.
export function learnPickerView(chapters,esc) {
 const available=chapters.filter(chapter=>chapter.count>0);
 return `<a href="#home">← Back to home</a><p class="eyebrow">Learn vocabulary</p><h1>Choose a chapter to learn</h1><p>Learn three words together, then practise only those words.</p><p>Each chapter uses as many sets as its word count needs.</p>${available.length?`<div class="learn-chapter-grid">${available.map(chapter=>`<button type="button" class="learn-chapter" data-learn-chapter="${esc(chapter.key)}"><strong>${esc(chapter.book.toUpperCase())} · <span>Chapter</span> ${esc(chapter.unit)}</strong><span lang="ko">${esc(chapter.title)}</span><small>${chapter.count} <span>words</span> · ${chapter.sets} <span>sets</span></small></button>`).join('')}</div>`:'<div class="panel"><p>No words match this selection. Choose another chapter or difficulty.</p></div>'}`;
}

function progressView(progress,esc) {
 return `<div class="learn-progress"><div class="learn-set-label"><strong><span>Set</span> ${progress.batchNumber} <span>of</span> ${progress.totalSets}</strong><span>${progress.completedCards} / ${progress.totalCards} <span>words practised</span></span></div><progress value="${progress.completedCards}" max="${progress.totalCards||1}" aria-label="Chapter learning progress"></progress></div>`;
}

function reviewButton(card,stats,esc) {
 const saved=!!stats[card.id]?.flagged;
 return `<button type="button" class="secondary ${saved?'flagged':''}" data-review-word="${esc(card.id)}" aria-pressed="${saved}">${saved?'★ Saved for review':'★ Save this vocab for review'}</button>`;
}

function wordCards(cards,esc,language,stats) {
 return `<div class="learn-grid">${cards.map(card=>{
  const translated=meaning(card,language);
  return `<article class="learn-word"><div data-vocab-localized><h2 class="learn-ko" lang="ko">${esc(card.ko)}</h2><p class="learn-en" lang="en">${esc(card.en)}</p>${language!=='en'&&translated!==card.en?`<p class="learn-translation" lang="${esc(language)}">${esc(translated)}</p>`:''}${card.example?`<div class="learn-example"><p lang="ko">${esc(card.example)}</p></div>`:''}</div><div class="learn-actions">${reviewButton(card,stats,esc)}</div></article>`;
 }).join('')}</div>`;
}

function practiceView(session,esc,stats) {
 const question=session.question;
 const card=session.deck.find(word=>word.id===question.cardId);
 const answered=!!session.answered;
 const answer=meaning(card,question.language);
 const controls=question.type==='mcq'
  ?`<div class="choices" role="radiogroup" aria-label="${esc(choicePrompt(false,question.language))}">${question.choices.map((choice,index)=>`<label><input type="radio" name="learn-choice" value="${esc(choice.value)}" required ${answered?'disabled':''} ${session.submitted===choice.value?'checked':''}><span class="${answered&&choice.value===question.answer?'answer-correct':''} ${answered&&!session.result&&session.submitted===choice.value?'answer-wrong':''}" lang="${esc(question.language)}"><small>${index+1}</small> ${esc(choice.label)}</span></label>`).join('')}</div>`
  :`<label><span>Your answer</span><input id="answer" autocomplete="off" required ${answered?'disabled':''} value="${answered?esc(session.submitted||''):''}" lang="${esc(question.language)}"></label>`;
 return `<p class="eyebrow" data-vocab-localized>${esc(directionLabel(false,question.language))}</p><div class="flashcard"><span lang="ko">${esc(question.prompt||card.ko)}</span><small data-vocab-localized>${esc(question.type==='mcq'?choicePrompt(false,question.language):directionLabel(false,question.language))}</small></div><form id="learn-answer-form">${controls}<div class="learn-actions"><button id="learn-check" ${answered?'disabled':''}>Check answer</button></div></form><div class="learn-actions">${reviewButton(card,stats,esc)}</div>${answered?`<div id="learn-feedback" role="status"><div class="feedback ${session.result?'':'bad'}"><strong>${session.result?'Correct ✓':'Keep practising — you’ll see this again.'}</strong><p><span>Answer</span>: <b lang="${esc(question.language)}" data-vocab-localized>${esc(answer)}</b></p></div><div class="learn-actions"><button id="learn-continue" type="button">Continue →</button></div></div>`:''}`;
}

export function learnSessionView(session,esc,language='en',stats={}) {
 const progress=learnProgress(session),cards=learnBatch(session);
 const book=session.options?.books?.[0]||session.deck[0]?.book||'';
 const chapter=session.options?.units?.[0]?.split(':')[1]||session.deck[0]?.unit||'';
 const heading=`<p class="eyebrow">${esc(book.toUpperCase())} · <span>Chapter</span> ${esc(chapter)} · <span>Learn vocabulary</span></p>${session.options?.chapterTitle?`<h1 lang="ko">${esc(session.options.chapterTitle)}</h1>`:''}`;
 let body;
 if(session.phase==='learn'){
  body=`<h2>Learn this set</h2><p>Study these words together, then practise only this set.</p>${wordCards(cards,esc,language,stats)}<div class="learn-actions"><button id="learn-practise" type="button">Practise these words</button></div>`;
 }else if(session.phase==='practice'){
  body=`<h2>Practise this set</h2><p><span>Words remaining in this set</span>: ${progress.remainingInSet}</p>${practiceView(session,esc,stats)}`;
 }else if(session.phase==='set-complete'){
  body='<div class="learn-summary"><h2>Set complete ✓</h2><p>You practised every word in this set.</p><div class="learn-actions"><button id="learn-next-set" type="button">Learn next set</button><a class="button secondary" href="#home">Pause & return home</a></div></div>';
 }else{
  const attempts=session.correct+session.wrong;
  body=`<div class="learn-summary"><h2>Chapter complete ✓</h2><p>You practised every word in this chapter.</p><div class="stats"><span><strong>${progress.totalCards}</strong> <span>words practised</span></span><span><strong>${progress.totalSets}</strong> <span>sets completed</span></span><span><strong>${attempts?Math.round(session.correct/attempts*100):0}%</strong> <span>all-attempt accuracy</span></span></div><div class="learn-actions"><button id="learn-restart" type="button">Learn this chapter again</button><button id="learn-choose-chapter" type="button" class="secondary">Choose another chapter</button></div></div>`;
 }
 return `<div class="learn-navigation"><a href="#home">← Pause & return home</a><a href="#review">Saved vocabulary</a></div>${heading}<section class="panel">${progressView(progress,esc)}${body}</section>`;
}
