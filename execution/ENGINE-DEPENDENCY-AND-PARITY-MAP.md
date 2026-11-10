# RED Work — מפת מנוע, נתיבי ריצה, תלות ו-parity

> **סשן:** 2 מתוך 20  
> **תאריך:** 10.11.2026  
> **ריפו יעד:** SUGINACH/Tora_Book_Typesetter_Red_Work בלבד  
> **בסיס המיפוי:** main `6f801568c15071a27f97918ff8479def9c719c0d`  
> **מצב:** מיפוי קוד ותוצאות Baseline; ללא שינוי במנוע.

## 1. מסקנות תפעוליות

1. ל-RED יש **שני נתיבי עימוד ממשיים**: נתיב DP (ברירת המחדל של RED) ונתיב Legacy/IMUD (פורט של מנוע המקור). שניהם מופעלים דרך `typeset()`, אך הם אינם אותו אלגוריתם ואינם נבדקים באותה דרך.
2. בדיקות `layout-parity` מול `audits/layout-reference.json` מפעילות במפורש את פרופיל IMUD ולכן מגיעות ל-`legacy-imud-flow.js`. אין להסיק מהן ישירות על `dp-planner.js`.
3. בדיקות `npm test`/canonical והפקת hash הדטרמיניזם של `getDefaultSettings()` בודקות את נתיב DP, אלא אם הקלט מייבא במפורש `_layout-profile='imud'`.
4. נתיב Legacy כבר כולל טוקניזציה, שבירת שורות, זרימת טורים, תקציב הערות, הערות המשך, איזון, הקרנה וחשבונאות שימור תוכן. לכן אין הצדקה להקים עבורו מנוע הערות/איזון חלופי.
5. יש פער אבחוני בין הנתיבים: נתיב DP מפעיל את `EventLog` המפורט יותר לפי stages, ואילו נתיב Legacy יוצר כרגע חמישה אירועים כלליים בלבד (parse, measure, page-plan, folio, render) לצד Ledger מצומצם. זהו פער ממשי למיפוי שלב-אחר-שלב, אך יש לבצע Gap Analysis מלא לפני הרחבה.
6. בבסיס הנוכחי, P6 ו-P7 עדיין נכשלים, גם כאשר כל בדיקות ה-HARD, קורפוס העל ואודיט הדפדפן עוברים. הצלחת ה-workflow אינה שקולה לסגירת P6/P7.

## 2. זיהוי נתיב הריצה של layout-parity

### 2.1 מקור הקלט וההגדרות

הקובץ `tools/layout-parity/run-ours.js`:

- טוען טקסט מ-`audits/no_long_test_text.txt` כברירת מחדל.
- טוען את `red-build/ui/assets/imud/default_settings.json`.
- קורא את `fonts`/רשימות המשפחות הזמינות.
- קורא ל-`importImudSettings(legacy, regKeys, { availableFonts })`.
- רושם גופנים אמיתיים למדידה/רינדור: Guttman Rashi, FrankReal, Frank Ruhl Libre, David Libre, וכן משפחות IMUD המוטמעות.
- מגדיר `body-font: Guttman Rashi` ו-`measure-impl: font-metrics`.
- מריץ `typeset(text, settings, env)` ומפיק `ours-model.json` ו-`ours.pdf`.
- במצב `--determinism` הוא מבצע עימוד נוסף ודורש hash ומספר עמודים זהים.
- במצב `--html` הוא מייצא גם HTML.

### 2.2 dispatch ב-pipeline

ב-`red-build/src/engine/core/pipeline.js`, בתוך `typeset()`:

```js
if (settingsIn && settingsIn['_layout-profile'] === 'imud' && settingsIn._imudRaw) {
  const { legacyTypeset } = require('../layout/legacy-imud-flow');
  return legacyTypeset(rawText, settingsIn, env);
}
```

כלומר: הגדרות שהגיעו מ-`importImudSettings` מנתבות את ריצת הייחוס ל-`legacy-imud-flow.js`. רק כאשר תנאי זה אינו מתקיים מופעל צינור ה-DP שמוגדר בהמשך `pipeline.js`.

