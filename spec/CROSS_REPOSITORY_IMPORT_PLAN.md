# תוכנית ייבוא והטמעה בין-ריפואית — RED Work

> **מצב:** תוכנית העבודה הפעילה להטמעת רכיבים ממאגרי SUGINACH ב-RED Work.  
> **תאריך snapshot של המקורות:** 10.11.2026.  
> **מאגר יעד:** `SUGINACH/Tora_Book_Typesetter_Red_Work`, ענף `work/reference-intent-clarification`.  
> **עקרון:** לא מעתיקים קוד או נכסים שכבר קיימים. מתחילים בנתונים עצמאיים שאינם משנים runtime; רכיבי UI/אבחון מותאמים לאחר gap analysis; מנגנוני עימוד נוגעים בליבה רק לאחר הוכחת פער.

## 1. כללי ייבוא מחייבים

1. **בדיקת קיום לפני העתקה:** יש לבדוק את הקוד, הנכסים והבדיקות ב-RED Work. שם קובץ דומה אינו הוכחה שחסר רכיב.
2. **נעילת מקור:** לכל העברה נרשמים repository, branch/ref, commit, path מקור ו-Git blob ID. לנכסים/נתונים יש לוודא זהות blob לאחר ההעתקה.
3. **הפרדת נתונים מקוד:** נתון ארכיוני אינו מופעל, אינו נטען אוטומטית ואינו מצטרף ל-CI בלי החלטה נפרדת.
4. **אין שכפול מנגנון:** אם קיימים ב-RED Worker, settings registry, parser, MeasureAPI, DP, balancing, notes, audit/ledger/trace, export או asset loader — משווים חוזים לפני כל הצעה להעתקה.
5. **הגנת המנוע:** יבוא נתונים ותיעוד קודם לשינוי קוד. שינוי UI/כלי בדיקה יופרד משינוי מנוע. שינוי מנוע יחייב שחזור, ניתוח שורש ובדיקות עצמאיות לפי תחום ההשפעה.
6. **P6/P7 מושעים:** אין להריץ או לייבא עבודה שמטרתה לייצר/לנתח מדדים אלה, ואין לבצע התאמת פסקאות, מילים או שורות ל-PDF היסטורי. קבצים היסטוריים נשארים בארכיון בלבד.

## 2. סטטוס מקורות ורכיבים

