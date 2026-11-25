# Book content coverage

## Book 3B

Source: the user's Korean Plus 3B Student's Book and grammar booklet PDF, from their textbook folder.

- Units 10–18, preserving the textbook's unit numbering.
- All 438 vocabulary index entries on printed pages 178–184.
- 440 cards: two entries are represented in both source units where they occur.
- All 33 grammar patterns in the grammar booklet index.
- 66 newly written practice questions: one multiple choice and one fill-in per pattern.
- `placeholder: false`. These replace the initially requested placeholder samples following the user's updated instruction.

Vocabulary source-page references and normalized English meanings are retained. Coverage means the complete vocabulary glossary and grammar index, not every incidental word in the running text. Quiz sentences and explanations are original practice material, not official textbook exercises. Target-pattern cues disambiguate sentences where another Korean construction could also be grammatical. Example sentences are optional and are not provided for every word. The original PDF is not distributed with this app.

## Verification

Nine plain-Node tests cover retry insertion, streak completion/reset, a single-card deck, missed/flagged versus full-deck retries, answer alternatives, quoted CSV and malformed data. The full 3B dataset also passes the application's schema validator.

Browser smoke checks covered loading the book selector, starting vocabulary practice, revealing a word, marking it missed, pausing, filtering grammar by pattern, answering an MCQ and a fill-in, and reaching the summary. Phone-specific visual QA and a full 440-card session were not performed.


## Page-box verification update

All opening-page vocabulary boxes and all bottom notes on printed pages 24–161 were visually checked. There are 198 Standard and 244 Hard cards (442 total). Two page-81 footer entries absent from the glossary-based import were added: 그녀 and 반대하다. Standard openings are 24/30, 40/46, 56/62, 72/78, 88/94, 104/110, 120/126, 136/142, and 152. Unit18 contains only 18-1; p158 is reading vocabulary and belongs to Hard. Culture-page bottom notes belong to Hard under their preceding subchapter. No running-text vocabulary was added.

Previous release validation: 27 automated tests, plus browser checks for Standard/Hard selection, closed/open grammar hints, and Vietnamese interface rendering. Earlier counts above describe the previous glossary-only release.

## Workbook footnotes

Visually checked all footers in the supplied 3B workbook, including lesson/review pages 14–175. Imported 130 Korean–English footnote entries: 122 new cards and 8 same-meaning repeats linked to existing Hard cards. Current totals: 198 Standard, 366 Hard, 564 vocabulary cards; grammar remains 33 patterns / 66 questions. PDFs and exercise word banks are not bundled.

Every workbook occurrence retains its printed page, subchapter/review name and source gloss. Review 4 words apply to units 10–12, Review 5 to 13–15, and Review 6 to 16–18; they are stored under the last unit in that group but included by any covered unit filter. Repeated entries preserve existing IDs, add accepted English alternatives where needed, and show both source references. Distinct meanings remain separate. Workbook opening-page footnotes are also Hard.

Workbook source glosses are retained, including literal or awkward wording: 탈수하다 (“to dry”, p61; spin-drying context), 독립 기념일 (“National Liberation Day”, p142), and 이가 썩다 (“tooth (teeth) is rotting”, p146).

Current validation: 34 automated tests passed. Browser checks confirmed 198 Standard / 366 Hard counts, a workbook card with four options, correct-answer grading, and translated workbook page labels.

## Vocabulary languages and account access (2026-11-08)

All 564 published 3B vocabulary records now include manually authored Vietnamese,
Simplified Chinese and Russian study glosses. The original Korean and English,
source pages, difficulty labels and card IDs are unchanged. These are study-app
translations, not an official translated textbook edition. Canonical answer values
keep old sessions and progress compatible. Missing translations in user imports
produce an explicit English fallback. Korean grammar options remain Korean.

Guest study and guest-copy controls are removed. Sign-in gates all study routes;
legacy local progress is retained. Public static book files are still public.

Quiz completion and book mastery now have separate labels. Regression tests cover
an 18% active quiz staying intact during a sync batch. The live production timer
was observed firing on 2026-11-08, but that account's upload paused at a cloud/device
conflict. Neither copy was selected or overwritten by the test.


