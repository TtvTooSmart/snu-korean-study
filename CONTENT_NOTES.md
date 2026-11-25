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

## 2026-11-25 — audited 5A import

5A is available for all eight chapters with **854 vocabulary cards** (319 Standard,
535 Hard) and **32 indexed grammar patterns / 64 original practice questions**.
This follows the separately completed 4A and 3A releases.

Sources and completeness:
- November Student's Book `1R0R17RYLUZnM19SoS-ZwHxc9MmcwE6ke`: 295 pages,
  35,288,893 bytes, SHA256
  `2cd3f6efe4c04f7a90db558360608bed789b9c5243e83d6a426f9f26abea1705`.
  October `1lCXLlFVuBbkumExU5d_9vzPS5IA0U_ID` has 296 pages: old PDF indices
  94 and 95 are duplicate scans of printed p94. The newer clean scan removes that
  duplicate and the watermark, with corresponding coverage for every other page.
  First print/ebook release: 2023-10-10; student ebook update: 2024-10-30
  (older copy: 2024-09-20). This is matching coverage, not identical file content.
- November Workbook `1bknqTESOTX6lc-qeUxAkd84PP9_B1Yjz`: 188 pages,
  39,302,921 bytes, SHA256
  `9cd9d2501edad7aa1cb0853bb238b98d0b9b31eab04998d0dfe95517917ceec0`.
  October `1Kwr-uVDIUSMmNUqVJwqZNKtklzpjZAcj` matches all 188 pages in rendered
  RGB pixels, embedded image streams, dimensions and extracted text. Both retain
  the same watermark. WB first print/release/update all 2023-10-10.
- New SB/WB zero-based PDF indices equal printed main-book pages. Appended grammar
  booklet pp4–19 use PDF index = printed page +275. Old SB after its duplicate has
  a +1 offset. Repeated empty writing grids in the SB are intentional layouts.

Vocabulary policy and audit:
- All **706 SB glossary entries** across 49 pages:38–44,66–70,94–99,122–126,
  150–156,178–185,206–210,234–239. Standard is the glossary's 주제 어휘 section
  (319). Other sections contribute387 Hard entries: listening143, reading184,
  speaking38, writing22. SB lesson pages18–233 contain exercise banks and grammar
  reference boxes, without separate vocabulary footnotes outside these glossaries.
- All **148 WB bottom notes**, on89 pages within14–171, are Hard. These notes
  have Korean definitions; the literal definitions are retained as `gloss` with
  `glossLanguage: ko`, and the app-authored English translation as `studyGloss`.
  Running text, exercise word banks, and incidental captions are not harvested.
- Reviews1/2/3/4 contain9/9/9/11 notes for units1–2/3–4/5–6/7–8. Each is owned by
  the last unit, with both units retained in `relatedUnits` and source units.
- No same-meaning duplicate occurs within a unit/difficulty in this source set;
  all854 occurrences yield separate cards. Cross-chapter and difficulty repeats
  remain. WB118/165 잔잔하다 retain different sound/demeanor meanings.
- Independent page-image review restored ten missed headwords and removed four
  false OCR records. Korean spelling/Hanja/pronunciation parsing was proofread.
  Separate English OCR and image checks covered all712 English lines. Literal
  English glosses remain in provenance;40 display meanings are clarified, including
  여 (over/more than a number), 비정규직/정규직 (employment status), and proverbs.
- English-only meanings with explicit English fallback for vi/zh/ru. Images and
  part-of-speech metadata remain pending; this release does not claim them.

Verification:
- 153 Node tests pass. The new book checks all1,708 card/direction combinations and
  6,832 language views, four distinct MCQ choices, source totals/classification,
  every review scope, all32 grammar patterns, stable unique IDs and isolated progress.
- Deliberately disabling5A makes its availability test fail; restored suite passes.
- Independent grammar review corrected -(으)라면 and the discovery meaning of
  -고 보다 before release. Each pattern has one original MCQ and one original fill.
- Isolated Chrome passed66 study states at 320×568,360×640,390×844,412×915,
  760×800,1280×900, including wrong-answer feedback, long Learn cards, menu/Escape,
  eight chapters,32 pattern options,5B availability, notice dismissal and expiry.
  All64 grammar questions also passed128 hint-open/closed states at 320×568.
  These fixtures use local test state; authenticated production sync is not exercised.
- Seven prior book files and IDs are unchanged. No app/CSS behavior change needed.
  The announcement key is `snu-book-5a-added-2026-11`.
- Raw PDFs, scans, OCR, verified inventories and import scripts stay private in
  local `tmp/pdfs`; browser audit artifacts stay in `tmp/mobile-qa`.

## 2026-11-25 — audited 1B import

1B is available for original units 9–16 with **406 vocabulary cards** (107 Standard,
299 Hard), **32 indexed grammar patterns**, and **64 original practice questions**.

- Source: the November student book (`1_3JzTVdiBDY6ikrPJ7iSwAgw9fbiLL_M`,
  207 PDF pages) and workbook (`1baHbwoLJv6LulAy_KFACp15JQ-QEk9C3`,
  200 pages). No alternate 1B upload was found. Covers, contents, lesson continuity,
  glossary, grammar index and colophons were checked. File hashes are in the JSON.
- Student edition: first print 2022-09-22, ebook release 2023-09-15, updated
  2024-02-20. Workbook: first print 2022-10-10, ebook release 2023-09-15,
  updated 2023-10-18.