| מקור נעול | רכיבים/ידע שנבדקו | מצב ב-RED Work | החלטה |
|---|---|---|---|
| **IMUD_TORANI main** `da31142ed868da987b14af5213b41495e81733c4` | 443 קובצי TTF, קטלוג מורחב, שערים, ornaments, section dividers, 3 setting sets רגילות, default settings, Makom Bina v20.5 | הגופנים והנכסים הכלליים כבר קיימים ב-`red-build/ui/assets/imud/`; ערכות הסגנון הרגילות וייבוא וריאנט makom-bina קיימים בבדיקות. | אין להעתיק שוב. חבילת Makom Bina המלאה הועברה כנתוני preset נפרדים — סעיף 3.1. |
| **Gold V21** `a444d34ccad30fd5ed0d6fd3873adbe9c23cb7e0` | test-triggers, audit-expansion, audit-text-integrity, test-trigger runner/generator, step-by-step audit, issue screenshot/PDF helpers, fixDropWord/AQ/תיקוני מנוע | מנגנוני AQ, drop-word, איזון/הערות וחלק ניכר מהאבחון כבר קיימים ב-RED; קורפוס הטריגרים לא היה קיים כארכיון. | קורפוס הטקסט הועבר ללא שינוי לארכיון. כלים/מנגנונים דורשים gap analysis; אין העתקה ישירה. |
| **Green V23** `69aac0b87e7b1262d0220e2c1eaf505bb319990a` | geometry-audit CLI, screenshot-to-PDF utility, נכסי גופן/עיטור/מפרידים, terminal residual ויכולות audit | נכסי IMUD/Orange וה-audit החי/עצמאי קיימים ב-RED. כלי ה-CLI הישן קשור ל-renderer/DOM ישנים. | לא להעתיק CLI. כלי PDF מצילומי audit מועמד להתאמה נפרדת; ראה סעיף 4.2. |
| **Yellow V22** `64f64a5b0ded3f0007a170caca463efd6cdd5e12` | engine-inputs, engine-trace, engine-diagnostics, audit kinds, workflows והשוואות A/B | RED כבר כולל EventLog, Ledger, trace, report-schema, scanners ודוח פר-עמוד; אין הוכחה שכל פרטי Yellow חסרים. | לבצע gap analysis חוזי; לא להעתיק מודולים או workflow ישנים כפי שהם. |
| **Orange main** `d9f08b9ba1cba0b17c94c46019bd423fbbb0b5d2` | מקור היסטורי/ענף בסיס, self-hosted fonts, CI/Playwright, assets ותיקוני UI | חלקים מהותיים כבר שולבו ב-lineage של RED; assets וגופנים קיימים. | לא לבצע העתקה מחודשת. לחפש רק delta ייחודי ומוכח. |
| **React main** `a2fa18e5395563e90a539a51c1f8856df393ab1b` | TypeScript/React/Tauri, packages, ContentDocument/provenance, Layout IR, shaping, CLI, audit, exports | מימוש עצמאי בשפה ובארכיטקטורה אחרת. | לא להעתיק קוד. להשתמש באפיון כמקור מחקר/ביקורת ארכיטקטונית; לקלוט דרישה רק אם חסרה ב-RED. |
| **Kotlin main** `8dc5b081d7d5c2059419c90e8a5cbca9c7e5e17c` | Kotlin/Compose, UI, import/export, settings, rendering | מוצר נפרד ופלטפורמה שונה. | לא להעתיק קוד. לבדוק רק דרישות/תרחישים ייחודיים שלא מכוסים ב-RED. |
| **Rust main** `00fe36350dbb466231a1d4a83941c350d36db232` | תכנון מנוע Rust, fixed-point, provenance, deterministic contracts, migration manifests | תכנון/מימוש נפרד; אינו תואם runtime JS של RED. | לא להעתיק engine. לשמר כרפרנס לתכנון חוזים או לביקורת, לא כיישום מקביל. |
| **Red main** `6f801568c15071a27f97918ff8479def9c719c0d` | מאגר RED המקורי | נשאר נפרד ממאגר העבודה. | אין לכתוב אליו במסגרת משימה זו. |
| **Red_Work_2 main** `3d55cb488b6aab0a13c68304f49137d083b0e588` | עותק עבודה/ענף אח, כולל עדכוני מדיניות | דומה מאוד ליעד אך אינו מקור חיצוני מוסמך לכל קובץ. | השוואה בלבד; אין להעתיק או למזג ממנו בלי diff וייחוס לכל שינוי. |

## 3. הטמעות בטוחות שבוצעו

### 3.1 IMUD — Makom Bina v20.5 (נתונים בלבד)

- מקור: `IMUD_TORANI@da31142ed868da987b14af5213b41495e81733c4`, `presets/makom-bina-v20.5/`.
- יעד: `red-build/ui/assets/imud/presets/makom-bina-v20.5/`.
- קבצים: `default_settings.json`, וכן `setting_sets/{תלמוד,פרשנות,קונטרס}.json`.
- בדיקה: כל ארבעת קובצי JSON נפתחו; לכל אחד 249 מפתחות. קובץ ברירות המחדל זהה בתוכן ל-fixture הקיים. שלוש ערכות הסגנון שונות מהערכות הרגילות ולכן נשמרו לצד ולא במקומן.
- Commit: `bb5996e012e2abd3cf8b8ed6fb6ac393e831b771`.
- גבול הפעלה: הבורר כבר קיים ב-`imud-library.js` וב-`settings-panel.js`; ארבע הערכות מופיעות כבחירת preview/apply מפורשת. אין auto-load ואין שינוי בהגדרות הפעילות עד לחיצה נפרדת על החלה. נוספה בדיקת loader ייעודית `setting-presets.test.js` המאמתת את כל ארבעת הקבצים, נתיבי הטעינה וחשבונאות המפתחות בלי להפעיל את מנוע העימוד.

