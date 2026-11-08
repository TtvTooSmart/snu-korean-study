# SNU Study

A framework-free Korean vocabulary and grammar study app. Guest study stores data in this browser. Optional managed accounts can sync progress after the setup in ACCOUNT_SETUP.md. No tracking, external fonts, framework or build step.

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

A star marks a word for future practice. Stars stay set until you explicitly unstar them. Flagged words are included in the next vocabulary round within the selected books, difficulty and chapters. Weak words includes all previously missed or flagged words in the selected books, ordered by lifetime miss rate. Vocabulary mastery means the saved consecutive correct count meets the current streak setting. Grammar accuracy uses all recorded attempts.

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

## Four-choice vocabulary update

Multiple choice is now the default vocabulary mode, including a one-time upgrade for existing saved settings. Each card has one correct option and three shuffled distractors from the same book. Duplicate choices, identical prompts, and overlapping accepted alternatives are excluded. Choose using tap/click or 1–4, then Check answer/Enter. The correct option is shown after submission, and wrong answers use the same retry queue. Choices and direction remain stable when pausing/resuming. Flashcards and typed answers remain available in the mode selector. If a custom book has too few distinct choices, that card explicitly falls back to typed mode.

Automated tests cover four-choice generation, retry queues, textbook classifications, progress, preference migration and optional cloud sync. Run `npm test` for the current suite.

## Standard / Hard vocabulary and grammar hints

Standard is now the default: only the bottom vocabulary boxes on each subchapter's first page (198 cards). Hard contains Korean–English bottom notes from the other student-book pages plus workbook lesson and review footnotes (366 cards). Student-book cultural-page notes stay under the preceding subchapter. Student-book examples: 10-1 Standard=p24, Hard=p25–29; 10-2 begins p30. The source page and subchapter are displayed on each card. Word location determines the category, not perceived difficulty. Standard and Hard decks are separate, including flagged cards, weak-word practice and distractor choices. The deck now has 564 cards: 198 Standard and 366 Hard. Existing IDs and progress remain valid. The workbook contributes 130 footnote entries: 122 new cards and 8 repeated entries merged with matching Hard cards. Multiple source references and accepted English alternatives are preserved. Workbook review notes are included when any unit covered by that review is selected.

Vocabulary JSON can add `difficulty` (`standard` or `hard`), `subchapter` (e.g. `10-1`), `sourcePage` (printed page number), and `sourceType` (`student-book` or `workbook`). Optional `sources` stores every occurrence as `{sourceType, sourcePage, subchapter, units, gloss}`; `relatedUnits` lists additional unit filters that include review/shared words. All workbook footnotes are Hard, including those on workbook opening pages. Custom entries without difficulty default to Standard. Old full backups preserve the classification of matching packaged IDs. Saved sessions from before this split are cleared once so their old decks cannot mix categories; card statistics remain.

The target grammar pattern and meaning are hidden in a native, keyboard-accessible Show hint box. Click or press Enter/Space on its heading to reveal it. Full answer feedback still shows the pattern and explanation.

## Interface language

The top-right selector supports English, Vietnamese, Simplified Chinese and Russian. The interface preference persists in this browser independently of quiz settings. Main navigation and controls are translated; Korean exercises, English vocabulary meanings and grammar explanations retain their source language. Some detailed validation messages remain English. The language setting is device-local and is not part of exported study backups.

After updating the site, start a new Hard session to include workbook additions. Resuming an unfinished session keeps its original deck and your progress.


## Chapter practice, progress and appearance

Level is in the top-right corner next to Language and Theme. Choose A and/or B below it; unavailable books remain disabled. You can keep selections from multiple levels. The selected-book chips show the active books and can remove a selection.

Choose chapters is optional and closed initially. No checked chapters means all chapters. Check one or more to scope the main quizzes, or use each chapter's Vocabulary / Grammar shortcuts. The vocabulary shortcut uses the current Easy/Hard, direction and mode choices; the grammar shortcut uses every pattern in that chapter, subject to the selected quiz length. A direct chapter vocabulary round does not include flagged words outside that chapter. Workbook review words still appear in each of the chapters they cover.

Three bars at the top track Grammar, Easy vocabulary and Hard vocabulary. They use the selected chapters, or all chapters if none are checked; during a quiz they retain that quiz's book/chapter scope. Grammar counts mastered questions, vocabulary counts mastered words, and each denominator counts unique IDs. Mastery uses the configured consecutive-correct target. A miss resets mastery until that target is reached again. The selected chapter(s) appear above the bars. Existing per-book grammar accuracy still measures all attempts.

