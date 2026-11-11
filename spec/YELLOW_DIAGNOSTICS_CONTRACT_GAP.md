# ניתוח פערי חוזה — Yellow V22 מול מנגנוני האבחון של RED

**תאריך:** 11.11.2026  
**ענף ו-HEAD שנבדקו:** `work/reference-intent-clarification` @ `13c142360abeff4b68c8121a6286bd5183bca4d5`  
**מקורות Yellow נעולים:** `reference-archive/cross-repo-2026-11-10/yellow-v22/`  
**מטרת המסמך:** לבדוק אילו יכולות של `engine-inputs.js`, `engine-trace.js` ו-`engine-diagnostics.js` כבר מיוצגות ב-RED, אילו אינן רלוונטיות לארכיטקטורה של RED, ומה חסר בפועל כדי לאפשר אבחון סיבתי אמין.

## 1. מסקנת הביקורת

אין להעתיק את שלושת מודולי Yellow, ואין להפעילם מול RED. הם קשורים ל-DOM, ל-globals ול-renderer של Yellow: `EngineInputs` קורא פקדים מתוך `document`; `EngineTrace` עוטף פונקציות גלובליות ושומר הפניות לאלמנטים; `EngineDiagnostics` מאתר אלמנטים באמצעות התאמת rectangles ומחבר אותם לאירועים. זה אינו חוזה הנתונים של RED.

RED כבר מחזיק:
- צילום הגדרות אפקטיבי לכל קריאת `typeset` באמצעות `{ ...getDefaultSettings(), ...(settingsIn || {}) }` בתחילת ה-pipeline.
- חוזה סטטי של מפתח↔פקד↔צרכן↔בדיקת השפעה ב-`settings-registry.js`, לצד סורקים לבדיקת dead-control / phantom-key / orphan-mechanism.
- `MeasureAPI` יחיד, רישום גופנים מפורש מתוך bytes, `registeredFonts`, מונה `fontFallbacks` ומדדי cache.
- `EventLog` יחיד, עם stage vocabulary, רצף לוגי דטרמיניסטי, `pageIndex`, payload ו-`droppedEvents`.
- `Ledger` יחיד עם עשרה מצבי lifecycle, before/after predicates, מועמדים, capacity evidence ו-reason לנסיגה.
- `diagnostics-v2`, פרוטוקול Worker שמסריאל trace ו-ledger, ו-Testing Tab שמציג ממצאים, trace, כיסוי וייצוא debug פר-עמוד.

הפער אינו "חסר מנוע trace". הפער הוא **קישור ראייתי בין ריצת קלט מסוימת, אירוע/מעבר מסוים, ממצא מסוים, והמצב של שאר רכיבי העמוד לאורך חלון הזמן הרלוונטי**. יש להרחיב את המודל הקיים, לא להקים מערכת שנייה.

## 2. מיפוי חוזה EngineInputs