### 3.2 Gold V21 — קורפוס test-triggers (ארכיון בלבד)

- מקור: `Gold@a444d34ccad30fd5ed0d6fd3873adbe9c23cb7e0`, `test-triggers/`.
- יעד: `red-build/tests/fixtures/legacy-trigger-corpus/gold-v21/`.
- הועברו 10 קובצי טקסט ללא שינוי; Git blob IDs של כל הקבצים תואמים למקור.
- Commit: `78d0597b025f3b1586fc38d2cd4382a269b13adc`.
- גבול הפעלה: אין חיבור ל-`npm test`, CI או מחולל מסמכי הבדיקה; לא הורצו נגד RED. יש ליצור מהם fixtures נגזרים רק לאחר סקירה של התחביר, D-100 וסוגי הממצאים של RED.
- `test-trigger-runner.js` ו-`generate-test-triggers.js` לא הועתקו: ה-runner תלוי ב-iframe וב-`window.__geomAudit` של Gold; המחולל מייצר פורמט מקור ישן.

## 4. מועמדים להטמעה — לפי סיכון

### 4.1 כלים עצמאיים שאפשר להתאים ללא שינוי מנוע

| רכיב מקור | תועלת אפשרית | סיבה שלא הועתק כעת | תנאי כניסה |
|---|---|---|---|
| Green `tools/build_layout_issue_screenshot_report.py` | איגוד צילומי ממצאים לדוח PDF ול-manifest | RED אינו מפיק כרגע את אותו screenshot manifest; הקוד דורש ReportLab, ויש בו הנחות/החרגות עמודים ישנות | להגדיר תחילה manifest יציב של RED, להסיר hard-coded page exclusions, להגן על נתיבי קבצים, ולבודד תלות ReportLab כאופציונלית |
| Gold `scripts/generate-issues-pdf.js` | הפקת דוח ממצאים | תלוי במבנה issue-report הישן | להשוות schema, ואז לכתוב adapter שקורא את report-schema של RED |
| Gold `scripts/step-by-step-audit.js` | חקירת השלב שבו ממצא נוצר/נפתר/בוטל וההשפעה על רכיבי עמוד אחרים | RED כבר כולל EventLog/Ledger/trace; יש סכנת יצירת מערכת שנייה | gap analysis מול ה-trace הקיים; לייבא רק שדות/מצבי lifecycle/דוחות שחסרים, עם מודל אירועים יחיד |
| Yellow `engine-inputs.js`, `engine-trace.js`, `engine-diagnostics.js` | חוזי snapshots, inputs, diagnostics ו-event details | הושלמה השוואת חוזים: settings/font run manifest חסר; trace verbosity/completeness metadata חסר; issue-centric element/sibling deltas חסרים. | המקור נשאר ארכיון; ראו `spec/YELLOW_DIAGNOSTICS_CONTRACT_GAP.md`. להוסיף רק הרחבות ל-EventLog/Ledger הקיימים. |
| Gold `audit-expansion.js`, `audit-text-integrity.js` | הרחבת סוגי ממצאים ושלמות תוכן | RED כבר מפעיל scanners, content preservation ו-negative controls | למפות סוגי audit מול `red-build/src/audit/**` ולכתוב negative controls לפני הוספה |

### 4.2 כלים שלא יועתקו כקובץ ישן

