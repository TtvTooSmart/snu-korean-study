// An original pixel sprite: no image download, package, audio or pointer handling.
export const catSprite=`<svg viewBox="0 0 26 20" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
 <g class="cat-tail"><path fill="var(--cat-outline)" d="M6 11H3V9H1V4h3v5h3z"/><path fill="var(--cat-fur)" d="M2 5h1v5h3v1H2z"/></g>
 <path fill="var(--cat-outline)" d="M5 9h12V3h3v2h3V3h2v10h-2v2h-2v3H7v-2H5z"/>
 <path fill="var(--cat-fur)" d="M6 10h11V5h2v2h5v5h-2v2h-2v3H8v-2H6z"/>
 <path fill="var(--cat-cream)" d="M18 11h6v1h-2v2h-4zM9 15h10v2H9z"/>
 <path fill="var(--cat-stripe)" d="M8 10h2v3H8zM12 10h2v3h-2zM18 7h2v2h-2z"/>
 <path fill="#e49f99" d="M18 4h1v2h-1zM24 4h1v2h-1z"/>
 <g class="cat-eyes"><path fill="#30211c" d="M19 10h1v1h-1zM23 10h1v1h-1z"/></g>
 <path fill="#9c4b47" d="M22 12h1v1h-1z"/>
 <path fill="#4c8079" d="M17 14h4v1h-4z"/><path fill="#f7d475" d="M20 15h1v1h-1z"/>
 <g class="cat-paws"><path fill="var(--cat-outline)" d="M8 17h3v2H7v-1h1zM18 17h3v2h-4v-1h1z"/><path fill="var(--cat-cream)" d="M8 17h2v1H8zM18 17h2v1h-2z"/></g>
</svg><span class="cat-nap">z z z</span>`;
export function catDestination(width,size=78,rng=Math.random){return Math.round(8+Math.max(0,width-size-16)*rng());}
let cat=null,timer,enabled=false;
function removeCat(){clearTimeout(timer);timer=null;cat?.remove();cat=null;}
function wander(){
 if(!cat||!enabled||document.hidden)return;
 const x=catDestination(window.innerWidth,window.innerWidth<650?58:78),old=parseFloat(cat.style.left)||0;
 const duration=Math.max(2200,Math.abs(x-old)/45*1000);
 cat.classList.remove('napping');cat.classList.add('walking');cat.style.setProperty('--cat-facing',x<old?'-1':'1');
 cat.style.transition=`left ${duration}ms linear`;cat.style.left=`${x}px`;
 timer=setTimeout(()=>{if(!cat)return;cat.classList.remove('walking');cat.classList.toggle('napping',Math.random()<.45);timer=setTimeout(wander,2000+Math.random()*4500);},duration);
}
export function updateAutumnCat(active){
 enabled=active;
 if(!active){removeCat();return;}
 if(cat)return;
 cat=document.createElement('div');cat.className='autumn-cat';cat.setAttribute('aria-hidden','true');cat.innerHTML=catSprite;
 const coats=[['#d28a45','#a76132','#f7dfb5'],['#65544b','#423932','#eadbc4'],['#b6a28b','#786d61','#fff0d9']];
 const [fur,stripe,cream]=coats[Math.floor(Math.random()*coats.length)];
 cat.style.setProperty('--cat-fur',fur);cat.style.setProperty('--cat-stripe',stripe);cat.style.setProperty('--cat-cream',cream);
 cat.style.left=`${catDestination(window.innerWidth,window.innerWidth<650?58:78)}px`;document.body.append(cat);
 timer=setTimeout(wander,1000);
}