## Book 2B — verified import

Sources: the supplied **2B SB & 문법.pdf** and **2B WB.pdf** in the textbook folder.
All vocabulary glossary entries, the 18 subchapter opening-page boxes and every
other bottom vocabulary note on printed student-book pages 22–163 were visually
checked. All workbook bottom notes on printed pages 14–185 were checked, including
reviews. No exercise word banks, running-text vocabulary or original PDFs ship.

- 480 student glossary entries produce 486 cards: terms that occur in different
  chapter/difficulty scopes get separate cards. No additional terms were missing
  from the glossary after the page-by-page audit.
- 160 workbook occurrences produce 142 additional Hard cards; 18 occurrences
  merge into same-meaning Hard cards and preserve every source page.
- Final vocabulary: **628 cards — 118 Easy, 510 Hard**.
- Grammar: all **35 patterns, 70 original questions**. Source booklet pages and
  subchapters are retained. These exercises are not official textbook questions.
- English source glosses are preserved; all cards include manually authored
  Vietnamese, Simplified Chinese and Russian study meanings, with independent
  proofreading. Korean polysemy is translated for the source sense.

Easy openings (printed student-book pages): 22/28, 38/44, 54/60, 70/76, 86/92,
102/108, 118/124, 134/140, 150/156. Some boxes span two pages; only the first page
is Easy under the requested rule. All workbook notes are Hard, even on workbook
opening pages. Review terms match every chapter covered by that review.

Lesson-page verification corrected two glossary page references: **면접 → p59**
(the index says p61) and **악기 → p138** (the index says p140). The latter is a
17-1 listening-page note and remains Hard; 17-2 starts p140. The autumn phrase
on p151 is **나뭇잎이 떨어지다**. 빌라 keeps the source English “villa”; additional
languages explain its Korean low-rise apartment meaning.

2B IDs use their own book prefix, so existing 3B statistics are unchanged.

Release validation: **95 plain-Node tests passed**, including complete 2B source
counts, Easy/Hard boundaries, review chapter membership, translated four-option
quizzes in both directions, separate progress totals, and cross-book translation
collisions. Multiple-choice values retain saved-session compatibility; translation
lookups now use the same book/difficulty scope as distractor selection.


The subsequent sync repair replaces order-sensitive JSON equality with semantic
comparison, preventing false conflicts after database serialization. All **102
automated tests pass**, including real-conflict and in-flight answer safeguards.


## November 2026: newer 4B and 5B uploads

Source: the November 8 Google Drive uploads of the Seoul National University Korean Plus student books and workbooks. These imports preserve each edition’s unit structure.

- 4B: units 10–18, 231 core vocabulary cards, 412 additional vocabulary cards, 36 grammar patterns and 72 original practice questions. Core uses both subchapter opening vocabulary boxes; additional words come from student-book and workbook footnotes, including reviews. Slash-separated alternatives are separate cards.
- 5B: units 9–16, 288 core vocabulary cards, 352 additional vocabulary cards, 32 grammar patterns and 64 original practice questions. Core follows the chapter glossaries’ 주제 어휘 sections. Additional vocabulary follows their listening, reading, speaking and writing sections. References use printed glossary page numbers; 363 matching workbook vocabulary/review occurrences are also recorded. This edition does not use the earlier books’ bilingual bottom-box layout.
- English meanings are available for the new books. Vietnamese, Chinese and Russian use the app’s explicit English fallback until translations are added.
- Existing 2B/3B IDs, progress and content remain unchanged. New books use deterministic IDs based on book, unit, difficulty and Korean headword. Repeated same-meaning entries retain their source references.
- The site announcement offers Close for the current tab session, an × button, Escape, and Hide for a week on the current browser. Dismissal storage is separate from study progress.

Validation: both book schemas; all 2,566 vocabulary direction/card combinations produce four distinct choices including the correct answer; 137 existing regression checks pass. Notice dismissal and seven-day expiry were checked separately.

## Book 1A — November 25, 2026

