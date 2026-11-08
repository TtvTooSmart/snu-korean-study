import {canManageData,fetchStudentProgress} from './account.js';
import {load} from './data-loader.js';
import {renderStudentBooks} from './admin-progress.js';

// Student records stay only in this page's closure, never localStorage/exports.
export function adminDashboard(app,esc) {
 const root=document.createElement('section');root.className='admin-dashboard';
 app.replaceChildren(root);
 const active=()=>root.isConnected&&location.hash==='#students'&&canManageData();
 if(!canManageData()){
  root.innerHTML='<h1>Admin access only</h1><p>This page is available only to the administrator.</p>';
  return;
 }
 let data,students=[],total=0,offset=0,search='',sequence=0;
 root.innerHTML='<h1>Student progress</h1><p role="status">Loading students…</p>';
 const date=value=>value?new Date(value).toLocaleString(document.documentElement.lang||'en'):'No synced progress yet';

 function render(error='') {
  if(!active())return;
  root.innerHTML=`<p class="eyebrow">Administrator</p><h1>Student progress</h1><p>Latest synced progress only. Unsynced answers and guest activity are not shown.</p><p>Each student shows only books they have practised.</p><p><small>Progress uses published books and one correct answer after the last miss. Student device settings may use a different streak target.</small></p><form class="admin-filters"><label><span>Search student email</span><input id="student-search" type="search" maxlength="100" value="${esc(search)}"></label><button>Search</button><button type="button" id="student-refresh" class="secondary">Refresh</button></form><p role="status" class="${error?'error':''}">${error?esc(error):`<span>Students</span>: ${total}`}</p><div id="student-results">${students.length?students.map(student=>`<article class="panel student-card"><h2>${esc(student.email)}</h2><p><small><span>Last synced</span>: ${esc(date(student.synced_at))}</small></p>${renderStudentBooks(data.books,student,esc)}</article>`).join(''):'<div class="panel"><p>No students match this search.</p></div>'}</div><div class="actions"><button id="students-prev" class="secondary" ${offset===0?'disabled':''}>Previous</button><span>${total?offset+1:0}–${Math.min(offset+25,total)} / ${total}</span><button id="students-next" class="secondary" ${offset+25>=total?'disabled':''}>Next</button></div>`;
  root.querySelector('form').onsubmit=e=>{e.preventDefault();search=root.querySelector('#student-search').value.trim();offset=0;refresh();};
  root.querySelector('#student-refresh').onclick=()=>refresh();
  root.querySelector('#students-prev').onclick=()=>{offset=Math.max(0,offset-25);refresh();};
  root.querySelector('#students-next').onclick=()=>{offset+=25;refresh();};
 }
 async function refresh() {
  const request=++sequence;
  root.querySelectorAll('button').forEach(button=>button.disabled=true);
  try {
   const response=await fetchStudentProgress({search,offset,limit:25});
   if(!active()||request!==sequence)return;
   students=response.students;total=response.total;
   if(offset>0&&offset>=total){offset=Math.max(0,Math.floor((total-1)/25)*25);return refresh();}
   render();
  } catch(error) {
   if(!active()||request!==sequence)return;
   students=[];total=0;render(error.message||'Could not load students. Please try again.');
  }
 }
 load({includeImports:false}).then(loaded=>{
  if(!active())return;
  data=loaded;
  if(!Object.keys(data.books).length){root.innerHTML='<h1>Student progress</h1><p>No published books are available.</p>';return;}
  render();refresh();
 }).catch(()=>{if(active())root.innerHTML='<h1>Student progress</h1><p>Could not load published books. Please reload this page.</p>';});
}
