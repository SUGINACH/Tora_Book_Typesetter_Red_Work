---
title: "מסמך השוואה מפלצתי: כל הריפואים וכל הענפים — IMUD_TORANI (V20.1–V20.5, main) + Yellow V22 + Gold V21 + Green V23 + Orange"
date: 2026-11-02
version: shared
type: comparisons
source: Qwen analysis of live clones (HEAD as of 2026-11-02)
---

# מסמך השוואה מפלצתי — מערכת עימוד ספרים תורנית

> **הערה מתודולוגית:** המסמך מבוסס על clone מלא של כל חמשת הריפואים (כולם, כולל ענפי V20.x של IMUD_TORANI) ובדיקה מכנית: hash byte-by-byte, unified diff בין זוגות קבצים, נוכחות פונקציות/מזהים/מחלקות CSS, פענוח JSON שטוח מפתח-מפתח, וספירת kind בבודק הגיאומטרי. שום קביעה כאן אינה הימור — כל מספר הוא פלט של כלי מדידה שהרץ על ה-HEAD המתועד בסעיף 1.1.
>
> **מונחים:** ≡ = קובץ byte-identical (אותו MD5). ∅ = קובץ/מפתח/פקד אינו קיים בצד זה. hunks = גושי diff רציפים.

---

## חלק א' — מפתחה של המשפחה

### 1.1 זהויות, ענפים, היסטוריה

| ריפו | ענף(ים) | קומיטים | קומיט אחרון (HEAD) | מהות |
|---|---|---|---|---|
| `SUGINACH/IMUD_TORANI` | `main`, `V20.1`, `V20.2`, `V20.3`, `V20.4`, `V20.5` | main: 131 · V20.1: 234 · V20.2: 233 · V20.3: 152 · V20.4: 148 · V20.5: 125 | `6dd79d0` 2026-11-01 — Port from V21: continuous footnote layout (fn-layout-mode) | **הריפו ההיסטורי המקורי** (GitHub Pages חי: suginach.github.io/IMUD_TORANI). חמשת ענפי V20.x = חמש שיחות Claude מקבילות שהועלו כקבצים שלמים; main = תוצר האיחוד שכותרתו הפנימית "Orange" |
| `Tora_Book_Typesetter_Yellow` | `V22` (ברירת מחדל) | 209 | `878535e` 2026-10-28 — Add files via upload | קו ChatGPT V22: ארגון מנוע + נראות (engine-inputs / engine-trace / engine-diagnostics), CI קל ללא Playwright |
| `Tora_Book_Typesetter_Gold` | `V21` (ברירת מחדל) | 347 | `a444d34` 2026-10-28 — Add files via upload | קו z.ai/GLM: המנוע הגדול לפני הקפיצה ל-V23, AutoQuality, אבחון step-by-step, 6 workflows |
| `Tora_Book_Typesetter_Green` | `V23` (ברירת מחדל) | 774 | `e5cde5f` 2026-10-28 — Add files via upload | קו ChatGPT V23: מנוע 6,226 שורות, CLI+CI מחמיר, רישום 27→3 בעיות, קומיטים זעירים registry-driven |
| `Tora_Book_Typesetter_Orange` | `main` (ברירת מחדל) | 21 (היסטוריה נקייה מיובאת) | `eabcec0` 2026-11-02 — Remove fonts/fonts/ … record broken fonts | **האיחוד הרשמי**: ייבוא נקי של Green@`0ddaf89` + העברות מ-Gold@`31ed2ca`, קומיט-לכל-פיצ'ר עם בדיקה משלו |

**נקודות צאצאות מתועדות** (`Orange/PROVENANCE.md`, `imud/docs/PROVENANCE.md`):
- Orange = fork נקי מ-Green@`0ddaf89`; נקודת ייחוס Gold@`31ed2ca`; אב משותף `5c646c1`. לא יובאו: old_ver/, debug/, test/, Parallel_Programming/, rendered-document_4.*.
- IMUD main = בסיס זמן-ריצה מקצה V20.1 + העברות: avoid-runt-word/text-wrap:balance מ-V20.5; settings-manager/ייצוא HTML/גופנים מקו v19 (`6c5a7e1`); כותרת עליונה "מילה ראשונה עד אחרונה" מ-V20.4; עיטורי הפרדה והערות רציפות מקו V21 (`11b2b55`).
- כל ענפי IMUD חולקים 122 קומיטים עד `c56d073` (תקופת Knuth-Plass של V18); V20.5 מתפצל שם (3 קומיטים משלו); V20.1–V20.4 ממשיכים יחד עד `6c5a7e1` ("v19"), ואז `52644c7` = שילוב מנוע שיחת V20.4; V20.3/V20.4 נפרדים אחרי ~11 קומיטים; V20.1/V20.2 ממשיכים יחד ~90 קומיטים ("קו V21") עד `11b2b55`. בקצות V20.1/V20.2 קבצי הליבה הוחלפו בגרסאות מקו אחר — קו V21 נשאר רק בהיסטוריה וב-archive.

### 1.2 כותרות README — אי-התאמות מגיל

| ריפו | כותרת README | הערה |
|---|---|---|
| Yellow | `# חבילת מערכת עימוד תורנית — גרסה v10 (2026-10-12)` | **מיושן חודשיים**: הענף בפועל V22; ההוראות מתייחסות ל-"push origin V15" |
| Gold | `# ... גרסת V21 Gold (2026-10-27)` | עדכני |
| Green | `# מערכת עימוד תורנית — V23` | עדכני |
| Orange | `# מערכת עימוד תורנית — Orange` | עדכני |
| IMUD_TORANI | `# Tora Book Typesetter — "Orange"` | main מתאר את עצמו "Orange" — **שמות כפולים**: שני ריפואים חיים נקראים Orange |

### 1.3 package.json — שמות וגרסאות (אי-אחידות מלאה)

| ריפו | name | version | scripts |
|---|---|---|---|
| IMUD_TORANI | `tora-book-typesetter-orange` | 0.1.0 | test, test:layout, test:layout:quick, test:features, baseline:update |
| Yellow | *(אין package.json)* | — | — |
| Gold | `tora-book-typesetter-gold` | 1.0.0 | test:baseline, test:quick, determinism |
| Green | `imud-torani` (!) | 23.0.0 | audit:geometry, audit:geometry:long |
| Orange | `tora-book-typesetter-unified` | 23.0.0 | audit:geometry, audit:geometry:long, test:settings, test:header, test, test:consistency, test:h2scope, test:dividers, test:shaar, test:assets, test:ui |

---

## חלק ב' — מטריצת קבצים

### 2.1 נוכחות + MD5 (8 תווים) + שורות, לקובצי הליבה (HEAD)