Green is the default palette and always uses the original forest-green background, dark green panels and mint accents, independent of system light/dark preference. Black and White are fixed neutral palettes; Autumn uses warm colors with system light/dark adaptation. The header and Settings theme controls stay in sync and persist. Legacy auto/light/dark backups map to Green/White/Black. Korean → English is applied once for existing learners as the new default, without changing a paused quiz; later explicit direction preferences remain respected.

Account integration is configured with optional email-link sign-in. See ACCOUNT_SETUP.md for the private database schema, email-link authentication, progress sync, account separation and deployment requirements.

The current update passes 66 Node tests. Browser checks covered chapter shortcuts, live progress updates, all four theme choices, the Korean → English default, disabled unavailable books, and phone layout at a 375 px content width in English and Russian. Database policies have since passed live transactional isolation checks; real email-link sign-in is verified; cross-device sync remains to be verified.

## Account rollout status

Sign in, Sign up and Continue as guest are available. Supabase progress storage and account isolation have passed transactional database tests; no test accounts were retained. Production redirects are configured, and Gmail custom SMTP has been saved in Supabase. The outdated team-member-only email notice has been removed. Email delivery and complete sign-in have been verified with the owner’s real account.

Guest access displays an alert that browser-local progress is not saved to an account or synced across devices. Development previews currently share the Supabase project and need their exact callback URL allowlisted before email-link testing; see ACCOUNT_SETUP.md. Gmail credentials stay in Supabase and are never committed to this repository.

## Admin import and backup

The Import & backup link, direct route, JSON/CSV imports, backup restore and export require a server-verified, email-confirmed Supabase account matching `shivamj8866@gmail.com`. Guests and other accounts see an access-denied page at `#import`. Each import/export action rechecks the account through `auth.getUser()` and fails closed when verification is unavailable. Local user metadata cannot grant admin access.

These tools manage browser-local data; they do not publish book changes to every student. Since this is a static app, users still control their own browser storage and can inspect public textbook JSON. This UI restriction is not a server-side content security boundary. Cloud progress remains protected separately by database RLS. Admin-only import access is already released to production.

Progress saves locally after every answer. Signed-in accounts upload changed statistics every 30 seconds and verify the upload with a server read-back. Unsynced work remains in account-specific localStorage if the tab closes and reconciles when that account signs in again. Offline or unverified batches remain pending and retry on the next interval. Background browser throttling may delay a tick; Sync now remains available. Guests continue saving only on their device. Closing a tab does not require a last-second network request. Clearing browser storage or unavailable storage prevents this recovery, and the app displays a storage warning when it cannot save locally.


## Admin student dashboard

The Students navigation link and `#students` route are available only to the verified, confirmed owner account `shivamj8866@gmail.com`. The database independently checks that exact current account record on every request. Other authenticated users and guests cannot call the reporting endpoint, even by bypassing the UI or spoofing user metadata. The dashboard is read-only and does not expand any student table-write permissions.

Run `supabase/admin-dashboard.sql` after `supabase/schema.sql` when setting up a new project. The migration is already applied to the shared Supabase project. Its guarded implementation lives in the private `study_admin` schema, with a narrow invoker RPC in `public`. Do not add `study_admin` to the exposed API schemas. `tests/admin-dashboard.sql` verifies admin reads, blocked student/anonymous access, spoofed metadata, pagination and owner-only updates, then rolls back its test users.

Search confirmed students by email, browse pages of 25, choose a published book, and expand chapter details. The dashboard shows latest cloud-synced progress, accuracy and last sync time. It does not include anonymous guests, unconfirmed users, local imports or answers awaiting upload. The admin account itself is excluded. Percentages use a consistent one-correct-answer-after-the-last-miss benchmark because each student's streak setting stays on their device. Student records are kept in page memory only, not localStorage or backups. Refresh retrieves the latest snapshot. Students are informed on the account page that the administrator can view synced progress.

## Autumn leaves

Autumn mode uses `falling-leaves@0.1.0`, installed with npm and pinned in package-lock.json. Its MIT-licensed vanilla ESM files are bundled in `js/vendor/falling-leaves`, so the site needs no build or npm install to run or deploy. Green, Black and White have no leaf animation. Leaves are decorative, behind the interface, and never intercept clicks. Reduced motion disables the animation; inactive tabs stop it. Pause/Resume leaves in the footer saves your preference locally.

These dashboard and Autumn animation changes are staged on `development`; the database addition is shared by development and production. The production website remains on the previously released version until the next release.
