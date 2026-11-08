# SNU Study

A framework-free Korean vocabulary and grammar study app. All data stays in this browser; no account, backend, tracking, external fonts, or build step.

## Run

Extract the ZIP, open a terminal in `snu-study`, then run:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Use a modern browser with JavaScript enabled. Opening `index.html` directly with `file://` will not work because JSON is fetched. Keep the same host and port to retain the same localStorage data. With all files downloaded, no internet connection is needed. Node is only needed to run tests:

```sh
node --test tests/*.test.js
```

## Study

Select one or more available books and optionally units (no checked units means all). Vocabulary supports KO→EN, EN→KO and mixed direction, self-marking and typed answers. Typed answers ignore surrounding whitespace/case and normalize Unicode; `/` or `;` separates accepted alternatives. Punctuation and Korean spelling must match.

After revealing a flashcard, mark Got it or Missed. A miss resets its streak to zero and inserts it later in the remaining queue; even a single missed card stays available. Correct answers repeat until the selected streak (1–3) is reached. The repeat range is the number of other cards ahead; it is clamped to the remaining queue size. Correct/Missed counts are attempts; Remaining counts unique unfinished cards. First-try accuracy counts each original card once. Session state is saved after every action; use Resume on the home screen.

A star marks a word for future practice. Stars stay set until you explicitly unstar them. Flagged words in selected books are included in the next vocabulary round even when outside the selected units. Weak words includes all previously missed or flagged words in the selected books, ordered by lifetime miss rate. Vocabulary mastery means the saved consecutive correct count meets the current streak setting. Grammar accuracy uses all recorded attempts.

Grammar offers 10, 20 or all questions and a pattern filter. Fewer questions are used if fewer match. Both quiz summaries can retry missed/flagged items or the complete original session deck.

Keyboard: Enter submits/advances; 1–4 select MCQ options; Space flips; J/Left marks missed; K/Right marks correct. Shortcuts are suppressed while typing. Tab navigates all controls. Theme follows the OS unless overridden; reduced-motion preferences are respected.

## Add a book

1. Add `data/4a.json` using the schema below.
2. Set the corresponding entry in `data/books.json` to `available: true`.
3. Reload. No JavaScript changes are needed.

Registry entries contain `id`, `title`, `available`. IDs must match filenames. 1A through 4B are listed; only 3B ships with content. Imported content can also activate a listed unavailable book.

```json
{
  "book": "4a",
  "placeholder": false,
  "units": [{
    "unit": 1,
    "title": "Unit title",
    "vocab": [{"id":"4a-u1-v1","ko":"기쁘다","en":"happy; glad","example":"친구를 만나서 기뻐요.","pos":"adjective"}],
    "grammar": [{
      "id":"4a-u1-g1","pattern":"-고 싶다","meaning":"want to",
      "questions":[{"id":"4a-u1-g1-q1","type":"mcq","prompt":"I want to go: 가고 ___.","choices":["싶어요","있어요","없어요","말아요"],"answer":"싶어요","explanation":"-고 싶다 expresses a desire."}]
    }]
  }]
}
```

All item and question IDs must be unique, preferably prefixed with the book ID; never change IDs if retaining progress. Units are unique positive integers. Both vocab and grammar arrays are required (empty is fine). A grammar question is `mcq` (exactly four distinct choices including the answer) or `fill` (omit choices). Explanation, prompt and answer are required. Optional extra source metadata is retained. `placeholder: true` displays a banner.

## Import and export

Paste a single book JSON on Import & backup; its book ID must match the target selector. Imported units merge with packaged data; matching vocabulary/grammar IDs replace items. For a grammar replacement, provide its complete question list. Imports are validated before saved content is changed.

CSV vocabulary format:

```csv
book,unit,ko,en,example
3b,15,기운이 나다,feel energetic,친구를 만나면 기운이 나요.
3b,15,마음이 편안해지다,"feel calm; feel relaxed",산책을 하면 마음이 편안해져요.
```

All five headers are required; example cells may be empty. Quoted commas, escaped double quotes and embedded newlines are supported. All rows must match the selected book. CSV IDs are derived from book, unit and Korean word, so re-importing updates those imported entries. CSV adds entries; it does not match packaged IDs automatically.

Export downloads a versioned JSON backup containing the full merged book content, progress and settings. Restore validates it, requests confirmation, then replaces saved data. Current sessions are intentionally excluded from portable backups. Reset progress removes statistics, flags and active session but preserves imports/settings. Browser storage is origin-specific and may be cleared by the browser. Export regularly. If storage is denied or full, the app continues in memory and displays a warning.

## Design and implementation

Calm green/cream palette, responsive book cards and a large central study card. Korean uses Noto Sans KR if locally installed, then Apple SD Gothic Neo, Malgun Gothic and sans-serif. Nothing requires a network font.

- `app.js`: navigation, selection and quiz session orchestration
- `quiz-vocab.js`, `quiz-grammar.js`: quiz views
- `queue.js`: pure shuffled retry and answer-matching functions
- `storage.js`: guarded persistence with in-memory fallback
- `data-loader.js`: validation, registry loading, merging, CSV and backup parsing
- `tests/queue.test.js`: plain Node tests

The latest request superseded placeholder sample content: 3B uses the supplied book's indexes, with original practice questions. See data source metadata and CONTENT_NOTES.md for coverage and limitations. The source textbook PDF is not included.

## Deploy on Vercel

Import this GitHub repository into Vercel. Keep the root directory at the repository root and Framework Preset at Other. `vercel.json` selects no build/install command and serves the static project directly. No environment variables are required. Hash routes work without catch-all rewrites.

Progress stays in each browser's localStorage; it does not sync between devices or deployment domains. Export before moving from localhost or a preview URL to the production domain, then restore the backup there.