| קובץ | IMUD main | Yellow V22 | Gold V21 | Green V23 | Orange |
|---|---|---|---|---|---|
| typesetter.js | 2,991 / `673c4376` | 4,252 / `110692aa` | 5,653 / `2749eb85` | 6,226 / `f2e42c7a` | 6,347 / `5fd786dc` |
| app.js | 2,108 / `7172707b` | 2,967 / `1f109d00` | 3,115 / `4b0987d6` | 2,909 / `a1a79bd4` | 2,925 / `9f0cecb2` |
| style.css | 1,663 / `18d996f8` | 1,729 / `e557c6da` | 1,763 / `2de8e587` | 1,805 / `170550d8` | 1,805 / `3373c6cd` |
| index.html | 1,399 / `f9ae4f4e` | 1,343 / `b878efac` | 1,500 / `ef7f3e92` | 1,353 / `5538da04` | 1,407 / `5a12f804` |
| decorations.js | 661 / `4dfdd7b3` | 614 / `549bd137` | 650 / `0eaf1686` | 614 / `197066a5` | 648 / `3599037d` |
| settings-manager.js | 264 / `46b69e65` | 250 / `a514f6c8` | 250 / `a514f6c8` | 250 / `a514f6c8` | 250 / `a514f6c8` |
| geometry-audit.js | **∅** | 1,402 / `baceff2e` | 2,258 / `76173a29` | 2,908 / `8bf7b8ed` | 2,638 / `226e228c` |
| debug-panel.js | **∅** | 153 / `1f6a5e0b` | ≡ Yellow | ≡ Yellow | ≡ Yellow |
| renderer-bridge.js | **∅** | 361 / `9f54d468` | 330 / `d925836c` | 349 / `79187978` | 362 / `b4fe8d5a` |
| renderer.html | **∅** | 98 / `96fcc258` | ≡ Yellow | 95 / `85663df9` | 95 / `55d8c062` |
| test-suite.js | **∅** | 1,026 / `bd70a896` | ≡ Yellow | ≡ Yellow | ≡ Yellow |
| trace-manager.js | **∅** | 496 / `3103f04d` | ≡ Yellow | ≡ Yellow | ≡ Yellow |
| engine-diagnostics.js | ∅ | **107 (ייחודי)** | ∅ | ∅ | ∅ |
| engine-inputs.js | ∅ | **120 (ייחודי)** | ∅ | ∅ | ∅ |
| engine-trace.js | ∅ | **153 (ייחודי)** | ∅ | ∅ | ∅ |
| audit-expansion.js | ∅ | ∅ | **568 (ייחודי)** | ∅ | ∅ |
| audit-text-integrity.js | ∅ | ∅ | **396 (ייחודי)** | ∅ | ∅ |
| fonts-def.css | 2,640 / `89223f3a` | ≡ | ≡ | ≡ | ≡ |
| fonts-extended.css | 7,895 / `2306cd85` | ≡ | ≡ | ≡ | ≡ |

**מסקנות:**
- ארבעת ריפואי הצבע חולקים **קובץ אחד בדיוק** עבור: `settings-manager.js`, `debug-panel.js`, `test-suite.js`, `trace-manager.js`, `fonts-def.css`, `fonts-extended.css`.
- IMUD main **חסר לחלוטין** את שכבת renderer/audit: אין `renderer.html`, `renderer-bridge.js`, `geometry-audit.js`, `test-suite.js`, `trace-manager.js`, `debug-panel.js` — הבדיקות שם בנויות על `tests/layout` (Playwright) בנפרד.
- style.css: Green ו-Orange באורך זהה (1,805) אך hash שונה — השוני הוא שורת ה-@import/selfhost בלבד (1 hunk, ראו 3.1 ו-5.4).

### 2.2 קובצי נתונים (JSON) — זהות מלאה בכל חמשת הריפואים

**byte-identical ב-5/5:** `note_rules.json` `435f377a` · `header_ornaments.json` `9ae3b498` · `ornaments_left_right.json` `38e55b65` · `ornaments_up_down.json` `f2e4201b` · `section_dividers.json` `e129fd4e` · `shaar_main.json` `ca315133` · `shaar_sub.json` `446cb9c6` · `shaar_back.json` `3c4cc3d1` · `assets_manifest.json` `c4885062` · `fonts-priority.json` `fd1eb2c4` · `fonts-extended.json` `51aad077` · `setting_sets/פרשנות.json` `ac36d67d` · `setting_sets/קונטרס.json` `534ae4c0` · `setting_sets/תלמוד.json` `61001b00`
**יוצא דופן:** `reference-analysis.json` — קיים וזהה ב-4 ריפואי הצבע, **∅ ב-IMUD**.

> כלומר: **כל הפער בין הגרסאות הוא בקוד, בהגדרות ובממשק — לא במאגרי הנתונים.**

### 2.3 תיקיות/נכסים ייחודיים לכל ריפו

| ריפו | ייחודי לו |
|---|---|
| IMUD | `archive/` (v18-knuth-plass 3,889L, v19-baseline-6c5a7e1, v20.1-tools, v20.2-tip…v20.5-tip, v21-glm-11b2b55), `presets/makom-bina-v20.5`, `docs/` (UNIFICATION_PLAN, FEATURE_MAP, PROVENANCE, AI_WORKFLOW, knowledge incl. chat transcripts, analysis incl. branch-review-2026-10-28), `chatgpt_v23/`, `claude_v20/`, `zai_v21/`, `shared/`, `wiki/` (~40 עמודים EN+HE incl. Home/_Sidebar), `tools/import-from-old-repo.sh`, `text_files_for_typesetter_tests/` (7 קבצים) |
| Yellow | `engine-{inputs,trace,diagnostics}.js`, `Parallel_Programming/` (קובץ יחיד בשם `1` — שריד), `old_ver/` (**89 קבצים**), `debug/` (PNG/HTML/JSON), `test/` (PDF/PNG של V18), `rendered-document_4.html/pdf`, `Guttman-Rashi-Normal.woff2` **בשורש**, 4 קבצי long/mid test_text בשורש, `V22 - תכנית ארגון מנוע העימוד.md` |
| Gold | `audit-expansion.js`, `audit-text-integrity.js`, `issue-reports-archive/`, `test-triggers/` (README + 6 קבצי trigger), `work_doc/` (SESSION_HANDOFF, ISSUES_TABLE, WORKFLOWS, 4 תמלילי Z.ai), `package-lock.json`, `text_files_for_typesetter_tests/very_long_test_text_2.txt` |
| Green | `reports/` (~20 דוחות run לפי GitHub-run-ID), `work_doc/` (MASTER_WORK_REGISTER, CONTINUATION 27/28-10, RESEARCH_DETERMINISTIC…, ISSUE_COVERAGE_MATRIX), `tools/build_layout_issue_screenshot_report.py` |
| Orange | `selfhost-fonts/` (Assistant/BelleFair/David Libre/Frank Ruhl/Noto Serif/Rubik + OFL licenses), `fixtures/` (canonical_very_long_test_text.txt, base_very_long…, chapters_focus/, ch63_final_paragraph_failure_case.txt), `expected_baseline.json`, `WORKLOG.md`, `OPEN_QUESTIONS.md`, `PROVENANCE.md`, `LAYOUT_DEPENDENCY_MAP.md` (814L), `docs/prep/` (01_FUNCTION_PARITY_3WAY, 02_CONFLICT_ANALYSIS, 03_GOLD_COMMIT_PORTABILITY, 04_TREE_MANIFEST_BASELINE, 06_LAB_FINDINGS, 07_IMPLEMENTATION_PLAN, bootstrap/ci/conflicts/lab/patches/visual), `docs/green-V23/`, `tools/verify_phase2.sh`, `very_long_test_text.txt` **בשורש** |

