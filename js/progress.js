// Count unique mastered items, not attempts. Callers supply the selected chapter scope.
export function mastery(items, stats, streak = 1) {
  const ids = [...new Set(items.map(item => item.id))];
  const mastered = ids.filter(id => (stats[id]?.streak || 0) >= streak).length;
  return {mastered, total:ids.length, percent:ids.length ? Math.round(mastered / ids.length * 100) : 0};
}
export function studyProgress(vocab, grammar, books, stats, streak = 1) {
  const words = vocab.filter(card => books.has(card.book));
  return [
    {key:'grammar', label:'Grammar', ...mastery(grammar.filter(card => books.has(card.book)), stats, streak)},
    {key:'easy', label:'Easy vocabulary', ...mastery(words.filter(card => (card.difficulty || 'standard') === 'standard'), stats, streak)},
    {key:'hard', label:'Hard vocabulary', ...mastery(words.filter(card => card.difficulty === 'hard'), stats, streak)}
  ];
}