- Green `geometry-audit-cli.js`: CLI גדול הקשור ל-renderer ולמודל DOM ישנים. RED מחזיק `tools/layout-audit/` ואודיט דפדפן חי. אין להעתיק את ה-CLI; מותר לחלץ רעיון או כלל audit לאחר gap analysis.
- Yellow workflows ו-A/B: תלויים ב-renderer, iframe ובסביבת בדיקה של V22. RED משתמש ב-Worker וב-workflows אחרים. אין להעתיק workflow.
- Orange/Green assets שכבר נמצאים ב-`red-build/ui/assets/imud/`: אין להעתיק שוב.
- React/Kotlin/Rust engine code: שפות, APIs וארכיטקטורות שונות; לא ייכנסו ל-runtime JS של RED.

## 5. סדר ההמשך

1. **אימות CI — הושלם:** ב-HEAD `0d8dae7b55d5cdf03686faf21cdaf026ef6bade9` כל ארבעת ה-workflows הרלוונטיים הסתיימו בהצלחה. PR #6 נשאר פתוח ולא מוזג.
2. **מטריצת כיסוי סמנטי — הושלמה בסבב ראשון:** `spec/IMPORT_FIXTURE_SEMANTIC_COVERAGE.md` ממפה את 11 קובצי React line-battery, עשרת Gold triggers וסוויטת IMUD מול בדיקות RED. מועמדי הפער מסומנים כמועמדים בלבד, לא כבאגים.
3. **בדיקות RED-native ממוקדות:** לבדוק תחילה BiDi מעורב, ניקוד/טעמים, מקפים ורצפי whitespace; בנוסף לבדוק אם דרושות בדיקות חיוביות נפרדות ל-page-underfill ול-sparse-line. כל fixture ייכתב בתחביר RED ויעבור D-100. אין להריץ את קובצי המקור הישנים.
4. **Step-by-step audit:** למפות את ה-EventLog/Ledger/trace הקיימים ולתכנן reducer טהור של snapshots/deltas. אין logger שני ואין DOM snapshot במסלול הרגיל.
5. **Yellow/Gold diagnostic contracts — מיפוי הושלם:** ראו `spec/YELLOW_DIAGNOSTICS_CONTRACT_GAP.md`. הפערים המוכחים/חלקיים הם Run Input Manifest, metadata של trace disabled/completeness וקישור issue↔operation/sibling-deltas. היישום ייעשה כתוספת למבנים הקיימים, עם negative controls.
6. **Screenshot report:** אין כרגע producer של screenshots/manifest ב-RED. תחילה יש להגדיר manifest ו-producer של RED; רק לאחר מכן לכתוב PDF builder מוגן ועצמאי.
7. **מנוע:** לפתוח שינוי parser/layout/typography רק לאחר בדיקה RED-native שמוכיחה פער ומגדירה את תחום ההשפעה. אין להעתיק runtime ממאגרים אחרים.

## 6. תנאי השלמה של תוכנית הייבוא

- לכל מאגר מקור יש commit נעול ומטריצת רכיבים.
- לכל רכיב יש disposition: קיים, הועבר, הועבר לארכיון, דורש adapter, או לא מתאים לייבוא ישיר.
- אין קבצים שנכנסו ל-runtime בלי provenance והסבר הפעלה.
- אין כפילות של מנגנוני parser, measurement, layout, audit, trace, settings או Worker.
- נתונים שהועברו לארכיון אינם נכנסים ל-CI/production ללא החלטה נפרדת.
- אין משימות P6/P7 ואין מדדי התאמת מילים/שורות/פסקאות ל-PDF היסטורי.


## 7. חסימת כלי הייחוס הישן

בהתאם להוראת המשתמש, `compare.py` ו-`extract-reference.py` נשארים כקוד/נתונים ארכיוניים בלבד. נקודות הכניסה שלהם חסומות. `verify-corpus.py` משתמש רק בפונקציות עזר טהורות מתוך `compare.py` לבדיקת ה-PDF הנוכחי של RED מול קלטו; אין בכך הפעלת P6/P7. אין להחזיר את ה-comparator ל-CI או ל-CLI. אם בעתיד תידרש הפרדת פונקציות העזר למודול משותף, יש לבצע זאת כשינוי תחזוקה נפרד ולשמור על בדיקות C1–C12.