**השלכה:** ניתוח P6/P7 חייב להתמקד תחילה בנתיב Legacy ובכלי הפקת מודל ה-parity. שינוי ב-`dp-planner.js` אינו תיקון P6/P7 אלא אם הוכח מסלול שבו בדיקת הייחוס עוברת דרכו.

## 3. מפת pipeline — נתיב DP

הסדר המחייב מתועד בכותרת `red-build/src/engine/core/pipeline.js` וממומש בפונקציה `typeset()`:

| שלב | אחריות | מודולים מרכזיים |
|---|---|---|
| CP1 — Parse / Scope | נרמול, lexer, טוקניזציה, זיהוי סוגריים, סגנונות ומיפוי מקור | `parser/dfa-lexer.js`, `parser/block-tokenizer.js`, `parser/bracket-scanner.js`, `core/pipeline.js` |
| CP2 — Typography | רישום גופנים, מדידה, חלוקת מילים לשורות | `typography/measure-api.js`, `font-metrics.js`, `measure-table.js`, `kp-linebreak.js`, `protectors.js`, `dropword.js` |
| CP3 — Page planning | DP, הגנות, מועמדים, נסיגה, זרימת טורים, איזון ותקציבי הערות | `layout/dp-planner.js`, `candidate-generator.js`, `column-flow.js`, `protections-matrix.js`, `retreat-loop.js`, `balancing.js`, `ordering.js`, `footnote-budget.js`, `headings-escort.js`, `side-notes.js`, `endnote-pages.js` |
| CP4 — Decorations / Header / TOC | עיטורים, שערים, כותרות עליונות, מספור ותוכן עניינים; בדיקת ניטרליות גיאומטרית | `decoration/**`, `core/pipeline.js` |
| CP5 — Projection / Render | projection למודל פלט, DOM/HTML/PDF וסגירת Ledger | `output/geometry-projector.js`, `output/dom-renderer.js`, `output/html-export.js`, `output/pdf-writer.js`, `output/export-api.js` |

הערות מבניות:
- `core/pipeline.js` הוא המתזמן היחיד של סדר CP1–CP5 בנתיב DP.
- `EventLog` מוגדר ב-`core/events.js`; הסדר המותר של stages מוגדר שם.
- `Ledger` מוגדר ב-`core/ledger.js`; הוא שומר `predicate_before`, `predicate_after`, transitions, candidates ו-capacity.
- `notes/markers.js` הוא מקור האמת לסמני ההערות בנתיב DP.
- `balancing.js` מכיל גם `optimalSplit` וגם כללי סוף-פרק/איזון; אין להניח שכל שימוש ב-`balanceBlock` בנתיב Legacy משתמש באותו API או באותו מרחב מצבים.

## 4. מפת נתיב Legacy/IMUD

קובץ הריצה העיקרי: `red-build/src/engine/layout/legacy-imud-flow.js` (כ-2,981 שורות).

הוא מכיל בתוך אותו מודול את השלבים הבאים:

1. `tokenizeDoc()` — פירוק שורות, מטא-נתונים, כותרות, הערות סיום/צד, וזיהוי הערות שוליים.
2. `LineBreaker` — מדידת מילים, חלוקת פסקאות לשורות, חלונות, סוגריים וסמנים.
3. בניית sections ומבני עמודים/שערים.
4. מילוי הטורים: טוקן כותרת/פסקה, מעבר בין טור ימני ושמאלי, fit, protectors ו-rollback לכותרות זנב.
5. ניהול `fnQueue`, `pendingFootnotes`, תקציב הערות, הערות המשך ופיצול שורות הערה.
6. `finalizeBlock()` ו-`balanceBlock()` — סגירות בלוק, איזון, ודיווח `column-imbalance`.
7. `placeFootnoteArea()` — הקרנת הערות לתחתית העמוד או לזרימה רציפה.
8. סידור pages, TOC, folios, headers ו-page decorations.
9. חישוב `legacyLayoutHashDigest()` וחשבונאות מולטיסט מילים.
10. החזרת `pages`, `tokens`, `contentPreserved`, `contentStats`, `ledger` ו-`events`.