### 2.4 נכסי טקסט לבדיקות

| נכס | IMUD | Yellow | Gold | Green | Orange |
|---|---|---|---|---|---|
| very_long_test_text.txt | ∅ | ∅ | `text_files_for_typesetter_tests/` | `text_files_for_typesetter_tests/` | **בשורש** (5,702 שורות) + `fixtures/canonical_*`; sha256 `5e73b913…` מתועד |
| text_files_for_typesetter_tests/ | ✓ (7) | ∅ | ✓ | ✓ | ∅ (הועבר ל-fixtures/) |
| long/mid test_text בשורש | ∅ | ✓ (4) | ∅ | ∅ | ✓ (4) |
| corpus/test_doc/problem_chapters | ✓ (tests/corpus) | ∅ | ∅ | ∅ | ∅ |

---

## חלק ג' — דיפסטטיים זוגיים (unified diff n=2 על קובץ שלם)

### 3.1 טבלאות hunks/+/− בין ה-HEADים

**typesetter.js:**

| זוג | hunks | + | − |
|---|---|---|---|
| IMUD~Gold | 92 | 4,044 | 1,382 |
| IMUD~Green | 90 | 4,626 | 1,391 |
| IMUD~Orange | 90 | 4,747 | 1,391 |
| IMUD~Yellow | 92 | 2,734 | 1,473 |
| Yellow~Gold | 92 | 1,684 | 283 |
| Yellow~Green | 101 | 2,298 | 324 |
| Yellow~Orange | 118 | 2,433 | 338 |
| Gold~Green | 91 | 2,227 | 1,654 |
| Gold~Orange | 85 | 2,300 | 1,606 |
| **Green~Orange** | **30** | **150** | **29** ← הזוג הקרוב ביותר |

**app.js:** IMUD~Gold 13h/1,126+/119− · IMUD~Green 11h/921+/120− · IMUD~Orange 12h/933+/116− · IMUD~Yellow 11h/979+/120− · Yellow~Gold 15h/260+/112− · Yellow~Green 6h/2+/60− · Yellow~Orange 9h/21+/63− · Gold~Green 11h/53+/259− · Gold~Orange 12h/62+/252− · Green~Orange 3h/19+/3−

**style.css:** IMUD~Gold 20h/181+/81− · IMUD~Green 18h/195+/53− · IMUD~Orange 18h/196+/54− · IMUD~Yellow 15h/119+/53− · Yellow~Gold 6h/62+/28− · Yellow~Green 3h/76+/0− · Yellow~Orange 4h/77+/1− · Gold~Green 8h/97+/55− · Gold~Orange 9h/98+/56− · **Green~Orange 1h/1+/1−** (החלפת @import של Google ב-selfhost)

**index.html:** IMUD~Gold 12h/152+/51− · IMUD~Green 8h/23+/69− · IMUD~Orange 11h/78+/70− · IMUD~Yellow 8h/15+/71− · Yellow~Gold 5h/165+/8− · Yellow~Green 2h/12+/2− · Yellow~Orange 4h/65+/1− · Gold~Green 5h/19+/166− · Gold~Orange 6h/66+/159− · Green~Orange 4h/66+/12−

**decorations.js:** IMUD~Gold 6h/13+/24− · IMUD~Green 7h/13+/60− · IMUD~Orange 6h/11+/24− · IMUD~Yellow 25h/57+/104− · Yellow~Gold 24h/88+/52− · Yellow~Green 19h/44+/44− · Yellow~Orange 24h/86+/52− · Gold~Green 5h/8+/44− · **Gold~Orange 2h/2+/4−** · Green~Orange 5h/42+/8−

**geometry-audit.js** (IMUD ∅): Yellow~Gold 24h/1,161+/305− · Yellow~Green 29h/1,846+/340− · Yellow~Orange 30h/1,560+/324− · Gold~Green 35h/1,794+/1,144− · Gold~Orange 36h/1,494+/1,114− · Green~Orange 25h/99+/369−

**renderer-bridge.js:** Yellow~Gold 12h/46+/77− · Yellow~Green 2h/41+/53− · Yellow~Orange 3h/55+/54− · Gold~Green 13h/55+/36− · Gold~Orange 13h/69+/37− · Green~Orange 3h/14+/1−

**settings-manager.js:** Yellow≡Gold≡Green≡Orange (0 הפרשים). מול IMUD: 1 hunk / 0+ / 14− (ההרחבה הייחודית של IMUD — ראו 4.5).

### 3.2 אבולוציית ענפי IMUD (typesetter.js, כל קצה מול main, n=0)

| ענף | שורות/hash | מול main: hunks | + | − |
|---|---|---|---|---|
| V20.1 | 2,825 / `9865aba9` | 35 | 173 | 7 |
| V20.2 | 2,468 / `fd45b563` | 104 | 672 | 149 |
| V20.3 | 2,375 / `6e9a34e1` | 186 | 979 | 363 |
| V20.4 | 3,253 / `e75b602f` | 185 | 1,740 | 2,002 |
| V20.5 | 2,562 / `edc69b72` | 112 | 661 | 232 |
| main | 2,991 / `673c4376` | — | — | — |

מטריצת שאר קובצי הליבה לפי ענף (שורות/hash):

| קובץ | V20.1 | V20.2 | V20.3 | V20.4 | V20.5 | main |
|---|---|---|---|---|---|---|
| app.js | 1,773/`0b2dcbd8` | 1,772/`674ec703` | 1,371/`0a73d946` | 1,603/`b8f6baef` | 1,741/`b6d5724f` | 2,108/`7172707b` |
| style.css | 1,615/`c8612338` | 1,616/`789cf080` | 1,819/`6dce92ce` | 1,581/`9b9b8210` | 1,622/`e0fbf2d2` | 1,663/`18d996f8` |
| index.html | 1,335/`b533a56f` | 1,335/`53270d96` | 960/`0a5e64c9` | 962/`74038c72` | 1,324/`90f5507d` | 1,399/`f9ae4f4e` |
| decorations.js | 625/`bcfa8f4c` | 635/`3bd4bde2` | 545/`d2a328bd` | 619/`8da463a7` | 614/`11675280` | 661/`4dfdd7b3` |
| geometry-audit.js | 1,435/`a51fddd0` | ≡ V20.1 | ∅ | ∅ | ∅ | ∅ |
| default_settings.json | 266/`6d5322d2` | ≡ V20.1 | 244/`6634f936` | ≡ V20.3 | 251/`256b0bd9` | ≡ V20.1 |
| settings-manager.js | 250/`a514f6c8` | ≡ V20.1 | 230/`93ffed66` | ≡ V20.3 | 242/`0ecce171` | 264/`46b69e65` |

