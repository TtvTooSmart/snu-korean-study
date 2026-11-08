import {startLearnPractice,answerLearnQuestion,continueLearn,nextLearnBatch} from './learn-session.js';
import {learnSessionView} from './learn-view.js';
import {translateText} from './i18n.js';

// The app owns account storage and sync; this controller handles interaction.
export function mountLearnSession({app,session,esc,language,commit,restart,choose,stats={},toggleReview}) {
 app.innerHTML=learnSessionView(session,esc,language,stats);
 app.querySelectorAll('[data-review-word]').forEach(button=>button.onclick=()=>{
  const saved=toggleReview?.(button.dataset.reviewWord);
  if(saved===undefined)return;
  button.setAttribute('aria-pressed',String(saved));button.classList.toggle('flagged',saved);
  button.textContent=translateText(saved?'★ Saved for review':'★ Save this vocab for review',language);
 });
 let busy=false;
 const change=next=>{if(busy||next===session)return;busy=true;commit(next);};
 const bind=(id,action)=>{const button=app.querySelector(id);if(button)button.onclick=action;};
 bind('#learn-practise',()=>change(startLearnPractice(session,language)));
 bind('#learn-continue',()=>change(continueLearn(session,language)));
 bind('#learn-next-set',()=>change(nextLearnBatch(session)));
 bind('#learn-restart',restart);
 bind('#learn-choose-chapter',choose);
 const form=app.querySelector('#learn-answer-form');
 if(form)form.onsubmit=event=>{
  event.preventDefault();
  if(busy||session.answered)return;
  const typed=app.querySelector('#answer');
  const value=typed?typed.value:app.querySelector('input[name="learn-choice"]:checked')?.value;
  if(typed&&!value.trim()){
   typed.setCustomValidity(translateText('Type your answer.',language));typed.reportValidity();
   typed.oninput=()=>typed.setCustomValidity('');return;
  }
  const result=answerLearnQuestion(session,value);
  if(!result.record)return;
  busy=true;commit(result.session,result.record);
 };
 if(session.answered)app.querySelector('#learn-continue')?.focus();
 else if(session.phase==='practice')app.querySelector('#answer')?.focus();
 else app.focus();
 return event=>{
  if(event.target.closest('.site-header,a,select,textarea'))return;
  const typing=event.target.matches('input:not([type=radio]):not([type=checkbox])');
  if(event.key==='Enter'){
   // Native button/input activation and form submission must happen only once.
   if(typing||event.target.closest('button'))return;
   event.preventDefault();
   if(session.phase==='practice'&&!session.answered)form?.requestSubmit();
   else app.querySelector('#learn-continue,#learn-practise,#learn-next-set,#learn-choose-chapter')?.click();
  }
  if(!typing&&session.phase==='practice'&&!session.answered&&/^[1-3]$/.test(event.key)){
   const choice=app.querySelectorAll('input[name="learn-choice"]')[Number(event.key)-1];
   if(choice){event.preventDefault();choice.checked=true;}
  }
 };
}
