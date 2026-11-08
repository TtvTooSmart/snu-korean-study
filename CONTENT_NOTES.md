# Book 3B content coverage

Source: the user's SNU Korean Plus 3B Student's Book and grammar booklet PDF, from their SNU books folder.

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