**מינורים שחייבים תשומת לב:**
- `default_settings.json` של **main ≡ V20.1 ≡ V20.2** — ההעדפות לא עודכנו מאז פיצול V20.1 למרות 5 קומיטים מאוחדים אחריו; V20.3/V20.4 חולקים hash חתוך (244 שורות, 22−); V20.5 ייחודי (251).
- `geometry-audit.js` קיים רק ב-V20.1/V20.2 (≡) ו**נעלם מ-V20.3 והלאה ומ-main**.
- `settings-manager.js`: V20.1/V20.2 ≡ ארבעת ריפואי הצבע (`a514f6c8`); V20.3/V20.4 חתוך (`93ffed66`); V20.5 ביניים (`0ecce171`); main = הרחבה ייחודית (`46b69e65`).
- `index.html` V20.3/V20.4 ≈960 שורות מול 1,335 ב-V20.1/V20.2 — פיצול ה-HTML לשלושה קבצים (שיחת V20.2) חזר קדימה ב-main (1,399).
- `decorations.js` V20.5 (614/`11675280`) ≠ Yellow V22 (614/`549bd137`) — אותו אורך, תוכן שונה.

---

## חלק ד' — פערי יכולות במנוע (typesetter.js)

### 4.1 ספירת פונקציות/הגדרות-פונקציה מזוהות

| IMUD | Yellow | Gold | Green | Orange |
|---|---|---|---|---|
| 66 | 105 | 133 | 131 | **139** |

### 4.2 נוכחות מנגנונים (ספירת הופעות מחרוזת במקור)

| מנגנון | IMUD | Yellow | Gold | Green | Orange |
|---|---|---|---|---|---|
| fn-layout-mode (כתמים) | 1 | 2 | 2 | 2 | 2 |
| heading-divider | 1 | ∅ | 4 | ∅ | 3 |
| shaar-main-divider | ∅ | ∅ | ✓ | ∅ | ✓ |
| h2-orn-scope | ∅ | 1 | 2 | 1 | 1 |
| tryReclaimOrphanTail | ∅ | 4 | 4 | 7 | 7 |
| stretchByWordSpacing (AQ) | ∅ | ∅ | ✓ | ∅ | ∅ |
| stretchByLetterSpacing | ∅ | ∅ | 2 | ∅ | ∅ |
| stretchByHeadingSpacing | ∅ | ∅ | 2 | ∅ | ∅ |
| rebalance2 | ∅ | ∅ | 2 | ∅ | ∅ |
| fixDropWordInColumns | ∅ | ∅ | **8** | ∅ | ∅ |
| cross-paragraph-parens | ∅ | ∅ | 1 | ∅ | ∅ |
| aq-shared-load | ∅ | ∅ | 2 | ∅ | ∅ |
| avoid-runt-word | 1 | ∅ | 5 | ∅ | 5 |
| allow-terminal-residual-fallback | ∅ | ∅ | ∅ | 1 | ∅ |
| balance-chapter-end | 1 | 1 | 1 | 1 | 1 |
| hdr-h1-title-mode | ∅ | ∅ | ∅ | ∅ | 2 |

### 4.3 אוספי פונקציות ייחודיים (set-diff; בסיס השוואה: Orange)

**ייחודי ל-IMUD (22):** `performTypeset`, `typesetDocumentLive`, `alignBlockColumns`, `chooseSplitLines`, `colContentBottom`, `flowTopOfEl`, `flowBottomOf`, `fillHeaderFirstLastWords`, `adjustFitLineForNoteSpans`, `stretchColumnTo`, `probeParagraphLines`, `joinMeasuredLine`, `hasUnclosedDelimiter`, `isHeadingEl`, `noteHeadingPlaced`, `getFontVal`, `hdrCType/hdrLType/hdrRType`, `stuckPages`, `first`, `rest` — **ארכיטיפ מנוע שונה** (flow-based מבלי pipeline/checkpoints של קו הצבע).

**ייחודי ל-Gold (24):** כל משפחת **AutoQuality** (`applyWordSpacing`, `balanceByWordSpacing`, `compressByWordSpacing`, `stretchByWordSpacing`, `wordSpacingFromFactor`, `measureWordSpacingBaseline`, `wordSpacingCompressCapacity`, `wordSpacingStretchCapacity`, `stretchByLetterSpacing`, `stretchByHeadingSpacing`) + `fixDropWordInColumns`, `getLastLineInfo`, `getHeaderSettings`, `insertOrn`, `findProblemNode`, `collectPageElements`, `collectPageSignatures`, `computeDelta`, `diff`, `walk`, `describeNode`, `message`, `cls`, `childCount`.

**ייחודי ל-Yellow (0 מול Orange):** כל 105 הפונקציות שלו קיימות ב-Orange; ל-Orange יש 34 נוספות (`applyAvoidRuntWord`, `tryInsertHeadingDivider`, `repositionOverflowingSideNotes`, `recordLayoutGeometryStage`, `captureParen*Diagnostics`, `extractH1TitleMain`…).

**ייחודי ל-Green (1):** `pageIndexOf`. ל-Orange יש 9 נוספות מול Green: `applyAvoidRuntWord`, `extractH1TitleMain`, `h1TitleForHeader`, `maybeGetHeadingDivider`, `noteHeadingSeen`, `forgetHeadingSeen`, `resetHeadingDividerState`, `tryInsertHeadingDivider`, `removeInsertedDivider` — **אלה בדיוק 9 ההעברות מ-Gold (heading dividers + runt + H1-mode)**.

**ייחודי ל-Orange (מעל כולם):** `__findProbeHost`, `__fnMeasureLogPush`, `__footnoteDomSignature`, `auditFnMeasurement`, `captureParenFontCounterfactualDiagnostics`, `captureParenthesisScopeDiagnostics`, `candidateTable/evalCand/better/center/score/snapshot/record/rawTextLength/newFree/pagesFor/targetInfo/capacityBefore/capacityAfter` (שארית אבחון), `buildHeaderGridHTML`, `buildRunInHeadingHTML`, `classifySettingControl`, `fitColumnDividers`, `fitH2OrnamentsToText`, `fitSectionDividerToPage`, `measureFootnoteAreaHeight`, `measureLinesByRealMarkup`, `measureTextWidthOf`, `getJustifyCapacityAudit`, `getPreviewScaleFactor`, `getTocPageLabel`, `getSplitRules`, `getPendingFootnoteItems`, `createDryEndNoteMarker`, `getDummyNoteMarkerHTML`, `applySideNoteLevelStyle`, `applyParenStyle`, `markInsideParenParagraphs`, `isInsideParenToken(Id)`, `findParenMatches`, `mergeMatches`, `addToGroup`, `layoutGroup`, `layoutHeightOf`, `fontSize`, `columnCompressCapacity`, `columnStretchCapacity`, `compressColumnBy`, `computeBestFitLine`, `buildStyledFragment`, `export` ועוד.

### 4.4 כל 34 ה-hunks של Green→Orange (typesetter.js), מסווגים

