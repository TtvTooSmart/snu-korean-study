// Pure queue transitions; injected RNG keeps tests deterministic.
export function shuffle(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function advance(queue,streaks,correct,needed=1,min=3,max=8,rng=Math.random){const [id,...rest]=queue;const next={...streaks,[id]:correct?(streaks[id]||0)+1:0};if(next[id]<needed){const lo=Math.min(min,rest.length),hi=Math.min(max,rest.length);rest.splice(lo+Math.floor(rng()*(hi-lo+1)),0,id);}return {queue:rest,streaks:next};}
export function again(deck,misses={},flags={},onlyMissed=false,rng=Math.random){return shuffle(deck.filter(c=>!onlyMissed||misses[c.id]>0||flags[c.id]),rng);}
export function matches(value,answer){const norm=s=>s.normalize('NFC').trim().toLocaleLowerCase().replace(/\s+/g,' ');return answer.split(/[;/]/).some(a=>norm(a)===norm(value));}