## 8. עדכון מצב מחייב לאחר הייבואים הנוספים — 11.11.2026

סעיפים 2–5 לעיל הם מפת הבסיס. הטבלה וההכרעות כאן מעדכנות אותן בכל מקום שבו נכתב בעבר שרכיב טרם הועבר או טרם נשמר.

### 8.1 מקורות וסטטוס העברה בפועל

| מקור | מה נשמר/הועבר | מצב הפעלה |
|---|---|---|
| IMUD main | Makom Bina v20.5 — 4 קובצי JSON (249 מפתחות); סוויטת layout היסטורית — 8 קובצי מקור | ארבעת קובצי ה-preset נטענים דרך קבוצת preset מבודדת; ה-picker מציג מקור/גרסה, preview והחלה מפורשת. סוויטת ה-layout ההיסטורית בארכיון בלבד. |
| Gold V21 | 10 קובצי test-triggers; step-audit method/runner; audit expansion/text-integrity; issue-PDF generator; trace manager ותיעוד | קורפוס הטקסט ב-fixture archive נפרד; 8 קובצי השיטה/כלים בארכיון reference. אין הרצה או CI. |
| Green V23 | screenshot-to-PDF helper ושלושה smoke fixtures; שיטת/מפת audit נשמרו באמצעות Typesetter_doc | ארכיון בלבד; נדרש manifest ו-adapter חדש של RED לפני שימוש. |
| Yellow V22 | engine-inputs, engine-trace, engine-diagnostics ו-unit tests מקוריים | ארכיון בלבד; ה-EventLog/Ledger של RED נשארים מערכת האבחון היחידה. |
| Orange main | שני מסמכי step-audit ושיטת audit מקבילה | ארכיון בלבד; ה-runner תלוי ב-globals של המימוש הישן. |
| React main | SRS; ADR 001–011; migration inventory, source manifest, settings matrix, compatibility report; 11 line-battery inputs; work-conventions | ארכיון בלבד. ה-fixtures הם קלטים סמנטיים; אין expected lines או התאמת פלט. |
| Kotlin main | Technical specification | מסמך ארכיון בלבד; אין runtime או dependencies. |
| Rust main | ADRs, compatibility/ownership, provenance/source recovery | מסמכי חוזה ארכיוניים; אין Rust engine. |
| Typesetter_doc main | תכנית יציבות, פרוטוקול טיפול בממצאים, כללי עבודה, מחקר determinism/Knuth–Plass/RTL, מפת תלויות והיסטוריה V23, issue catalog/coverage, session handoff, functional-gaps analysis ומטריצת repos | מסמכים ארכיוניים; נתונים ותוצאות CI שבהם מתוארכים לענפים ולקומיטים הישנים בלבד. אין להסיק מהם מצב RED נוכחי. |

### 8.2 ארכיון וייחוס

- הנתיב `reference-archive/cross-repo-2026-11-10/` מכיל **78 קובצי מקור ייחודיים**: 67 קובצי reference מהייבואים הקודמים, 8 קובצי סוויטת layout מ-IMUD main ו-3 מסמכים נוספים (React work-conventions, Typesetter_doc Session_handoff ו-Functional_gaps_analysis).
- קיימים גם 9 עותקי נתיב כפולים עם Git blob זהה, מדריך מקומי אחד לסוויטת IMUD ו-README האינדקס; בסך הכול 89 קבצים בעץ הארכיון.
- README הארכיון הוא אינדקס provenance ברמת קובץ: repository/ref, commit מקור, נתיב מקורי ו-Git blob ID. שלושת המקורות הנוספים אומתו מול ה-blob בקומיט המקור; תשעת העותקים הכפולים הושוו ל-blob של הקובץ הקנוני. אין להפוך אותם לקוד פעיל.
- מטריצת הכיסוי הסמנטי של חומרי React/IMUD/Gold מול בדיקות RED מתועדת ב-`spec/IMPORT_FIXTURE_SEMANTIC_COVERAGE.md`; היא אינה מחברת את חומרי הארכיון ל-CI.
- מיפוי חוזי Yellow מול EventLog/Ledger/diagnostics-v2 מתועד ב-`spec/YELLOW_DIAGNOSTICS_CONTRACT_GAP.md`; הוא אינו מייבא או מריץ את מודולי המקור.
- סוויטת IMUD: baseline הנעול מכיל **38 רשומות scenario**. ה-README המקורי אומר 21 — נתון stale ביחס ל-baseline בקומיט המקור הנעול. לא שינינו את המקור; תיעדנו את הסתירה ב-README הארכיוני.
- הייבוא אינו מעיד שכל חמשת המאגרים ההיסטוריים הועברו בשלמותם. זהו ארכיון ממוקד של רכיבים, תיעוד, harnesses ו-fixtures שנבחרו; יתר הקבצים/היסטוריית הריפו לא הועתקו.

