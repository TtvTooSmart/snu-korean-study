import {nextAnswerStreak,celebrateStreak,clearCelebration} from './streak-celebration.js';
import {studyRoute} from './study-access.js';
import {meaning} from './vocab-language.js';
import {updateAutumnLeaves} from './autumn-leaves.js';
import {updateSeoulScene} from './seoul-scene.js';
import {initMobileMenu} from './mobile-menu.js';
import {adminDashboard} from './admin-dashboard.js';
import {initAccounts,accountView,isSignedIn,canManageData,requireAdmin} from './account.js';
import {homeView} from './home-view.js';
import {studyProgress} from './progress.js';
import {inSelectedUnits} from './vocab-sources.js';
import {sourceNote} from './vocab-sources.js';
import {initLanguage,currentLanguage} from './i18n.js';
import {atLevel,levelDeck} from './vocab-levels.js';
import {get,save,record,flag,notice} from './storage.js';
import {load,importBooks,csv,backup} from './data-loader.js';
import {shuffle,advance,again,matches} from './queue.js';
import {vocabView,vocabChoiceView,buildChoices} from './quiz-vocab.js';
import {grammarView,questionText} from './quiz-grammar.js';
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data,selected=new Set(['3b']),units=new Set(),session=get().session,activeKey=null,vocabLevel='standard',bookLevel='3';
function warning(){$('#warning').textContent=notice();}document.addEventListener('storage-warning',warning);
function theme(){
 const t=get().settings.theme;
 document.documentElement.dataset.theme=t;
 updateAutumnLeaves(t);
 updateSeoulScene(t);
 $('#theme-select').value=t;
 if($('[name=theme]'))$('[name=theme]').value=t;
}
function renderProgress(){
 if(!data)return;
 if(!isSignedIn()){$('#study-progress').hidden=true;return;}
 const inQuiz=location.hash==='#quiz'&&session;
 const books=inQuiz?new Set(session.options.books||session.deck.map(c=>c.book)):selected;
 const scope=inQuiz?new Set(session.options.units||[]):units;
 const vs=vocab().filter(c=>inSelectedUnits(c,scope));
 const gs=grammar().filter(c=>!scope.size||scope.has(`${c.book}:${c.unit}`));
 const rows=studyProgress(vs,gs,books,get().stats,get().settings.streak);
 const caption=scope.size?[...scope].map(key=>{const [book,unit]=key.split(':');return `${esc(book.toUpperCase())} · <span>Chapter</span> ${esc(unit)}`;}).join(' / '):'<span>All chapters</span>';
 $('#study-progress').innerHTML=`<p class="progress-scope"><span>Book mastery</span> · ${scope.size?'':(books.size?[...books].map(b=>esc(b.toUpperCase())).join(', '):'<span>No book selected</span>')+' · '}${caption}</p><div class="progress-grid">${rows.map(r=>`<div class="progress-card"><div class="progress-heading"><span id="progress-${r.key}">${r.label}</span><strong>${r.percent}%</strong></div><progress value="${r.mastered}" max="${r.total||1}" aria-labelledby="progress-${r.key}"></progress><small>${r.mastered} / ${r.total} <span>${r.key==='grammar'?'questions mastered':'words mastered'}</span></small></div>`).join('')}</div>`;
}
function persist(){get().session=session;save();}
function vocab(){return Object.entries(data.books).flatMap(([book,b])=>b.units.flatMap(u=>u.vocab.map(v=>({...v,book,unit:u.unit}))));}
function grammar(){return Object.entries(data.books).flatMap(([book,b])=>b.units.flatMap(u=>u.grammar.flatMap(g=>g.questions.map(q=>({...q,book,unit:u.unit,pattern:g.pattern,meaning:g.meaning,patternId:g.id})))));}
function eligible(c){return selected.has(c.book)&&(!units.size||units.has(`${c.book}:${c.unit}`));}
function banner(){return [...selected].some(id=>data.books[id]?.placeholder)?'<p class="banner">PLACEHOLDER sample data — replace with your own textbook content.</p>':'';}
function home(chaptersOpen=false){
 if(!isSignedIn()){route();return;}
 activeKey=null;
 // Preserve unsubmitted practice choices while changing chapter/book checkboxes.
 const focusedUnit=document.activeElement?.dataset?.unit;
 const choices=Object.fromEntries(['direction','mode','length','pattern'].map(id=>[id,$('#'+id)?.value]));
 const stats=get().stats;
 app.innerHTML=homeView({data,selected,units,bookLevel,stats,streak:get().settings.streak,vocab:vocab(),grammar:grammar(),session,banner:banner(),chaptersOpen,esc});
 $('#level').value=vocabLevel;
 $('#level').onchange=()=>{vocabLevel=$('#level').value;updateLevelCount();};
 $('#direction').value=choices.direction||get().settings.direction;
 $('#mode').value=choices.mode||get().settings.mode;
 if(choices.length)$('#length').value=choices.length;
 if(choices.pattern&&[...$('#pattern').options].some(o=>o.value===choices.pattern))$('#pattern').value=choices.pattern;
 const changeBook=(id,checked)=>{checked?selected.add(id):selected.delete(id);units=new Set([...units].filter(u=>selected.has(u.split(':')[0])));home();};
 app.querySelectorAll('[data-book]').forEach(x=>x.onchange=()=>changeBook(x.dataset.book,x.checked));
 app.querySelectorAll('[data-remove-book]').forEach(x=>x.onclick=()=>changeBook(x.dataset.removeBook,false));
 app.querySelectorAll('[data-unit]').forEach(x=>x.onchange=()=>{x.checked?units.add(x.dataset.unit):units.delete(x.dataset.unit);home(true);});
 $('#all-chapters').onclick=()=>{units.clear();home(true);};
 if($('#resume'))$('#resume').onclick=()=>{location.hash='quiz';renderQuiz();};
 const start=(type,weak=false,chapter=null)=>{
  const books=chapter?new Set([chapter.split(':')[0]]):selected;
  const scope=chapter?new Set([chapter]):units;
  let deck;
  if(type==='vocab')deck=levelDeck(vocab(),{books,units:scope,level:vocabLevel,stats,weak,includeFlaggedOutsideUnits:!scope.size});
  else {
   // A chapter shortcut always includes all its grammar patterns.
   const pattern=chapter?'':$('#pattern').value;
   deck=shuffle(grammar().filter(c=>books.has(c.book)&&(!scope.size||scope.has(`${c.book}:${c.unit}`))&&(!pattern||c.patternId===pattern)));
   if($('#length').value!=='all')deck=deck.slice(0,Number($('#length').value));
  }
  if(chapter){selected=books;units=scope;}
  begin(type,deck,{direction:$('#direction').value,mode:$('#mode').value,level:vocabLevel,books:[...books],units:[...scope]},!weak);
 };
 $('#vocab').onclick=()=>start('vocab');$('#weak').onclick=()=>start('vocab',true);$('#grammar').onclick=()=>start('grammar');
 app.querySelectorAll('[data-chapter]').forEach(x=>x.onclick=()=>start(x.dataset.practice,false,x.dataset.chapter));
 updateLevelCount();renderProgress();
 if(focusedUnit)[...app.querySelectorAll('[data-unit]')].find(x=>x.dataset.unit===focusedUnit)?.focus();
}
function updateLevelCount(){const n=levelDeck(vocab(),{books:selected,units,level:vocabLevel,stats:get().stats,includeFlaggedOutsideUnits:!units.size}).length;$('#level-description').textContent=`${n} words · ${vocabLevel==='hard'?'Extra Korean–English footnotes from the student book and workbook, including workbook reviews.':'Only the bottom vocabulary box on each subchapter’s opening page.'}`;}
function begin(type,deck,options={},random=true){if(!isSignedIn()){route();return;}if(!deck.length){alert('No cards match. Choose a book/unit with content, or practise some words before using Weak words.');return;}session={type,deck,answerStreak:0,queue:(random?shuffle(deck):deck).map(c=>c.id),streaks:{},misses:{},first:{},correct:0,wrong:0,options,settings:{...get().settings},answered:false,flipped:false};persist();location.hash='quiz';renderQuiz();}
function renderQuiz(){if(!isSignedIn()){route();return;}renderProgress();if(!session){location.hash='home';return;}if(!session.queue.length){summary();return;}const s=session,savedCard=s.deck.find(c=>c.id===s.queue[0]),pool=s.type==='vocab'?vocab():[],c=pool.find(v=>v.id===savedCard.id&&v.ko===savedCard.ko&&v.en===savedCard.en)||savedCard;let typed=s.options.mode==='typed';let mcq=s.type==='vocab'&&s.options.mode==='mcq';let view;if(s.type==='vocab'){s.cardDirection ||= s.options.direction==='mixed'?(Math.random()<.5?'ko':'en'):s.options.direction;if(mcq){s.choices ||= buildChoices(c,vocab().filter(v=>v.book===c.book&&atLevel(v,s.options.level)),s.cardDirection);if(!s.choices){mcq=false;typed=true;}}view=mcq?vocabChoiceView(c,s.cardDirection,s.choices,esc,currentLanguage(),pool):vocabView(c,s.cardDirection,typed,esc,currentLanguage());if(s.options.mode==='mcq'&&!mcq)view.html='<p class="banner">Not enough distinct answers for four choices. Type the answer for this card.</p>'+view.html;if(!s.answer)s.answer=view.answer;}const done=s.deck.length-s.queue.length;
app.innerHTML=`<a href="#home">← Pause & return home</a><div class="panel">${data.books[c.book]?.placeholder?'<p class="banner">Placeholder sample</p>':''}<p class="eyebrow">${esc(c.book.toUpperCase())} · ${s.type==='vocab'?`${s.options.level==='hard'?'Hard':'Standard'} vocabulary`:'Grammar'} practice</p>${s.type==='vocab'?`<p class="source-note">${sourceNote(c,esc)}</p>`:''}<div class="stats"><span>Correct <b id="live-correct">${s.correct}</b></span><span>Missed <b id="live-wrong">${s.wrong}</b></span><span>Remaining <b>${s.queue.length}</b></span></div><p class="quiz-completion"><strong><span>This quiz</span>: ${Math.round(done/s.deck.length*100)}%</strong> · ${done} / ${s.deck.length} <span>completed</span></p><progress value="${done}" max="${s.deck.length}" aria-label="Cards completed"></progress><small class="muted">Quiz completion and book mastery measure different things.</small>${s.type==='vocab'?view.html:grammarView(c,esc)}${s.type==='vocab'?`<button id="flag" type="button" class="secondary ${get().stats[c.id]?.flagged?'flagged':''}" aria-pressed="${!!get().stats[c.id]?.flagged}">★ Practise this again</button>`:''}<div id="feedback" role="status"></div></div><small>Enter: submit / next · 1–4: choose · Space: flip · J / ←: missed · K / →: got it</small>`;
// Share one action row while keeping the flag available before and after grading.
if(s.type==='vocab'){
 const flagButton=$('#flag'),form=$('#answer-form'),primary=form?.querySelector('button')||$('#mark');
 const actions=document.createElement('div');actions.className='quiz-actions';
 primary.before(actions);actions.append(primary,flagButton);
}
// Keep mixed direction stable when restoring a paused card.
if(s.type==='vocab'&&s.answer!==view.answer){s.answer=view.answer;}persist();
const flip=()=>{if(s.answered||typed||mcq)return;s.flipped=true;$('#flip').classList.add('flipped');$('#reveal').hidden=false;$('#mark').hidden=false;persist();};
const answer=value=>{if(s.answered||!isSignedIn())return;clearCelebration();const correct=typeof value==='boolean'?value:mcq?value===s.answer:matches(value,s.type==='vocab'?view.acceptedAnswer||s.answer:c.answer);s.answerStreak=nextAnswerStreak(s.answerStreak,correct);s.answered=true;s.result=correct;s.submitted=value;s.correct+=correct;s.wrong+=!correct;if(!(c.id in s.first))s.first[c.id]=correct;if(!correct)s.misses[c.id]=(s.misses[c.id]||0)+1;record(c.id,correct);persist();renderProgress();feedback();if(correct)celebrateStreak(s.answerStreak,currentLanguage());};
function feedback(){if(mcq){app.querySelectorAll('input[name=choice]').forEach(x=>{x.checked=x.value===s.submitted;x.nextElementSibling.classList.toggle('answer-correct',x.value===s.answer);x.nextElementSibling.classList.toggle('answer-wrong',x.checked&&!s.result);});}$("#live-correct").textContent=s.correct;$("#live-wrong").textContent=s.wrong;app.querySelectorAll('#answer-form input,#answer-form button:not(#flag),#got,#miss,#flip').forEach(x=>x.disabled=true);if(s.type==='vocab'){$('#reveal').hidden=false;$('#mark')&&($('#mark').hidden=true);}$('#feedback').innerHTML=`<div class="feedback ${s.result?'':'bad'}"><strong>${s.result?'Correct ✓':'Keep practising — you’ll see this again.'}</strong>${s.type==='grammar'?`<p>Answer: <b>${esc(c.answer)}</b></p><p><b>${esc(c.pattern)}</b> — ${esc(c.meaning)}</p><p>${esc(c.explanation)}</p>`:''}</div><button id="next">Continue →</button>`;$('#next').onclick=()=>{const next=advance(s.queue,s.streaks,s.result,s.settings.streak,s.settings.min,s.settings.max);Object.assign(s,next,{answered:false,flipped:false,answer:null,cardDirection:null,choices:null,submitted:null});persist();renderQuiz();};$('#next').focus();}
if(s.type==='vocab'){if($('#flip'))$('#flip').onclick=flip;$('#flag').onclick=()=>{flag(c.id);$('#flag').classList.toggle('flagged',!!get().stats[c.id].flagged);$('#flag').setAttribute('aria-pressed',get().stats[c.id].flagged);};if(!typed&&!mcq){$('#got').onclick=()=>answer(true);$('#miss').onclick=()=>answer(false);if(s.flipped)flip();}else if($('#flip'))$('#flip').disabled=true;}
if($('#answer-form'))$('#answer-form').onsubmit=e=>{e.preventDefault();answer($('#answer')?.value||$('input[name=choice]:checked')?.value||'');};
activeKey=e=>{if(e.target.closest('summary, #flag, .site-header'))return;if(/TEXTAREA|SELECT/.test(e.target.tagName)||(e.target.tagName==='INPUT'&&!['radio','checkbox'].includes(e.target.type)))return;if(e.key==='Enter'){e.preventDefault();if(s.answered)$('#next').click();else if($('#answer-form'))$('#answer-form').requestSubmit();else flip();}if(s.answered)return;if(e.code==='Space'&&s.type==='vocab'&&!typed&&!mcq){e.preventDefault();flip();}if(s.flipped&&!typed&&!mcq&&s.type==='vocab'){if(['ArrowRight','k','K'].includes(e.key)){e.preventDefault();answer(true);}if(['ArrowLeft','j','J'].includes(e.key)){e.preventDefault();answer(false);}}if((s.type==='grammar'||mcq)&&/^[1-4]$/.test(e.key)){const x=app.querySelectorAll('input[name=choice]')[Number(e.key)-1];if(x)x.checked=true;}};
if(s.answered)feedback();else $('#answer')?.focus();}
function summary(){activeKey=null;const s=session,flags=Object.fromEntries(Object.entries(get().stats).map(([id,v])=>[id,v.flagged]));const missed=again(s.deck,s.misses,flags,true);app.innerHTML=`<p class="eyebrow">Session complete</p><h1>Small steps, real progress.</h1><div class="panel"><div class="stats"><span><b>${s.deck.length}</b> total cards</span><span><b>${Math.round(Object.values(s.first).filter(Boolean).length/s.deck.length*100)}%</b> first-try accuracy</span><span><b>${Math.round(s.correct/(s.correct+s.wrong)*100)}%</b> all-attempt accuracy</span></div><h2>Review list</h2>${missed.length?`<table><thead><tr><th>Word / question</th><th>Misses</th></tr></thead><tbody>${missed.map(c=>`<tr><td>${esc(c.ko||questionText(c.prompt))}<br><small>${esc(c.en?meaning(vocab().find(v=>v.id===c.id&&v.en===c.en)||c,currentLanguage()):c.pattern)} ${flags[c.id]?'★ Flagged':''}</small></td><td>${s.misses[c.id]||0}</td></tr>`).join('')}</tbody></table>`:'<p>No missed or flagged cards. Well done!</p>'}<div class="actions"><button id="missed" ${!missed.length?'disabled':''}>Practise missed ${s.type==='vocab'?'words':'questions'} again</button><button id="all" class="secondary">Practise everything again, including the ones I got right</button><button id="home" class="secondary">Back to home</button></div></div>`;$('#missed').onclick=()=>begin(s.type,missed,s.options);$('#all').onclick=()=>begin(s.type,again(s.deck),s.options);$('#home').onclick=()=>{session=null;persist();location.hash='home';};}
function settings(){activeKey=null;const s=get().settings;app.innerHTML=`<p class="eyebrow">Make it yours</p><h1>Study settings</h1><form id="settings" class="panel"><label>Correct streak needed (1–3)<input name="streak" type="number" min="1" max="3" value="${s.streak}" required></label><div class="grid"><label>Minimum cards before repeat<input name="min" type="number" min="0" max="100" value="${s.min}" required></label><label>Maximum cards before repeat<input name="max" type="number" min="0" max="100" value="${s.max}" required></label></div><label>Default direction<select name="direction"><option value="ko">KO → EN</option><option value="en">EN → KO</option><option value="mixed">Mixed</option></select></label><label>Default mode<select name="mode"><option value="mcq">Multiple choice (4 options)</option><option value="self">Self-mark</option><option value="typed">Typed</option></select></label><label>Theme<select name="theme"><option value="green">Green</option><option value="black">Black</option><option value="white">White</option><option value="autumn">Autumn</option><option value="purple-yellow">Purple–Yellow</option><option value="pink-purple">Pink–Purple</option><option value="seoul">Seoul</option></select></label><button>Save settings</button><p id="status" role="status"></p></form><button id="reset" class="danger">Reset all progress</button>`;for(const k of ['direction','mode','theme'])$(`[name=${k}]`).value=s[k];$('#settings').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),next=Object.fromEntries(f);for(const k of ['streak','min','max'])next[k]=Number(next[k]);if(next.min>next.max){$('#status').textContent='Minimum distance must not exceed maximum.';return;}get().settings=next;save();theme();renderProgress();$('#status').textContent='Saved. New settings apply to your next session.';};$('#reset').onclick=()=>{if(confirm('Reset all card statistics, flags, and the current session? Imported content and settings will stay.')){get().stats={};session=null;persist();renderProgress();$('#status').textContent='Progress reset.';}};}
function imports(){activeKey=null;if(!canManageData()){app.innerHTML='<h1>Admin access only</h1><div class="panel"><p>Import and backup are available only to the administrator.</p><a class="button" href="#signin">Sign in</a></div>';return;}app.innerHTML=`<p class="eyebrow">Your own learning material</p><h1>Import & backup</h1><div class="panel"><label>Target book<select id="book">${data.registry.map(b=>`<option value="${esc(b.id)}">${esc(b.title)}</option>`).join('')}</select></label><label>Paste book JSON<textarea id="json" placeholder='{"book":"3b","units":[…]}'></textarea></label><button id="import-json">Merge JSON</button><label>Or upload vocabulary CSV<input id="csv" type="file" accept=".csv,text/csv"></label><small>Columns: book, unit, ko, en, example. Book must match your selection. Matching IDs replace existing entries.</small><p id="status" role="status"></p></div><div class="panel"><h2>Keep a copy</h2><p>Backup includes all loaded book content, imports, settings, and progress. Restoring replaces your saved data.</p><button id="export">Export full backup</button><label>Import backup<input id="backup" type="file" accept=".json,application/json"></label></div>`;$('#book').value='3b';const run=async f=>{try{await requireAdmin();await f();data=await load();$('#status').textContent='Imported successfully.';}catch(e){($('#status')||$('#warning')).textContent=e.message;}};$('#import-json').onclick=()=>run(()=>{const b=JSON.parse($('#json').value);if(b.book!==$('#book').value)throw Error('JSON book ID must match the selected book.');importBooks(b);});$('#csv').onchange=e=>run(async()=>{if(e.target.files[0])importBooks(csv(await e.target.files[0].text(),$('#book').value));});$('#backup').onchange=e=>run(async()=>{if(!e.target.files[0])return;const b=JSON.parse(await e.target.files[0].text());if(confirm('Replace saved content and progress with this backup?')){backup(b);session=null;theme();}});$('#export').onclick=async()=>{try{await requireAdmin();}catch(e){alert(e.message);return;}const output={...get(),imports:Object.values(data.books),session:null};const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='korean-study-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};}
function route(){if(location.hash!=='#quiz'||!isSignedIn())clearCelebration();warning();theme();renderProgress();const r=studyRoute(location.hash.slice(1),isSignedIn());$('#study-progress').hidden=!isSignedIn()||r==='students';document.querySelectorAll('[data-account-only],.level-switch').forEach(x=>x.hidden=!isSignedIn());if(r==='students'){activeKey=null;adminDashboard(app,esc);}else if(['account','signin','signup'].includes(r)){activeKey=null;accountView(app,esc);}else if(r==='quiz')renderQuiz();else if(r==='settings')settings();else if(r==='import')imports();else home();}
initLanguage();
initMobileMenu();
// Only repaint quiz content: preserve the question, order, grading and unsent input.
document.addEventListener('study-language-change',()=>{
 if(location.hash!=='#quiz'||!session)return;
 const draft=$('#answer')?.value,chosen=$('input[name=choice]:checked')?.value;
 renderQuiz();
 if(draft!=null&&$('#answer'))$('#answer').value=draft;
 if(chosen&&!session.answered)app.querySelectorAll('input[name=choice]').forEach(x=>x.checked=x.value===chosen);
});
$('#theme-select').onchange=e=>{get().settings.theme=e.target.value;save();theme();};
function initLevelSelector(){
 const levels=[...new Set(data.registry.map(b=>b.id.replace(/[ab]$/i,'')))];
 const label=document.createElement('label');label.className='level-switch';
 label.innerHTML=`<span>Level</span><select id="book-level">${levels.map(level=>`<option value="${esc(level)}">${esc(level)}</option>`).join('')}</select>`;
 $('.header-controls').append(label);$('#book-level').value=bookLevel;
 $('#book-level').onchange=e=>{bookLevel=e.target.value;if(!['','#home'].includes(location.hash))location.hash='home';else home();};
}
window.addEventListener('hashchange',route);window.addEventListener('keydown',e=>activeKey?.(e));
try{data=await load();initLevelSelector();await initAccounts((profileChanged=true)=>{if(profileChanged){session=get().session;route();}else renderProgress();});if(session?.type==='vocab'&&!session.options.level){session=null;persist();}route();}catch(e){app.innerHTML=`<h1>Could not load your books</h1><p class="error">${esc(e.message)}</p><p>Serve this folder using <code>python -m http.server 8000</code>, then visit localhost:8000.</p>`;}