| שדה/יכולת Yellow | המקבילה ב-RED | סטטוס | פער מדויק / החלטה |
|---|---|---|---|
| `textHash` | `contentHashIn` מתוך `contentHash(tokens)`, וגם אירוע `cp1-parsed` | חלקי אך מתאים למודל | RED מחשב hash למודל הטוקנים לאחר parse/normalization, ולא hash נפרד של bytes/מחרוזת המקור הגולמית. זהו hash תוכני שימושי; אין לכנותו raw-text hash. |
| צילום פקדי הגדרות בתחילת run | העתקת ההגדרות בתחילת `typeset`; ב-Worker ההודעה עוברת structured clone | מכוסה מבחינת בידוד ריצה | RED אינו קורא הגדרות מ-DOM בזמן העימוד. אין צורך ב-`beginRun/endRun` או בפקדים קפואים. ההעתקה ב-pipeline היא shallow; יש לוודא שכל ערך מורכב שמשפיע על עימוד נשמר כערך immutable/serializable לפי החוזה הקיים. |
| `settingsHash` | אין hash ייעודי של ההגדרות שהוזרמו לריצה בתוך `diagnostics-v2` | פער | התוצאה כוללת את `settings`, אבל אין fingerprint קנוני שמופיע לצד `content_hash_in` ו-`layout_hash`. נדרש תכנון canonicalization שיכלול ערכי ברירת מחדל וערכי override, ללא תלות בסדר מפתחות. |
| `settingsUsedHash/count`, `settingsMissing`, `liveReads` | `settings-registry.js` מגדיר consumers ו-`effect_test`; הסורקים בודקים קשרים סטטיים | לא שקול | RED מוכיח שהמפתח רשום ומחובר למנגנון/בדיקה, אך אינו עוקב בזמן ריצה אחרי כל קריאת מפתח בפועל. אין להוסיף DOM-read tracking; יש לשקול רק instrumentation של accessor מרכזי אם יוכח שנדרש. |
| `derivedChanged` / `derivedAtStartHash` | metadata מפוענח ל-`result.metadata`; אין פקדי `inp-book-*` שהמנוע כותב אליהם | לא רלוונטי לאותה בעיה | RED הוא model-first ואינו תלוי בערכי DOM שנותרו מהרצה קודמת. אין להעתיק את מנגנון ה-derived-control של Yellow. |
| `fontsHash/fontCount` | `MeasureAPI.registeredFonts`, רישום `registerFont`, `font-metrics`, Worker `register-font` | חלקי | קיימים נתוני רישום ומונה fallback, אך אין fingerprint של הגופנים שנכחו ברגע תחילת הריצה ואין רשומת run-level של המשפחה המבוקשת מול המשפחה שנרשמה/שימשה בפועל. |
| `lateFonts/fontErrors/unstable` | טעינת גופנים ב-`imud-library` ו-`app-shell`; אירוע measure כולל cache stats | פער אבחוני | אין תוצאת preflight אחת המקושרת ל-`jobId` ולריצת `typeset`, שמצהירה אם כל הגופנים הדרושים היו מוכנים, אילו נכשלו, ומה היה fallback בפועל. טעינה חוזרת של כל העימוד עד יציבות, כפי שעושה Yellow, אינה הפתרון המועדף ל-RED. יש למדוד מוכנות לפני התחלת הריצה ולתעד את תוצאתה, בלי rerun נסתר. |
| `cssVarsHash` | אין hash CSS ברמת מנוע | לא מקביל ישיר | חישוב פריסת RED נעשה במודל וב-`MeasureAPI`; CSS שייך לשכבת ההקרנה. אין לצרף CSS hash ל-layout input hash. במקרה הצורך יש להוסיף fingerprint נפרד לאודיט render, כדי לא לערבב שינויי CSS עם שינויי DP. |

### מסקנת EngineInputs

ההגדרה האפקטיבית כבר מבודדת ברמת ריצה, ולכן לא נדרש snapshot של פקדי DOM. הפער המועיל היחיד הוא **run-input manifest** דטרמיניסטי: hash ההגדרות האפקטיביות, hash תוכן מוגדר היטב, וזהות/מצב הגופנים שנדרשו ונרשמו לריצה. את איסוף הנתונים יש לממש במקור אמת אחד ובגבול ה-Worker, ולא דרך DOM או סריקת פקדים.

## 3. מיפוי חוזה EngineTrace

| יכולת Yellow | המקבילה ב-RED | סטטוס | פער מדויק / החלטה |
|---|---|---|---|
| שם מעבר ונתוני קריאה | `EventLog.emit(stage,label,payload,pageIndex)` | חלקי | RED מתעד אירועי אבני דרך נבחרים. אין עטיפה של כל פונקציית מנוע ואין הבטחה שכל mutation/decision פנימי פולט אירוע. |
| סדר ו-parent/nesting של קריאות | `seq`, `stage`, שעון לוגי `ts` | חלקי | אין כרגע `parentEventId` או `operationId` כללי שמאפשרים לשייך תתי-פעולות לאירוע-אב. אין להוסיף stack גלובלי; אם יידרש, להשתמש ב-context מפורש שעובר בין פעולות. |
| גאומטריה לפני/אחרי פונקציה | `Ledger.predicate_before/after`, `capacity_before/after`, נתוני candidate | חלקי וממוקד ממצא | יש ראיות גאומטריות במקום שבו נוצרת החלטת תיקון/ממצא, אך לא snapshot אחיד של כל רכיבי העמוד בכל מעבר. |
| זיהוי אלמנט באמצעות DOM ref/rect | token IDs, block/page model, `target`, `pageIndex` | לא שקול | אין להשתמש ב-DOM identity או בהתאמת rectangles. נדרשת זהות סמנטית יציבה ממודל RED, כולל lineage כאשר פסקה/בלוק מתפצלים או מתאחדים. |
| `explain(element)` | Testing Tab, `buildDebugJson(pageIndex)`, Ledger/trace | חלקי | אפשר לייצא ממצאים, ledger ואירועי trace של עמוד, אך אין query אחד שמחזיר issue-centered timeline וקושר כל אירוע/שינוי לאותו ממצא ולשכניו. |
| הגבלת נפח/אירועים שנשמטו | `droppedEvents` | חלקי | EventLog מונה stage לא מוכר שנדחה, אך לא מציג במפורש trace-disabled כמצב לא-נאסף, ואינו מצהיר על dropped element snapshots כי עדיין אין snapshots כאלה. יש להבחין בין `disabled`, `complete` ו-`dropped`. |