Imported only **SNU Korean Plus 1A**, units 1–8: **447 vocabulary cards
(124 Standard, 323 Hard), 32 grammar patterns and 64 original questions**.
The November 8 student-book upload is Drive file
`1rX2zgeZUCKoarKS_ayUR8KEXbp1Hob0T` (263 PDF pages); the matching workbook is
`1_f9eq9dOE_RnL8DmT9Hrt9ZdVD_rrJMM` (196 PDF pages). Hashes and page mappings
are recorded in `data/1a.json`. The workbook needed a 180-degree render correction.

All student-book bottom boxes/notes on printed pp.22–147 and workbook bottom
notes on pp.14–179 were visually audited, including workbook reviews 1–4.
The student glossary pp.160–164 and the 32-entry grammar booklet index were
cross-checked. Reviews contain no bilingual bottom vocabulary notes in this
edition. Hangul practice examples, exercise word banks and incidental running
text are outside this chapter-vocabulary import. No source scans are published.

Standard opening pages are 22/28, 38/44, 54/60, 70/76, 86/92, 102/108,
118/124 and 134/140. Continuation-page boxes and every workbook note are Hard.
The cards retain **368 student-book and 132 workbook occurrences** with printed
pages and source English glosses. Matching meanings are merged only within a
unit/difficulty scope. Below/under synonyms 아래 and 밑 are separate headwords;
the workbook greeting 만나서 반가워요 shares the student card (만나서) 반가워요.
Source glosses include 점심 as “afternoon” (SB p103) and “lunch” (WB p121);
these remain separate senses. Bare-headword typed practice is context-limited
for such homographs: its accepted answer is the current card's source meaning.

Source limitation: no alternate 1A upload was found in the connected Drive
search. After the final lesson p147 the scan has an unnumbered appendix divider
before p150; no scan can be identified as p148. All eight indexed units,
sixteen subchapters, glossary pages and grammar booklet pp.4–35 are present.
This verifies the requested lesson vocabulary/grammar coverage, not every
physical page of the printed volume.

English meanings are available. Vietnamese, Chinese and Russian use the app's
explicit English fallback; translations and generated vocabulary images remain
pending. Existing 2B/3B/4B/5B data and IDs are unchanged. Only 1A is activated;
the announcement names that book and has a new dismissal key.

Validation: 141 Node tests pass, including all 894 card/direction combinations
and 3,576 language renderings, source counts, chapter/difficulty isolation and
separate progress. Chrome checks cover Learn, set practice, vocabulary MCQ,
typed/flashcard modes and grammar at five phone/tablet sizes plus desktop.
The study tests use local isolated account fixtures; they do not exercise live
account sync. A separate content review compared every occurrence against the
verified page lists and checked all 64 original grammar questions.

## Book 4A — November 25, 2026

Added **SNU Korean Plus 4A**, units 1–9: **790 vocabulary cards (238 Standard,
552 Hard), 36 grammar patterns and 72 original practice questions**. The 2023
student book and matching workbook are the November 8 uploads
`1ODSTCCt7gE2zoiL5hp8QgUbk7Oah5g_8` (237 PDF pages) and
`1iwighAoVkd0MwiCHEocJh9eriyQPnQGf` (198 PDF pages). The older student book
is byte-identical. The older workbook has only 28 PDF pages, ending at printed
p27; the newer workbook contains all nine units and three reviews. File hashes,
source selection and printed-page mappings are retained in `data/4a.json`.

Student-book bottom boxes/notes on pp.24–165 and workbook bottom notes on
pp.14–181 were visually audited. The student glossary pp.181–189 and all 36
grammar index entries were cross-checked. Main lesson PDF indices equal printed
pages; grammar booklet indices equal printed pages plus 192. The grammar booklet
covers pp.4–44, with some entries spanning two pages. Page images in the checked
lesson ranges contain no exact duplicates; indexed units and reviews are present.

Only subchapter opening pages 24/30, 40/46, 56/62, 72/78, 88/94, 104/110,
120/126, 136/142 and 152/158 are Standard. All other student notes and all workbook
notes are Hard. The 790 cards preserve **601 student + 191 workbook occurrences**.
Two matching Unit 1 Hard pairs, 책임지다 and 이끌다, merge while retaining both
sources. Korean slash alternatives are separate cards. Review 1 words match units
1–3, review 2 units 4–6 and review 3 units 7–9, with one owning card per review word.