**א. תיקוני הרכבה (wiring) של הגדרות שהוזנחו — סימון `[תיקון]` בקוד:**
1. `page-num-initial-value` — המספור תמיד התחיל מ-1 (ההגדרה הוזנחה); נוסף `initialValue` מ-DOM + `effectiveNum = pNum - startIdx + initialValue`.
2. `body-last-line-align` — `--last-line-align` היה קשית ל-center; כעת נקרא מהפקד.
3. `avoid-runt-word` — הוטמע בנתיב הראשי (`finalLines`) **וגם** ב-fallback (`finalLines2`) + פונקציה חדשה `applyAvoidRuntWord(lines)` (מזגת שורה אחרונה בת מילה אחת עם הקודמת; רק אם >1 שורה).
4. `same_as_even` בעמוד זוגי — האפשרות הוצעה בממשק אך לא טופלה (הכותרת נשארה ריקה); נוסף `resolveEvenType(side,type)` עם גידוע מעגליות (גם-גם → ריק).
5. `general-toc-show-numbering` + `general-toc-count-numbering` + `detailed-toc-show-numbering` + `detailed-toc-count-numbering` — הצגת מספר עמוד בטוקס והכללת/אי-הכללת עמודי טוקס ברצף המספור (`pageIndex += pagesRendered`).
6. `showNumbering` בתוך `renderPaginatedTOC` — `tocShowFooter` מותנה בו.

**ב. פיצ'רים שהועברו מ-Gold ומשודרגים:**
7. **Heading dividers H3–H6** — `headingDividerState {seen[1..7], before:Map}`; `noteHeadingSeen` (מאפס רמות נמוכות), `forgetHeadingSeen` (snapshot-rollback), `maybeGetHeadingDivider`, `tryInsertHeadingDivider(container, level, fits)` עם **מדידה מראש בכל אתרי ההוספה** (ב-Gold רק באחד), בלי עיטור בראש טור/עמוד ריק, `removeInsertedDivider`, עיטור שהוסר אינו נספר כאסימון ב-rollback, מצב משוחזר דרך `pageState.hs` בבניית עמוד מחדש, `resetHeadingDividerState()` בתחילת מסמך.
8. **Shaar dividers** (`shaar-main-divider`, `shaar-sub-divider`) — ב-HEADים החיים רק ב-Orange (+IMUD-main בהעברה מקבילה מ-V21).
9. **hdr-h1-title-mode** — `extractH1TitleMain` (חיתוך לפני המקף הראשון: -, –, —) + `h1TitleForHeader` (mode 'main' כברירת מחדל — הכרעת עורך; 'full' = טקסט מלא); תוקן עדכון `currentH1Title` בשני אתרי H1.
10. **Renderer loads JSON ornament assets** (פורט Gold `bd9cd15`, race-free).

**ג. אבחון:** `recordLayoutGeometryStage` + `window.__stepByStepAuditConfig` (captureLineRects/captureComputedStyle), `targetInfo(target)`, `pageIndex` באירועי stage.

### 4.5 הבדלים עדינים אך קריטיים

- **settings-manager (IMUD, +14 שורות ייחודיות):** בעת שחזור ערך שמור שאינו ברשימת האפשרויות — `font-picker` מקבל `<option>` חדשה (שימור בחירת גופן שייטען מאוחר); שאר הבוררים מדלגים בלי לרוקן בחירה. התנהגות שאין באף ריפו צבע.
- **decorations.js:** Gold~Orange = 2 hunks (2+/4−) בלבד — Orange כמעט ≡ Gold; Yellow~Orange = 24 hunks; IMUD שונה מכולם (25 hunks מול Yellow).
- **renderer.html:** Yellow≡Gold (98); Green ו-Orange באורך 95 אך hash שונה — Orange מוסיף טעינת נכסי JSON.

---

## חלק ה' — הגדרות (default_settings.json)

### 5.1 ספירות מפתחות שטוחים

| IMUD | Yellow | Gold | Green | Orange |
|---|---|---|---|---|
| 264 | 246 | 264 | 248 | 254 |

### 5.2 פערי קבוצות מפתחות (מלא, כל הזוגות)

| השוואה | רק בצד א' | רק בצד ב' |
|---|---|---|
| IMUD ↔ Yellow | 18: `aq-*`(11), `h2-orn-scope`, `heading-divider-h3..h6`, `shaar-main-divider`, `shaar-sub-divider` | — |
| IMUD ↔ Gold | — | — (**קבוצות מפתחות זהות**) |
| IMUD ↔ Green | אותם 18 | 2: `allow-terminal-residual-fallback`, `balance-chapter-end` |
| IMUD ↔ Orange | 11: כל ה-`aq-*` | 1: `hdr-h1-title-mode` |
| Yellow ↔ Green | — | אותם 2 |
| Yellow ↔ Orange | — | 8: `h2-orn-scope`, `hdr-h1-title-mode`, `heading-divider-h3..h6`, `shaar-*-divider` |
| Gold ↔ Green | 18 | 2 |
| Gold ↔ Orange | 11 (aq-*) | 1 (`hdr-h1-title-mode`) |
| Green ↔ Orange | 2 | 8 |

**הערות:**
- **IMUD ≡ Gold בהגדרות: 0 הבדלי מפתחות ו-0 הבדלי ערך** — העתק מלא של `default_settings.json` מ-Gold, למרות 92/90 hunks שונים ב-typesetter.js (**אותן הגדרות, מנועים שונים**).
- Yellow ⊂ Gold (אין ל-Yellow מפתח שאין ל-Gold).
- 2 מפתחות ייחודיים ל-Green: `allow-terminal-residual-fallback=true`, `balance-chapter-end="balance"` — **אבדו בהעברה ל-Orange** (ב-CSS של Orange נשאר המחלקה `layout-full-width-terminal-residual` אבל בלי מנגנון/מפתח).
- 11 ה-`aq-*` (word-spacing 0.95–1.05, threshold 2, max-diff 20, line-height-max 3, para-spacing-max 9, shared-load…) קיימים רק ב-IMUD/Gold — **וב-IMUD אין להם מנגנון בקוד** (0 הופעות `stretchByWordSpacing`).

### 5.3 ערכי ברירת מחדל חוצי-גרסאות

`fn-layout-mode='block'` ו-`avoid-runt-word=true` ב-5/5. ב-Yellow/Green הדגל `avoid-runt-word` מוגדר true **אבל אין שום אזכור בקוד** — הגדרת שווא בשני הריפואים.

### 5.4 גופנים — נקודת השבירה הארכיטקטונית של Orange

| ריפו | `@import fonts.googleapis` ב-style.css | self-hosted |
|---|---|---|
| IMUD / Yellow / Gold / Green | ✓ (תלות רשת) | ∅ |
| **Orange** | ∅ | ✓ `selfhost-fonts/` + OFL licenses |

+ CLI של Orange רושם טביעת אצבע (Chromium, Playwright, גופנים, קלט) בדוח ו**נכשל ב-exit 7 על כל בקשת רשת חיצונית** (offline guard).

### 5.5 מטען גופנים

| ריפו | fonts/ | קבצים | הערות |
|---|---|---|---|
| IMUD/Yellow/Gold/Green | 272MB | 1,760 | כולל **כפילות `fonts/fonts/`** (138.7MB, byte-identical, לא מוזכרת) |
| Orange | 136MB | 1,759 | הכפילות נמחקה בקומיט `eabcec0` (2026-11-02) + תיעוד שברי-גופן |

---

## חלק ו' — ממשק (index.html): פערי פקדים