- Student lessons pp22–147 and glossary pp162–166 use PDF index = printed page.
  Appended grammar pp4–37 use PDF index = booklet page +169; pp17 and19
  continue the preceding patterns. Workbook pp14–90 use index = printed page;
  PDF index91 repeats printed p90 and is excluded. Thereafter index = page +1.
- Standard uses only the opening-page bottom boxes at22,28,38,44,54,60,70,76,
  86,92,102,108,118,124,134,140. Continuations and other student notes are Hard,
  as are every workbook note. Exercise panels and running text are excluded.
- Workbook reviews5–8 (pp40–53,82–95,124–137,166–179) have no dedicated bottom
  vocabulary notes. Their exercise word banks are not imported.
- The nine ordinary/honorific pairs on student pp124–125 become individual cards,
  retaining the combined printed headword in source metadata. The two meanings of
  드시다 (eat/drink) remain distinct. 이분 and 한번 merge their same-meaning
  student/workbook occurrences within the same unit and difficulty.
- All 425 study-source occurrences (338 student, including split pairs, and 87
  workbook) are preserved in 406 cards. English source errors such as `to don't
  know` and `grad(udate) school` remain literal in provenance, with corrected
  study meanings. Vietnamese, Chinese and Russian use explicit English fallback.
- All 32 indexed grammar entries have an original MCQ and fill question each.
  The causal and sequential uses of -아서/어서 remain separate patterns.
- Validation: 157 automated tests; all 406 cards in both directions and four
  language settings; chapter/difficulty/progress isolation; availability mutation
  fails as expected. Isolated Chrome checks cover 66 study states at six viewports
  plus 128 grammar hint states at 320×568, menu and notice dismissal/expiry.
  Mobile Learn and desktop selection screenshots were inspected. Existing book
  JSON remains unchanged. PDFs, OCR and audit images remain private.
- Vocabulary images and part-of-speech labels remain pending.

The SB glossary references 주다 at p30, but the actual vocabulary note is p31.
The card follows the verified note location; running text on p30 is excluded.

## 2026-11-25 — audited 2A import

2A is available for units 1–9 with **574 vocabulary cards** (122 Standard,
452 Hard), **36 indexed grammar patterns**, and **72 original practice questions**.

- November SB `1IOapfFRZFPo2rGYi7arAsxbZiDcEa1hQ` (227 pages, 30,160,289 bytes)
  and WB `1pzREQnpYEGrkV98gD1qml6m_RW3t_vfs` (204 pages, 21,375,094 bytes) are
  byte-identical to October SB `1zrMIhLDd7_GJXCOq5fr2KcdJwNggOeQ5` and
  WB `1s6YWvB6XA7t_P9vktLCuxrYtPZFMygsJ`. Source hashes are in the book JSON.
  Both first printed 2022-12-28; ebook release and last update 2023-09-10.
- Covers, contents, lesson continuity, glossary, grammar index and colophons were
  checked. No duplicate scans were found; SB 164/165 is an appendix divider spread.
  Main SB/WB PDF indexes equal printed pages. Grammar booklet pages 4–43 use
  index = page +183, with continuation pages 14,18,23,34.
- SB bottom vocabulary notes were checked across 22–163 and against glossary 174–179.
  Only the first bottom box of each subchapter is Standard: pages 22,28,38,44,54,60,
  70,76,86,92,102,108,118,124,134,140,150,156. Other SB notes and all WB notes are
  Hard. Exercise banks and running text are excluded. The glossary's 시간 reference
  to p 135 points to lesson-task language rather than a vocabulary note and is excluded.
- All WB vocabulary notes across 14–185 are included:165 occurrences on 79 pages.
  Review 1 at 54–69 contributes 16 notes, Review 2 at 112–127 contributes 22, and Review 3
  at 170–185 contributes 5. Their note bands sit higher than ordinary lesson footers.
  They belong to units 1–3/4–6/7–9 respectively, stored under the last unit with every
  covered unit in relatedUnits.
- Fifteen SB slash pairs split into 30 cards/source references, preserving the printed
  combined headword and gloss. The 399 raw SB groups become 414 study occurrences.
  Together with 165 WB notes,579 occurrences yield 574 cards after five same-meaning
  merges: 시간이 나다, 홈페이지, 이제, 자꾸 and 피가 나다 in their respective units.
- Awkward source glosses remain literal in provenance with clearer study meanings,
  such as 미술관 (art museum/gallery), 피부과 (dermatology/skin clinic) and 치과
  (dentistry/dental clinic). English fallback for Vietnamese, Chinese and Russian is
  explicit. Vocabulary illustrations and part-of-speech metadata remain pending.
- All 36 index patterns have an original four-option MCQ and a fill question. Present,
  future and past inference and the prediction use of -(으)ㄹ까요 remain distinct.
- Verification:161 automated tests pass. All 574 cards have four distinct choices in
  both directions across four language settings. Review chapter membership, difficulty
  and progress isolation are checked. Disabling 2A fails its availability test; the
  restored suite passes. Removed the superseded 2B test assertion that 2A is unavailable.
- Isolated Chrome checks pass 66 study states across six viewport sizes and 144 grammar
  hint states at 320×568. Home shows nine chapters and 36 patterns;2B remains available.
  Menu, notice dismissal/session/week expiry and mobile/desktop screenshots checked.
  All nine earlier book JSON files are unchanged. PDFs and intermediate audits stay private.