Original glosses remain in provenance when study English is clarified, including
소비 (source “consume”, displayed “consumption”), 도전적, 엉망이다, 공개하다,
아무래도 and the mood sense of 가라앉다. Printed `1/3` is displayed as 삼분의 일
and retained as `sourceHeadword`. WB p81 really prints 기술품, “tech product”.
Incidental text and exercise word banks are excluded. Raw source scans remain private.

English is available; vi/zh/ru retain explicit English fallback. Translations,
illustrations and part-of-speech metadata remain pending. Existing five books
and their IDs are unchanged. The announcement names 4A with a separate dismissal key.

Validation: **145 Node tests pass**, including 1,580 card/direction combinations,
6,320 language renderings, source/classification checks, review selection and
progress isolation. Independent review compared every source tuple and all 72
grammar questions. Three prompts were corrected to clarify simultaneous action
and tense. Chrome checked 66 study states over six viewport sizes, all nine
chapters and 36 patterns, book selection, menu and notice dismissal/expiry.
At short phone heights, answered Learn practice hides the redundant words-remaining
line while retaining the set progress and feedback, fixing a reproduced 14px
overflow at 320×568. Study fixtures use isolated in-memory account state; live
authenticated progress sync was not exercised.

## Book 3A — November 25, 2026

Added SNU Korean Plus 3A, units 1–9: **729 vocabulary cards (212 Standard,
517 Hard), 35 grammar patterns and 70 original practice questions**.
Unit 4 has three indexed patterns; each other unit has four.

The November student book (`1jpqBC-v8onmJdliFGBmgDmu1FQYQqrhZ`, 232 PDF
pages) is byte-identical to the October copy. Both workbook uploads have 198
pages. Two independent page-image comparisons found five changed pages in the
November workbook (`1GM3F9McoSXu6g6Kyu9XUX2CuNxUXRssl`): printed pp55,64,
104,105,107 remove blue handwriting while preserving printed content. The newer
clean workbook supplies all notes. Both scans duplicate printed p21; that extra
scan is excluded. WB PDF index equals printed page through p21, then equals
printed page +1 from p22 onward. Student lesson/glossary indices equal printed
pages. Appended grammar booklet index = printed booklet page +189.

The student colophon records first print May 10, 2023, ebook release September 10,
2023, and last ebook update September 30, 2024. The workbook records the same
first-print and ebook-release dates, with its last update September 10,2023.
All lesson notes on SB pp24–165 and WB pp14–179 were visually audited, with
the SB glossary pp179–186 and grammar index cross-checked. Raw scans stay local.

Standard comes only from opening boxes at 24/30,40/46,56/62,72/78,88/94,
104/110,120/126,136/142,152/158. All remaining SB notes and all WB notes are Hard.
The cards preserve **577 SB +156 WB occurrences**. Four same-meaning repeats
merge within unit/Hard: 엠티, 숙이다, 반대쪽, 수리 기사. Eight printed slash pairs
become separate cards and retain combined sourceHeadword/sourceGloss metadata.
Literal source glosses remain in provenance, including 정이 들다's printed
“to grow attach to someone”; study English is corrected where needed.

Reviews 1/2/3 cover units1–3/4–6/7–9 respectively, with 12/14/13 occurrences.
Cards belong to the last unit and remain selectable from every covered unit.
IDs use a 3A-specific book/unit/difficulty/headword prefix. All six prior book
files and IDs remain unchanged. English-only content uses explicit English
fallback for vi/zh/ru. Images and part-of-speech metadata remain pending.

Validation: all 149 Node tests pass, covering schema, first-page boundaries,
source counts, duplicate exclusion/merging, review scopes, progress isolation,
1,458 card/direction combinations and 5,832 language renderings. A temporary
availability mutation failed the new test as expected and was restored.
Independent review checked vocabulary coverage, source tuples and all 70
original grammar questions. Isolated Chrome checks cover 66 study states across
six phone/tablet/desktop sizes, nine chapters, 35 patterns, 3B availability,
navigation and announcement dismissal/expiry. Live account sync is not covered
by these isolated fixtures. Notice key: `snu-book-3a-added-2026-11`.