### 6.1 ספירות id

| IMUD | Yellow | Gold | Green | Orange |
|---|---|---|---|---|
| 349 | 336 | **367** | 338 | 350 |

### 6.2 set-diff מול Orange

| ריפו | רק בו | רק ב-Orange |
|---|---|---|
| IMUD | `balance-chapter-end`, `book-container`, `dim-hdr-h`, `dim-hdr-w`, `measuring-box` | `f-paren`, `s-paren`, `s-paren-mode`, `h2-orn-scope`, `hdr-h1-title-mode`, `render-frame` |
| Yellow | — | 14: `h2-orn-scope`, `hdr-h1-title-mode`, `heading-divider-h3..h6` + `h3..h6-divider-json-optgroup`, `shaar-main/sub-divider` + optgroups |
| Gold | 18: פאנל AQ שלם — `aq-enabled`, `panel-autoquality-body`, `aq-word-spacing(-min/-max/-max-diff/-threshold)`, `aq-line-height(-max)`, `aq-para-spacing(-max)`, `aq-letter-spacing(-max)`, `aq-heading-spacing(-max)`, `aq-page-height(-max)`, `aq-shared-load` | `hdr-h1-title-mode` |
| Green | `allow-terminal-residual-fallback`, `balance-chapter-end` | אותם 14 של Yellow |

**סדר השכבות (פקד ↔ מפתח ↔ מנגנון) אינו עקבי:**
- ל-IMUD יש פקד `balance-chapter-end` + מפתח, אך המנגנון ב-typesetter הוא כתם יחיד (port חלקי).
- ל-Green יש פקד + מפתח + מנגנון ל-`allow-terminal-residual-fallback` — שלושת השכבות קיימות רק בו.
- ל-Gold יש פאנל AQ מלא (18 פקדים) + מפתחות + מנגנון — הריפו היחיד שבו AQ שלם.
- ל-IMUD יש פקדי paren (`f-paren/s-paren/s-paren-mode`?) — למעשה הם **רק ב-Orange**; ל-IMUD אין פקדי paren (פערי 6.2).

---

## חלק ז' — בודק הגיאומטריה (geometry-audit.js)

### 7.1 kinds (סוגי ממצאים) לפי ריפו

| Yellow (16) | Gold (17) | Green (20) | Orange (18) |
|---|---|---|---|
| chain-broken\*, empty-column\*, heading-at-bottom\*, pua-char\*, widow, orphan, imbalance, sparse-line, overlap, page-overflow, pn-overflow, fn-overflow, fn-line-overflow, fn-page-overflow, fn-pn-overflow, fn-containment | block-gap\*, ornament-asymmetry\*, ornament-overflow\*, ornament-overlap\*, settings-verification\*, widow, orphan, imbalance, sparse-line, overlap, page-overflow, pn-overflow, fn-overflow, fn-line-overflow, fn-page-overflow, fn-pn-overflow, fn-containment | container-gap, container-overlap\*, side-note-overflow, sparse-page, square-bracket-scope, square-bracket-unmatched, structural-fallback, tolerated-containment-rounding\*, widow, orphan, imbalance, sparse-line, overlap, page-overflow, pn-overflow, fn-overflow, fn-line-overflow, fn-page-overflow, fn-pn-overflow, fn-containment | container-gap, side-note-overflow, sparse-page, square-bracket-scope, square-bracket-unmatched, structural-fallback, widow, orphan, imbalance, sparse-line, overlap, page-overflow, pn-overflow, fn-overflow, fn-line-overflow, fn-page-overflow, fn-pn-overflow, fn-containment |

\* = kind ייחודי לאותו ריפו. **אף ריפו לא מכיל את כל הקבוצה (איחוד = 26 kinds שונים).**
- אבדו מ-Green→Orange: `container-overlap`, `tolerated-containment-rounding` (הראשון כנראה מוזג ב-containment; השני נשמט).
- לא הועברו כלל: 4 ה-kinds של Yellow (chain-broken, empty-column, heading-at-bottom, pua-char) ו-5 של Gold (block-gap, ornament-*, settings-verification).

### 7.2 renderer-bridge — פרוטוקול

ארבעת ריפואי הצבע חולקים את אותו פרוטוקול (`typeset/render-done/render-error/html-result/print/done/geom-extract/geom-audit/geom-export/geom-paint/geom-clear/fn-audit-*/renderer-ready`). **ייחודי ל-Yellow:** `diagnose` + `diagnose-result/diagnose-error` (כפתור "דוח אבחון בלחיצה אחת" → engine-diagnostics.js).

---

## חלק ח' — CI ובדיקות

### 8.1 GitHub Actions

| ריפו | workflows |
|---|---|
| IMUD | **∅ — אין CI בכלל** (למרות שזה הריפו החי עם Pages) |
| Yellow | `v22-checks.yml` (122L): unit ללא דפדפן · layout (headless Chrome + puppeteer-core; determinism self-test; diagnostic report; annotations) · ab-compare (PR A/B) |
| Gold | 6: full-baseline-audit (227), issue-investigation (300), issues-screenshot-pdf (198), regression-test (138; מטריצה 4 jobs incl. determinism), step-by-step-audit (133), test-triggers-runner (162) |
| Green | 2: geometry-audit-cli (451), geometry-audit-long (675) |
| Orange | 2: geometry-audit-cli (276), geometry-audit-long (324) + `tools/verify_phase2.sh` מול `expected_baseline.json`; npm ci + lockfile |

### 8.2 סוויטות ובדיקות

- **IMUD:** `tests/layout` (check_layout.js, run-suite.js, scenarios.js, baseline.json — 21 תרחישים) · `tests/features` (00-smoke, 10-avoid-runt-word, 20-settings-io, 30-export-fonts, 40-header-firstlast, 50-header-verso-center, 60-heading-dividers, 70-footnotes-continuous, run.js) · `tests/audit/settings-effect.js` (איזו הגדרה משפיעה בפועל + סריקת מזהים שלא נקראים) · `tests/corpus` · npm `test:layout:quick` ~1 דק'.
- **Yellow:** `tests/engine-inputs.test.js`, `tests/engine-trace.test.js`; כלים: `scripts/layout-ab.mjs`, `layout-explain.mjs`, `geometry-audit-headless.mjs`, `geometry-audit-cli.js`.
- **Gold:** 20 סקריפטים (`step-by-step-audit.js`, `determinism-test.js`, `regression-test.js`, `baseline-check.js`, `generate-issues-pdf.js`, `test-trigger-runner.js`, `editing-recommendations.js`, `summarize-chapter-results.py`…) + `test-triggers/` (conflicts, imbalance, overflow, page_underfill, heading_escort, settings_conversion).
- **Green:** `tools/geometry-audit-cli.js` + `build_layout_issue_screenshot_report.py` + `tests/fixtures` + `reports/` (run-ids).
- **Orange:** 8 בדיקות Node (`settings-consistency`, `settings-wiring`, `header-settings`, `h2-ornament-scope`, `heading-divider`, `shaar-divider`, `renderer-assets`, `ui-e2e` — מריץ את index.html האמיתי ב-iframe כפי ש-Pages מגיש) + `scripts/generate-settings-review.js` + Playwright מוצמד 1.55.0.