### 4.1 נקודות קוד רגישות שכבר זוהו

| מיקום | תפקיד | רלוונטיות |
|---|---|---|
| `tokenizeDoc()` בסביבות 249–331 | טוקניזציה של מסמך IMUD | מקור אפשרי לשינוי זהות/רצף כותרת או פסקה |
| `LineBreaker.splitWords()` בסביבות 397 ואילך | פיצול הערות לתצוגת סמן/גוף הערה | רלוונטי לסמני הערות ומילים מודבקות |
| `fnQueue` / `pendingFootnotes` בסביבות 1219–1301 | תור ההערות והמשכים בין עמודים | רלוונטי ל-content-loss של מסמך הבדיקה הקבוע |
| `finalizeBlock()` בסביבות 1339–1390 | סיום בלוק ואיזון בסגירות מסוימות | שינוי S6.2 הוסיף `pageClose` |
| בדיקת H4–H6 `hFits` בסביבות 1732–1775 | הצבת כותרת, rollbackTrailingHeadings ומעבר עמוד/טור | מועמד לבדיקה ביחס לאובדן טקסט הכותרת "לשון הפוסקים" |
| שער תקציב הערות פרוספקטיבי בסביבות 1835–1879 | דחיית פסקה עם הערות כאשר אין די מקום | נקודת חיבור בין הערה גדולה לבין כותרות/בלוקים סמוכים |
| התאמת fit ושבירת פסקה בסביבות 1882–1978 | fit, min-2, מעבר בין טורים ועמודים | רלוונטי ל-P7 ולמקרי אלמנה/יתום |
| `placeFootnoteArea()` בסביבות 2040–2140 | פיצול/העברת הערות לעמודים הבאים | חשוד בממצאי אובדן תוכן סביב הערות ארוכות |
| content accounting בסביבות 2770–2863 | השוואת מולטיסט המקור לפלט | יוצר Ledger מסוג `content-loss` עם missing sample |

### 4.2 ממצאי אבחון בנתיב Legacy

- `EventLog` בנתיב זה נוצר בסוף הריצה עם חמשת האירועים הכלליים: parse, measure, page-plan, folio, render. אין בכך snapshots מפורטים לכל החלטת מילוי/איזון/תור הערות.
- `Ledger` כן מדווח לפחות `content-loss` ו-`column-imbalance`; רשומות אלה מוכיחות שיש בסיס לאבחון, אך אינן מספקות לבדן רצף מפורט של רכיבי העמוד בין החלטות.
- לכן יש להוסיף לנתיב Legacy אבחון סיבתי מותאם רק לאחר מיפוי ה-gap, ולא להניח שה-trace של נתיב DP מכסה אוטומטית את Legacy.

## 5. מפת מודולים וחוזים רוחביים

| שכבה | מקור אמת / חוזה | צרכנים |
|---|---|---|
| Settings | `core/settings-registry.js` + `legacy-settings-map.js` | UI, Worker, DP, Legacy |
| Measurement | `typography/measure-api.js` + `font-metrics.js` / `measure-table.js` | KP, Legacy LineBreaker, projection |
| DP line breaking | `typography/kp-linebreak.js` | DP pipeline |
| Legacy line breaking | `LineBreaker` ב-`legacy-imud-flow.js` | Legacy/IMUD |
| Note marker identity | `notes/markers.js` ב-DP; `enqueueNote` ב-Legacy | token/footnote rendering |
| DP audit | `core/events.js`, `core/ledger.js`, `audit/report-schema.js` | Worker/UI/report |
| Legacy audit | `Ledger` ו-`EventLog` בתוך `legacy-imud-flow` | Worker/UI/report |
| Geometry model | `output/geometry-projector.js` | PDF/HTML/export |
| DOM rendering | `output/dom-renderer.js` | live preview |
| Worker contract | `ui/worker-protocol.js` (typeset-request, progress, typeset-result, cancel, register-font/assets, export-request) | `worker-client.js`, `engine-worker-main.js`, app-shell |
| Automated tests | `red-build/tests/**`, `audits/**`, `tools/layout-parity/**`, `tools/layout-audit/**` | CI / Actions |