### נקודת בקרה שחשוב לא להחמיץ: trace-verbosity=off

ב-RED, `EventLog.emit` חוזר ללא רישום כאשר `trace-verbosity='off'`; `toTraceV2()` מחזיר `schema`, `droppedEvents` ו-`events`, אך אינו מציין במפורש את רמת ה-verbosity או האם trace נאסף. לכן אוסף אירועים ריק אינו מבדיל לבדו בין "לא אירעו אירועים" לבין "האיסוף כובה". זהו פער שקיפות קטן ומוגדר היטב. לפני הרחבת trace יש להוסיף לחוזה metadata מפורש כגון `recording`, `verbosity` ו-`complete`, עם בדיקת negative control ל-`off`. אין לדכא Ledger או ממצאים כאשר trace כבוי.

## 4. מיפוי חוזה EngineDiagnostics

| יכולת Yellow | המקבילה ב-RED | סטטוס | פער מדויק |
|---|---|---|---|
| איגוד input + trace + audit | `diagnostics-v2` וה-Worker `ui-result-v1` | מכוסה חלקית | הדוח מרכז hash תוכן/פריסה, findings, retreat, ledger ו-trace; חסר run-input manifest של settings/fonts. |
| קישור finding ל-element trace | `finding.id`, `target`, `page`, Ledger `issue_id` | פער | אין קישור מפורש מה-finding אל event/operation IDs או אל חלון checkpoints. |
| סיבתיות לפני/אחרי | predicates ו-lifecycle transitions ב-Ledger | מכוסה חלקית | יש ראיות ברמת issue, אך לא תמיד ניתן לזהות את המעבר הראשון שבו predicate השתנה, ולא כל side-effect על רכיבי עמוד אחרים נשמר. |
| ממצאים על siblings באותו עמוד | `pages` נשמרים ב-result; בדיקת coverage/geometry | פער | אין deltas שמפרטים added/removed/moved/resized/restyled עבור כלל רכיבי אותו עמוד מאז הופעת הממצא ועד השלב הגורם/החוסם/המבטל. |
| מסך בדיקה ואבחון | Testing Tab: findings, trace table, coverage cards, lifecycle summary; ייצוא debug פר-עמוד | מכוסה חלקית | התצוגות נפרדות. נדרש issue-centered view שיציג אותן יחד, אך רק לאחר שקיים reducer/manifest אמין. |

## 5. ארכיטקטורת ההשלמה המומלצת

יש לשמור על שלושה רכיבים פעילים בלבד:

1. **Run Input Manifest** — נוצר בתחילת ריצת `typeset`/Worker. יכלול `contentHash` עם הגדרה מדויקת, `settingsHash` קנוני, גרסת settings schema, `measureImpl`, ושמות/טביעות אצבע של הגופנים הזמינים בפועל. שדות שאינם ידועים יירשמו כ-`unknown`, לא יושמטו בשקט. כישלון טעינת גופן יירשם כ-fallback/error מפורש.
2. **EventLog + Ledger** — נשארים יומן האירועים ומחזור החיים היחידים. הרחבות עתידיות יוסיפו מזהי operation/checkpoint וקשרים ל-`issue_id`, לא logger מקביל ולא monkey-patching.
3. **StepAudit reducer** — פונקציה טהורה שמקבלת snapshots/deltas של מודל העמוד שכבר נוצרו ומחזירה issue windows, sibling changes, completeness ו-verdict. מתחילים ב-unit tests עם snapshots סינתטיים; רק אחר כך שוקלים checkpoints opt-in במנוע.

