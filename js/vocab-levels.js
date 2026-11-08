import {inSelectedUnits} from './vocab-sources.js';
// Unclassified user additions default to Standard. Packaged 3B cards are classified.
export function atLevel(card,level='standard'){
 return (card.difficulty||'standard')===level;
}
export function levelDeck(cards,{books,units=new Set(),level='standard',stats={},weak=false,includeFlaggedOutsideUnits=true}){
 const deck=cards.filter(c=>books.has(c.book)&&atLevel(c,level)&&
  (inSelectedUnits(c,units)||(includeFlaggedOutsideUnits&&stats[c.id]?.flagged)));
 return weak?deck.filter(c=>stats[c.id]?.missed||(includeFlaggedOutsideUnits&&stats[c.id]?.flagged)).sort((a,b)=>
  (stats[b.id]?.missed||0)/(stats[b.id]?.seen||1)-(stats[a.id]?.missed||0)/(stats[a.id]?.seen||1)):deck;
}