אין לייצר מודול שני לאותה אחריות. כל שינוי בחוזה Worker, תוצאת audit או מבנה Ledger חייב בדיקת תאימות ודיון עם בעלי התחומים.

## 6. פירוש מדויק של Baseline — 10.11.2026

הריצות הופעלו ב-PR #1 בריפו המראה. הן חזרו בהצלחה גם על commit העדכון התיעודי `7ce6dc675388d5ddca6777576536bf5047d73d99`:

| בדיקה | ריצה | תוצאה |
|---|---|---|
| CI (Node 18/20/22) | [42766160036](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42766160036) | SUCCESS — npm test + determinism |
| Layout parity | [42766160032](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42766160032) | HARD 4/4; PARITY 12/14; 88.9%; P6/P7 נכשלים |
| Full math audit | [42766160027](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42766160027) | SUCCESS במסלול local; live job skipped |
| Very-long corpus | artifact בריצה 42766160032 | C1–C12: 12/12; 700 עמודים; 337,622 מילים; 0 missing/extra; 0 overlap/bounds |
| Browser full-math | artifact בריצה 42766160027 | 704 עמודים; 43,117 שורות; 360,326 מילים; 0 problems; 686/686 עמודי גוף עם כותרת |
| Live deployed Pages audit | לא הופעל | NOT RUN — אין לבלבל עם local browser audit |

### 6.1 P6 — כשל רצף פסקאות

מתוך `parity-report.json`:
- 278 פסקאות בייחוס; 285 בפלט.
- headAligned=199.
- linesMatch=164; wordsMatch=143.
- 3,149 שורות מקור מול 3,160 שורות פלט.
- 21,861 מילות מקור מול 21,650 מילות פלט.
- הדוגמאות הראשונות ל-divergence שונות בתוכן הפסקה, לא רק בעמוד/טור.

### 6.2 P7 — כשל שקילות שבירת שורות

מתוך אותו report:
- ratio=**0.8098**.
- 4,080 שורות ייחוס מול 4,110 שורות פלט.
- ההבדלים הראשונים כוללים הבדלי מילה/סימן (למשל "ל למציאות" מול "לא למציאות", "מג" מול "מד") וגם הבדלי שבירה.

### 6.3 הפרדה בין הצלחות

- C1–C12=12/12 ב-`very_long_test_text.txt` מוכיחים אינווריאנטים של הקורפוס הארוך; הם אינם מוכיחים P6/P7 מול הייחוס.
- 0 בעיות באודיט הדפדפן המקומי מוכיח שהמשפחות הגיאומטריות שנבדקו עברו; הוא אינו מוכיח שקילות למקור.
- HARD 4/4 אינו מחליף את שתי בדיקות PARITY שנכשלו.

## 7. פער היסטורי שיש לחקור — P7 0.9858 לעומת 0.8098

ה-Worklog וקומיט S4.21 `9413a1152ad8d7755679a3f3cca90666c3f04288` תיעדו בעבר:
- P7=0.9858.
- HARD 4/4.
- קורפוס ארוך C1–C12=12/12.
- 406/406 בדיקות באותו שלב.

ב-Baseline הנוכחי P7=0.8098. השינוי אינו מוסבר רק על ידי העלאת/הורדת סף ratchet: היחס עצמו נמוך משמעותית.

### 7.1 שינוי מועמד — לא הוכחת שורש

