// Home markup is separate from routing and quiz state.
export function homeView({data, selected, units, bookLevel, stats, streak, vocab, grammar, session, banner, chaptersOpen, esc}) {
  const books = data.registry.filter(b => b.id.replace(/[ab]$/i, '') === bookLevel);
  const cards = books.map(b => {
    const words = vocab.filter(c => c.book === b.id);
    const mastered = words.filter(c => (stats[c.id]?.streak || 0) >= streak).length;
    const questions = grammar.filter(c => c.book === b.id);
    const seen = questions.reduce((n,c) => n + (stats[c.id]?.seen || 0),0);
    const missed = questions.reduce((n,c) => n + (stats[c.id]?.missed || 0),0);
    return `<label class="book"><input type="checkbox" data-book="${esc(b.id)}" ${selected.has(b.id)?'checked':''} ${b.available?'':'disabled'}><span class="book-letter">${esc(b.id.slice(-1).toUpperCase())}</span><strong>${esc(b.title)}</strong><small>${b.available?`${words.length?Math.round(mastered/words.length*100):0}% vocab mastered · ${seen?Math.round((seen-missed)/seen*100)+'%':'—'} grammar accuracy`:'Coming soon'}</small></label>`;
  }).join('');
  const chapters = [...selected].flatMap(id => (data.books[id]?.units || []).map(u => {
    const key = `${id}:${u.unit}`;
    return `<div class="chapter-row"><label><input type="checkbox" data-unit="${esc(key)}" ${units.has(key)?'checked':''}><span><strong>${esc(id.toUpperCase())} · <span>Chapter</span> ${u.unit}</strong><span lang="ko">${esc(u.title)}</span></span></label><div class="chapter-actions"><button class="secondary" data-chapter="${esc(key)}" data-practice="learn">Learn</button><button class="secondary" data-chapter="${esc(key)}" data-practice="vocab">Vocabulary</button><button class="secondary" data-chapter="${esc(key)}" data-practice="grammar">Grammar</button></div></div>`;
  })).join('');
  return `<p class="eyebrow">For SNU students</p><h1>A little practice.<br>A little more confidence.</h1><p>Choose your books, find your focus, and keep going.</p>${session&&!(session.type==='learn'&&session.phase==='complete')?'<button id="resume" class="secondary">Resume unfinished session</button>':''}${banner}
  <section class="panel"><div class="section-heading"><h2>01 · Choose your books</h2><span class="level-badge"><span>Level</span> ${esc(bookLevel)}</span></div><div class="book-options">${cards}</div>
    <div class="selected-books"><small>Selected books</small> ${selected.size?[...selected].map(id=>`<button class="book-chip secondary" data-remove-book="${esc(id)}" aria-label="Remove ${esc(id.toUpperCase())}">${esc(id.toUpperCase())} ×</button>`).join(''):'<small>No book selected</small>'}</div>
    <details id="chapters" class="chapter-picker" ${chaptersOpen?'open':''}><summary><span>Choose chapters</span><small><span>Optional</span> · ${units.size?`<span>Selected chapters</span>: ${units.size}`:'<span>All chapters</span>'}</small></summary><div class="chapter-content"><p class="chapter-help">Select chapters for the main quiz buttons, or start a chapter directly below. Vocabulary uses the difficulty and direction selected in your practice settings.</p><button id="all-chapters" class="secondary">Use all chapters</button>${chapters||'<p>No book selected</p>'}</div></details>
  </section>
  <section class="panel"><h2>02 · Choose your practice</h2><div class="practice-grid">
    <label><span>Vocabulary difficulty</span><select id="level"><option value="standard">Easy</option><option value="hard">Hard</option></select></label>
    <label><span>Vocabulary direction</span><select id="direction"><option value="ko">Korean → English</option><option value="en">English → Korean</option><option value="mixed">Mixed</option></select></label>
    <label><span>Vocabulary mode</span><select id="mode"><option value="mcq">Multiple choice (4 options)</option><option value="self">Flashcards / self-mark</option><option value="typed">Typed answers</option></select></label>
    <label class="pattern-field"><span>Grammar pattern</span><select id="pattern"><option value="">All patterns</option>${[...new Map(grammar.filter(c=>selected.has(c.book)&&(!units.size||units.has(`${c.book}:${c.unit}`))).map(c=>[c.patternId,c])).values()].map(c=>`<option value="${esc(c.patternId)}">${esc(c.pattern)}</option>`).join('')}</select></label>
    <label><span>Grammar length</span><select id="length"><option>10</option><option>20</option><option value="all">All</option></select></label>
  </div><p id="level-description" role="status"></p><div class="actions"><button id="learn">Learn vocabulary</button><button id="vocab">Vocabulary Quiz</button><button id="grammar">Grammar Quiz</button><button id="weak" class="secondary">Weak words</button><a id="review" class="button secondary" href="#review">Saved vocabulary</a></div><small>Weak words: previously missed or flagged cards, ordered by lifetime miss rate. Flagged words also appear in your next vocabulary round.</small></section>`;
}