### שדות שחייבים להישאר נפרדים

- `contentHash` ≠ `settingsHash` ≠ `fontManifestHash` ≠ `layoutHash`.
- `trace disabled` ≠ `trace complete with zero events`.
- `not-comparable` ≠ `no-change`.
- שינוי render/CSS ≠ שינוי בגאומטריית המודל.
- העדר אירוע/element עקב cap או איסוף כבוי אינו ראיה לכך שלא היה שינוי.

## 6. סדר הטמעה לפי סיכון

1. **הושלם — מיפוי חוזים ושיטת audit:** המסמך הזה, `STEP_BY_STEP_AUDIT_GAP_ANALYSIS.md` ו-`step-by-step-audit-Method.md` מגדירים את הפער ואת הגבול הארכיטקטוני. Yellow נשאר archive-only.
2. **בוצע בקוד — חוזה trace-v2:** commit `69a80232` הוסיף capture metadata (`recording`, `verbosity`, `eventStreamComplete`, `droppedEvents`, `omittedFields`) ובדיקות ל-`off`/`minimal`/`standard`/`full` ול-stage שנדחה. bundles סונכרנו ב-commit `fdcdfda3`; ריצות המשך על commit הבוט סומנו action_required, ולכן שערי CI ל-HEAD הסופי עדיין אינם מאומתים.
3. **נמוך-בינוני — Run Input Manifest טהור:** canonicalize settings ונתוני font registry, לחשב hashes דטרמיניסטיים ולבדוק רגישות לשינוי/סדר מפתחות. אין קריאת DOM ואין rerun.
4. **נמוך-בינוני — StepAudit reducer:** יחידה טהורה על snapshots/deltas סינתטיים: identity, split/merge lineage, page sibling changes, missing data, caps, issue lifecycle ו-verdict. עדיין ללא instrumentation במנוע.
5. **בינוני — קישור אירועים לממצאים:** להוסיף operation/checkpoint IDs וקשר ל-`issue_id` רק לאחר שהמודלים הטהורים נבדקו.
6. **גבוה יותר — instrumentation opt-in:** רק אם ה-reducer מוכיח שאין די מידע מהאירועים הקיימים; להשתמש בגאומטריית מודל בלבד ובדגימה ממוקדת-עמוד. לשמור no-op proof על layout/content hashes.
7. **ממשק:** להרחיב את Testing Tab בתצוגת issue-centered רק לאחר יציבות הסכמה.

## 7. גבולות שאינם משתנים

- אין להשתמש ב-`document.fonts`, ב-DOM rectangles או ב-global monkey-patching כתחליף למודל RED.
- אין להקים EngineInputs/EngineTrace/EngineDiagnostics חדשים לצד EventLog/Ledger.
- אין לשנות parser, DP, balancing, renderer או Worker כחלק ממיפוי זה.
- קובצי Yellow והבדיקות המקוריות נשארים ארכיון בלבד ואינם מחוברים ל-CI.
- P6/P7 מחוץ לתחום לחלוטין; אין לבצע חישוב, הפעלה, דוח או התאמה שלהם.



## 8. עדכון מימוש — 11.11.2026 (מחליף את סעיפי הסדר הקודמים)

- trace-v2 capture metadata הוכנס ב-commit 69a80232, ונבדק ב-off/minimal/standard/full; bundles סונכרנו אוטומטית.
- Pure StepAudit reducer קיים בקוד ובבדיקות יחידה: commits ba233987, 91b38c3c ו-2bfb7245. הוא מכסה snapshot/delta סינתטי, textChanged, pageMoves, same-page split/merge ו-verdicts שמרניים.
- אין עדיין adapter מה-page model האמיתי. ה-Ledger מספק page מספרי ו-target טקסטואלי בלבד; אין להסיק מהם מזהי pageId/elementId.
- השלב הבא הוא מיפוי מודל RED ויצירת adapter טהור, ורק לאחריו קישור issue/operation והוספת checkpoints אופציונליים.
- Yellow נשאר archive-only. אין DOM geometry, global monkey-patching או מערכת trace שנייה.