ב-S6.2, קומיט `18745a55854cc25e2dddab151578f9122028cc33`, נוסף ל-`legacy-imud-flow.js` פרמטר `pageClose` ל-`finalizeBlock()` והוחזר איזון בסגירות מוקדמות מסוימות (heading-no-fit, fn-budget-gate, fit0). ב-S6.3 סף הדיווח/הפעלה הועבר מהתנהגות קשיחה ל-`imbalance-max-delta-px`, שברירת המחדל המתועדת שלו 5px.

זו נקודת חקירה מוצדקת משום ש-P7 בעבר 0.9858 והמסלול הנבדק הוא Legacy. **אין כרגע ראיה מספקת שהשינוי הזה הוא סיבת הירידה**: יש להפיק parity report לכל שינוי/נקודת ביניים או לבצע השוואה מבוקרת לפני/אחרי. אין לבצע rollback או לכייל מחדש את האיזון על סמך מתאם בלבד.

## 8. בעלות לפי חמשת התפקידים

| סוכן | אזור עיקרי | משימות מיפוי/בקרה |
|---|---|---|
| 1 — UI | `red-build/src/ui/**` | בדיקת הצגת trace/ledger ותוצאות Legacy/DP; לא לשנות כעת |
| 2 — Engine/Diagnostics | `engine/core`, `engine/layout`, `engine/typography`, `engine/notes`, `engine/output` | בעלים של ניתוח P6/P7, תוכן והשלמת אבחון סיבתי |
| 3 — Fonts/Performance | `typography/font-metrics.js`, רישום גופנים ונכסי `ui/assets/imud/fonts` | מדידות נפרדות ל-DP ול-Legacy; אין אופטימיזציה לפני מדידה |
| 4 — Tests | `red-build/tests/**`, `audits/**`, `tools/layout-parity/**`, `tools/layout-audit/**`, workflows | Baseline, fixture, negative control ואימות P6/P7 |
| 5 — Docs/Integration | `execution/**`, מסמכי מקור אמת | תיעוד מפות, ממצאים, החלטות, תלויות וסדר שילוב |

## 9. החלטות שטרם התקבלו

1. האם P6 נובע מפער בטוקניזציה/זהות פסקאות, מאופן הצגת הכותרות, מחיתוך הערות או ממודל הפקת `paraSeq` בכלי parity. נדרש דוח divergence עם source offsets.
2. האם P7=0.8098 נוצר במנוע Legacy, במסלול הגופנים/ההגדרות, באיזון S6.2/S6.3 או בכלי ההשוואה. נדרשת השוואה מבוקרת.
3. האם אובדן שתי המילים נובע מהערת-ענק עצמה או מכותרת H4–H6 שמושמטת בנקודת מעבר הנגרמת משער תקציב ההערות. המבנה של מחולל הבדיקה מראה שהמחרוזת "לשון הפוסקים" קיימת גם בבנק כותרות H4–H6. זו השערה בלבד עד לשחזור מלא בסשן 3.
4. האם נדרש להרחיב EventLog/trace ל-Legacy ב-checkpoints מפורטים, ומה ההשפעה המדודה על זמן/זיכרון.
5. יש ליישב README/OPEN_QUESTIONS/LAYOUT_DEPENDENCY_MAP מול מצב הקוד, ה-Worklog וה-run artifacts; לא לתקן תיעוד באמצעות העתקת מספרים היסטוריים.

## 10. מצב סשן 2

- [x] אימות מסלול IMUD ב-`run-ours.js` וב-dispatch של `pipeline.typeset()`.
- [x] מיפוי CP1–CP5 בנתיב DP.
- [x] מיפוי זרימת Legacy וסמני נקודות הקוד הרלוונטיות.
- [x] הצלבת Baseline: HARD, P6, P7, long corpus, full-math, determinism.
- [x] הבחנה בין מה שהבדיקות מוכיחות לבין מה שאינן מוכיחות.
- [ ] המשך ביצוע: שחזור ממוקד של אובדן הכותרת/שתי המילים בסשן 3.

**לא בוצע שינוי בקוד המנוע, UI, גופנים, בדיקות או workflows בסשן זה.**
