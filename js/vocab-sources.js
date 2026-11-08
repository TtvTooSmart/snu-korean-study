// Keep textbook and workbook references separate: their printed page numbers differ.
export function vocabSources(card) {
 return card.sources?.length ? card.sources : card.sourcePage ? [{
  sourceType:card.sourceType||'student-book', sourcePage:card.sourcePage,
  subchapter:card.subchapter||''
 }] : [];
}
export function sourceNote(card,esc) {
 return vocabSources(card).map(source => {
  const label=source.sourceType==='workbook'?'Workbook page':'Student book page';
  return `<span>${esc(source.subchapter||'')}</span> · <span>${label}</span> ${esc(source.sourcePage)}`;
 }).join(' · ');
}
// Review words belong to every unit covered by that review. A shared word appears once.
export function inSelectedUnits(card,units) {
 return !units.size || [card.unit,...(card.relatedUnits||[])].some(unit=>units.has(`${card.book}:${unit}`));
}
