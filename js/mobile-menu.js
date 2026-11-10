// A normal-flow disclosure: hidden controls leave the tab order via mobile CSS.
// Desktop navigation stays visible and does not depend on the menu state.
export function initMobileMenu() {
 const button=document.querySelector('#mobile-menu-toggle');
 if(!button)return;
 const root=document.documentElement;
 const mobile=window.matchMedia('(max-width:760px)');
 const setOpen=(open,restoreFocus=false)=>{
  root.dataset.mobileMenuOpen=String(open);
  button.setAttribute('aria-expanded',String(open));
  if(restoreFocus&&mobile.matches)button.focus();
 };
 const close=()=>{
  const focusedInMenu=document.activeElement?.closest('#site-navigation,#header-controls,#study-progress');
  setOpen(false,!!focusedInMenu);
 };
 button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&mobile.matches&&button.getAttribute('aria-expanded')==='true'){
   event.preventDefault();setOpen(false,true);
  }
 });
 document.querySelector('#site-navigation')?.addEventListener('click',event=>{
  if(event.target.closest('a'))close();
 });
 window.addEventListener('hashchange',close);
 mobile.addEventListener('change',()=>setOpen(false));
 setOpen(false);
}