### 8.3 אימות בטיחות

- לא הועתקו קבצי archive אל `red-build/src/**`; לא נוספו tests או fixtures ארכיוניים ל-`npm test`, corpus manifest או GitHub Actions.
- לא הורצו IMUD scenarios, Gold triggers, Yellow tests או Green helper מול RED.
- לאחר תיקון בדיקת ה-preset, ה-HEAD `0d8dae7b55d5cdf03686faf21cdaf026ef6bade9` עבר את ארבעת ה-workflows: CI (42935729134), layout-invariants (42935729131), rebuild-worker-bundles (42935729276) ו-full-math-audit (42935729156). ראה WORKLOG. PR #6 פתוח ולא מוזג.
- אין להפעיל את הכלים הישנים כדי “לוודא” את הארכיון. הזהות אומתה ברמת Git blob.

### 8.4 סדר ההמשך המתוקן

1. **Makom Bina v20.5 — הושלם ומאומת:** קבוצת preset מבודדת, picker, מקור/גרסה, preview והחלה מפורשת כבר קיימים. ארבעת קובצי הנתונים נטענים בנתיב הצפוי; בדיקת integration תוקנה ב-`31e7b4c`, וכל ארבעת ה-workflows עברו על HEAD `0d8dae7b`. לא שונתה ברירת מחדל או אחת משלוש הערכות הרגילות.
2. **React/IMUD/Gold — סקר סמנטי ראשון הושלם:** ראו `spec/IMPORT_FIXTURE_SEMANTIC_COVERAGE.md`. הקבצים הישנים נשארים ארכיון; רק מועמדים לפער ייהפכו לנגזרות RED לאחר בדיקת תחביר ו-D-100.
3. **Gold source syntax:** התחביר `כותרת N מספר K - ...` אינו מזוהה על ידי ה-lexer של RED, המקבל `כותרת N - ...`. בקובץ `test-all-triggers.txt` נמצא גם רצף כותרות H3 ללא גוף. לכן אין להריץ/לייבא את המקור ישירות.
4. **Step-by-step audit:** נותר פער של snapshots/deltas מלאים של רכיבי העמוד והאחים בחלון issue-centric. להתחיל במיפוי שדות וב-reducer טהור על אירועי RED; אין ליצור trace שני.
5. **Yellow diagnostics:** השוואת schema שדה-מול-שדה הושלמה ב-`spec/YELLOW_DIAGNOSTICS_CONTRACT_GAP.md`. מודולי המקור נשארים ארכיון; היישום העתידי יוגבל לשדות חסרים שהוכחו ולמערכת EventLog/Ledger היחידה.
6. **Screenshot PDF:** ה-helper של Green אינו תואם ל-`diagnostics-v2`, כולל החרגות DOM קשיחות ומניח manifest שאינו נוצר כיום ב-RED. לא תיכתב שכבת PDF לפני producer/manifest של RED.
7. **React/Kotlin/Rust:** תיעוד, ADRs וחוזי מקור נשמרו בארכיון; אין הצדקה להעתיק runtime זר לשפת/ארכיטקטורת RED.