### 8.3 מצב אימות מתועד (מספרים מה-READMEים/קבצי הריפואים)

| ריפו | תוצאה מתועדת |
|---|---|
| Green | runs 40386889244/40386909709 ✓ · ברירת מחדל: **639 עמודים, 27 ממצאים (0H/4M/23L)** · עיטורים: 659 עמודים, 37 (0H/6M/31L) |
| Orange | מעבדה Chromium 140 offline: **639 עמודים, 39 (0H/11M/28L)**; baseline Green@0ddaf89: 40 (0/12/28) — הכל ב-`expected_baseline.json` |
| Gold | SESSION_HANDOFF: 371→3 issues; deep DOM scan (72 containments); ספי containment 42→20px, side-note 15→20px |
| Yellow | CI annotations; דוח אבחון + trace; PR A/B; determinism self-test |
| IMUD | 0 חריגות ב-21 תרחישים בבסיס V20.1 (FEATURE_MAP) |

---

## חלק ט' — פרופיל פילוסופיית פיתוח

| ממד | IMUD main | Yellow V22 | Gold V21 | Green V23 | Orange |
|---|---|---|---|---|---|
| אסטרטגיית QA | סוויטת קבלה (21 תרחישים + baseline) | נראות המנוע: inputs→trace→diagnostics | אבחון סיבתי step-by-step + regressions | CI כבד (CLI+long) + רישום פערים | **הנדסת העברות**: import→port→בדיקה לכל פיצ'ר |
| שקיפות קלט | — | EngineInputs.el (215 אתרי קריאה) | — | fingerprint ב-CLI | fingerprint + offline guard |
| היסטוריית קומיטים | 131; "Add files via upload" | 209; מתוארים | 347; חלקית מתוארים | 774; זעירים registry-driven | **21; קומיט-לפיצ'ר עם בדיקה** |
| תיעוד עבודה | docs/{PROVENANCE,FEATURE_MAP,UNIFICATION_PLAN,AI_WORKFLOW,knowledge} | Reports_Summaries_Studies + תכנית ארגון | work_doc (SESSION_HANDOFF) | work_doc (MASTER_WORK_REGISTER) | WORKLOG + OPEN_QUESTIONS + PROVENANCE + docs/prep |
| ארכיון | archive/ של 6 קווי קוד | old_ver(89)+debug+test | issue-reports-archive | reports(run-ids) | docs/green-V23 |

---

## חלק י' — מרשם פערים (gap register)

### 10.1 פיצ'רים לפי מקור → מי מכיל (✓ קיים / ∅ אין)

| פיצ'ר | מקור | IMUD | Yellow | Gold | Green | Orange |
|---|---|---|---|---|---|---|
| AutoQuality (11 מפתחות + 10 פונקציות + פאנל UI 18 פקדים) | Gold | חלקי (הגדרות+UI, **ללא מנגנון**) | ∅ | ✓ | ∅ | ∅ |
| Heading dividers H3–H6 | Gold | ✓ (port מ-V21) | ∅ | ✓ | ∅ | ✓ (משודרג: fits() בכל האתרים, rollback) |
| Shaar main/sub dividers | Gold | ✓ | ∅ | ✓ | ∅ | ✓ |
| h2-orn-scope | Gold | ✓ | ∅ | ✓ | ✓ | ✓ |
| fn-layout-mode continuous | V21 | ✓ (כתם 1 — port חלקי) | ✓ | ✓ | ✓ | ✓ |
| applyAvoidRuntWord | V20.5/V21 | ✓ | ∅ | ✓ | ∅ | ✓ |
| hdr-h1-title-mode + extractH1TitleMain | Orange | ∅ | ∅ | ∅ | ∅ | ✓ |
| same_as_even resolution | Orange c49b79e | ∅ | ∅ | ∅ | ∅ | ✓ |
| TOC numbering wiring (4 מפתחות) | Orange eb21383 | ∅ | ∅ | ∅ | ∅ | ✓ |
| page-num-initial-value / body-last-line-align wiring | Orange/Gold f069408 | ∅ | ∅ | ✓ | ∅ | ✓ |
| allow-terminal-residual-fallback | Green | ∅ | ∅ | ∅ | ✓ | **∅ — אבד** |
| balance-chapter-end (מנגנון מלא) | Green | פקד+מפתח בלבד | ∅ | ∅ | ✓ | ∅ |
| fixDropWordInColumns | Gold | ∅ | ∅ | ✓ | ∅ | ∅ |
| rebalance2 after cross-paragraph-parens | Gold | ∅ | ∅ | ✓ | ∅ | ∅ |
| stretchBy{Word,Letter,Heading}Spacing stages | Gold | ∅ | ∅ | ✓ | ∅ | ∅ |
| engine-inputs/trace/diagnostics + diagnose bridge | Yellow | ∅ | ✓ | ∅ | ∅ | ∅ |
| Renderer-JSON-assets wait (race-free) | Gold bd9cd15 | ∅ | ∅ | ✓ | ✓ | ✓ |
| Self-hosted fonts + offline guard + exit 7 | Orange | ∅ | ∅ | ∅ | ∅ | ✓ |
| font-picker preserve-missing-value | IMUD | ✓ | ∅ | ∅ | ∅ | ∅ |
| Header verso-centre slot fix | IMUD bc7892f | ✓ | ∅ | ∅ | ∅ | ✓ |
| audit: ornament-* / block-gap / settings-verification | Gold | ∅ | ∅ | ✓ | ∅ | ∅ |
| audit: square-bracket-*, sparse-page, side-note-overflow, container-gap | Green | ∅ | ∅ | ∅ | ✓ | ✓ |
| audit: container-overlap, tolerated-containment-rounding | Green | ∅ | ∅ | ∅ | ✓ | **∅ — אבד** |
| audit: chain-broken, empty-column, heading-at-bottom, pua-char | Yellow | ∅ | ✓ | ∅ | ∅ | ∅ |
| step-by-step causality audit | Gold | ∅ | ∅ | ✓ | ∅ | חלקי (recordLayoutGeometryStage) |
| test-triggers corpus | Gold | ∅ | ∅ | ✓ | ∅ | ∅ |
| ui-e2e אמיתי (index.html+iframe) | Orange | ∅ | ∅ | ∅ | ∅ | ✓ |
| presets (makom-bina-v20.5) | IMUD | ✓ | ∅ | ∅ | ∅ | ∅ |
| CI | — | **∅** | ✓ | ✓ | ✓ | ✓ |

### 10.2 אי-התאמות ומינורים שנתפסו (רשימת "לא לשמוט", 24 סעיפים)

1. README של Yellow מציג "v10 (2026-10-12)" לענף V22 בפועל; הוראות push ל-V15.
2. שני ריפואים מתארים את עצמם "Orange": IMUD-main (README + package `tora-book-typesetter-orange`) ו-Orange (package `tora-book-typesetter-unified`).
3. `default_settings.json` של IMUD-main ≡ V20.1 ≡ V20.2 (hash) — העדפות לא עודכנו מאז הפיצול.
4. IMUD-main ≡ Gold בהגדרות (keys+values, 0 הבדלים) אך 90–92 hunks שונים ב-typesetter — אותן הגדרות, מנועים שונים.
5. `geometry-audit.js` נעלם מ-V20.3/V20.4/V20.5/main (קיים רק ב-V20.1/V20.2).
6. ל-IMUD אין renderer.html/bridge — לא ניתן להריץ שם CLI audit; תלוי Playwright בלבד.
7. 2 מפתחי Green (`allow-terminal-residual-fallback`, `balance-chapter-end`) + 2 kinds של audit (`container-overlap`, `tolerated-containment-rounding`) אבדו בהעברה ל-Orange.
8. 11 מפתחות AQ קיימים ב-IMUD **ללא שום מנגנון AQ** ב-typesetter.js (העתקת whole-file מ-Gold).
9. `avoid-runt-word=true` ב-5/5 אך `applyAvoidRuntWord` קיים רק ב-3/5 — ב-Yellow/Green זו הגדרת שווא (0 אזכורים בקוד).
10. `fn-layout-mode` ב-IMUD מופיע פעם אחת בלבד (port חלקי של `6dd79d0`) לעומת 2 ביתר הריפואים.
11. `reference-analysis.json` ∅ ב-IMUD.
12. כפילות `fonts/fonts/` (138.7MB) נשמרה ב-4 ריפואים ונמחקה רק ב-Orange.
13. `Guttman-Rashi-Normal.woff2` מונח בשורש ב-Yellow (וגם ב-IMUD/הענפים) בעוד style.css של Yellow מפנה ל-`fonts/Guttman-Rashi-Normal.woff2` — הסתעפות נתיב/כפילות.
14. ב-Yellow `Parallel_Programming/` ובו קובץ יחיד בשם `1` (שריד); קומיט "Create 1" ב-IMUD; `Add files via upload` כשיטת העלאה ב-4 ריפואים.
15. only_Orange CSS classes שנשמטו מ-IMUD: `h2-title-ornament-top/bottom`, `header-ornament-wrap`, `hdr-txt`, `layout-full-width-terminal-residual`, `tabs-not-ready`; ייחודי ל-IMUD: `heading-divider-wrap` (מחלקה ש-Orange מכנה אחרת? לא — ב-Orange היא קיימת דרך JS; ב-IMUD ב-CSS).
16. IMUD: אין `.github/workflows` — ללא CI על הריפו החי (Pages).
17. Baselines שונים על אותו קלט כנוני: Green 27 ממצאים (CI) מול Orange 39 (מעבדה) — 12 MEDIUM נוספים טרם הוכרעו; מתועד ב-`expected_baseline.json`.
18. V20.3/V20.4 settings חתוכים ב-22 שורות מול V20.1; PROVENANCE מתעד "קבצי הנתונים ריקים" בקצה V20.3.
19. `settings-manager.js` ≡ ב-4/5 אך IMUD deviated (+14L) — סיכון התנגשות בכל reverse-port.
20. `decorations.js`: Yellow (614/`549bd137`) ≠ Green (614/`197066a5`) באורך זהה — 19 hunks; Gold~Orange 2 hunks בלבד.
21. `index.html` V20.3/V20.4 ≈960 שורות (פיצול HTML) מול 1,335/1,399 — הנסיגה/חזרה מתועדת.
22. `renderer.html` Yellow≡Gold ≠ Green≠Orange — Orange שינה לאחר ה-fork (asset loading).
23. שני ארכיטיפי מנוע חיים במקביל: 22 פונקציות IMUD שאינן ב-Orange מול 95 של Orange שאינן ב-IMUD — עדיין לא אוחדו.
24. `package.json`: `imud-torani@23.0.0` (Green) לעומת `tora-book-typesetter-unified@23.0.0` (Orange) — אותו מנוע, שני מזהי חבילה; ל-Yellow בכלל אין package.json.

---

## חלק י"א — סיכום executive

| שאלה | תשובה מכנית |
|---|---|
| המנוע הגדול ביותר | Orange — 6,347L, 139 פונקציות |
| המנוע השונה ביותר | IMUD-main — 2,991L, 66 פונקציות, 22 ייחודיות, ארכיטיפ flow-based |
| הזוג הקרוב ביותר | Green~Orange: 30 hunks (typesetter) · 1 (style) · 3 (app) · 4 (index) |
| הזוג הרחוק ביותר | IMUD~Orange: 90 hunks / 4,747+ / 1,391− |
| היכן הנתונים זהים | 11 קבצי JSON + 3 setting_sets — 5/5 byte-identical |
| היכן ההגדרות זהות | IMUD ≡ Gold (keys+values); Yellow ⊂ Gold; Green ⊃ 2 ייחודיים; Orange ⊃ 8 ייחודיים |
| מה מימש רק Orange | hdr-h1-title-mode, same_as_even, TOC numbering wiring, selfhost+offline guard, ui-e2e, expected_baseline |
| מה אבד בדרך ל-Orange | allow-terminal-residual-fallback, balance-chapter-end, container-overlap, tolerated-containment-rounding, כל ה-AQ (Gold), כל ה-engine-* (Yellow), fixDropWordInColumns, rebalance2 |
| מה נשאר רק ב-IMUD | archive של 6 קווי קוד, presets, font-picker fix, wiki, מסמכי איחוד — וללא CI וללא geometry-audit |

---

## נספח א' — מתודולוגיה ושחזור

```bash
git clone https://github.com/SUGINACH/IMUD_TORANI            # branches: main,V20.1..V20.5
git clone -b V22 https://github.com/SUGINACH/Tora_Book_Typesetter_Yellow
git clone -b V21 https://github.com/SUGINACH/Tora_Book_Typesetter_Gold
git clone -b V23 https://github.com/SUGINACH/Tora_Book_Typesetter_Green
git clone        https://github.com/SUGINACH/Tora_Book_Typesetter_Orange
# נמדד: md5+wc לכל קובץ ליבה; difflib.unified_diff(n=2) לכל זוג×קובץ;
# flatten(default_settings.json) key/value diffs; regex: function decls, id="", .class, kind:'x';
# git rev-list --count לכל ענף; git archive לכל קצה V20.x.
```

HEADs שנמדדו (2026-11-02): IMUD `6dd79d0` · Yellow `878535e` · Gold `a444d34` · Green `e5cde5f` · Orange `eabcec0`.

## נספח ב' — הפניות
- מקורות פנימיים של הריפואים: `Orange/PROVENANCE.md`, `Orange/docs/prep/01–07`, `imud/docs/PROVENANCE.md`, `imud/docs/{UNIFICATION_PLAN,FEATURE_MAP}.md`, `Gold/work_doc/SESSION_HANDOFF.md`, `Green/work_doc/MASTER_WORK_REGISTER.md`, `Yellow/Reports_Summaries_Studies/תכנית_ארגון_מנוע_העימוד.md`.
- השוואות קודמות בריפו זה: `Version_comparison.md`, `Report_Comparison_Versions_Software_Deep.md`, `Analysis_Comparison_Versions_System_Typesetting.md`, `Tag_comparison.md`, `Upgrade_plan.md`, `Integration_recommendation.md`.
