# PROVENANCE.md — מקורות וייחוס · Tora Book Typesetter Red
> מצב: 11.11.2026 (השלמת ביקורת provenance, הרחבת אינדקס הארכיון ותיקון בדיקת preset; הקפאת P6/P7).

## קוד
- **בסיס:** בנייה מאפס (from-scratch) לפי `spec/01_MASTER_SPECIFICATION.md` + `spec/02_MASTER_WORK_PLAN.md`. אין העתקת קוד ריצה מהגרסאות הקודמות; יש **היסק לקחים** מתועדים (lessons) שהומרו למנגנונים ולבדיקות.
- **היסקים שהומרו למנגנון חי בסגירה זו:** fixDropWordInColumns (Gold), AQ stages+caps (Gold), chapter-end modes (Green), terminal-residual (Green), en-line-prefix (V_current), 70-footnotes continuous (V21), marker-for-numbering (IMUD), page-num-in-header (Orange), folio frames (V1), gershayim עבריים (P1-8).

## מסמכים
- `spec/01_MASTER_SPECIFICATION.md`, `spec/02_MASTER_WORK_PLAN.md` — מסמכי האם של הריפו.
- `Typesetter_doc/shared/comparisons/Monster_Comparison_All_Repos_Branches.md` — קטלוג הכשלים ההיסטורי (השוואת כל הגרסאות/ענפים).
- `audits/01_PROGRESS_AUDIT.md` — ביקורת עצמאית (02.11.2026, קומיט 7d0203b) — מקור 6 ממצאי ה־P0 ו־8 ממצאי ה־P1 שתוקנו בסגירה זו.
- `audits/02_S7_CLOSURE_REPORT.md` — דוח סגירת S7 (מסמך זה נכתב במקביל).
- `ai-chat/` — תמלילי שיחות הפיתוח (qwen) כפי שהועלו לריפו.

## גופנים
- **קובצי גופן אמיתיים מוטמעים בריפו (S4.6, EXT-14):** ‏443 קובצי TTF (62MB)
  ב-`red-build/ui/assets/imud/fonts/` — הומרו מקובצי WOFF2 המקוריים של
  IMUD_TORANI (ערכת העדיפות המלאה מ-`fonts-priority.json`), כולל ארבעת
  גופני העיצוב של המקור (Frank Ruhl Libre / David Libre / Bellefair /
  Noto Serif Hebrew — SIL OFL 1.1), גופן מילת-החלון FrankReal-Bold ומשפחות
  תורניות (גוטמן רש"י, פרנק ריל, נוטו רש"י, רמז ועוד). הקטלוג:
  `ui/assets/imud/imud-fonts.json` (משפחה→קובץ).
- **חריג מתועד אחד:** Guttman-Logo1-Regular.ttf — גופן-לוגו סימבולי ללא
  cmap יוניקוד; אינו גופן טקסט, נדחה מפורשות ברישום (בדיקת בקרה).
- **כפילויות מקור מתועדות:** 19 משפחות בשני קבצים (Arial Italic.ttf /
  Arial-Italic.ttf — אותו גופן בשניים מהמקור; המפה דטרמיניסטית — ראשון
  זוכה) + כפל-שמות אחד מכוון (DavidLibre-Regular.ttf גם כ-'דוד ליברה רגיל'
  וגם כ-'David Libre' — השם שמחסניות ה-CSS של המקור משתמשות בו).
- **קטלוג מורחב (1,315 משפחות נוספות):** ‏`fonts-extended.json` — קטלוג
  שמות בלבד (קובצי המקור WOFF2, ‏115MB; אינם מוטמעים — החלטת גודל
  מתועדת). בחירת משפחה מהקטלוג המורחב מדווחת במפורש כלא-מוטמעת ונופלת
  לגופן מערכת — לא כישלון שקט.
- **רישוי:** ארבעת גופני העיצוב — SIL OFL 1.1. שאר המשפחות הומרו מאוסף
  הגופנים המקורי שהועלה ע"י המשתמש (IMUD_TORANI/fonts) לשימוש
  הפרויקט; מקור ההמרה והקטלוג מתועדים ב-ISSUE_REGISTRY EXT-14.
- **מדידה וייצוא בגופני אמת (EXT-9, 05.11):** ‏442/443 נפרסים בפרנסר
  ה-sfnt העצמאי; המדידה (font-metrics) והייצוא (PDF עם תת-גופן מוטמע)
  מוכחים ב-`tests/e2e/real-fonts.test.js` (13 בדיקות: שלמות ספרייה,
  פתרון מחסניות, hmtx/cap-height/ניקוד אמיתי, עימוד ספר-אמת שלם,
  ייצוא PDF, בקרות-כפול). פרופילי הרוחב המקורבים בקוד נותרו כנפילה
  שקופה כשאין גופן רשום בלבד.

## בדיקות
- `tests/unit/*` — נכתבו מאפס (parser 17, typography 14) לפי המפרט.
- `tests/integration/registry.test.js` — חוזה שלוש שכבות (8) עם הסורק האמיתי (D-45).
- `tests/layout/s5-s6.test.js` — 17, כולל מדיניות הערה ארוכה במסלול אמיתי (dp-planner).
- `tests/e2e/*` — pipeline 14, s7-gate 15, canonical 6 (קורפוס קנוני).
- `tests/audit/negative-controls.test.js` — 16 בדיקות anti-false-positive.
- **סוויטת layout ההיסטורית של IMUD main נשמרה בארכיון** (`reference-archive/cross-repo-2026-11-10/imud-main/layout-scenarios/`): scenarios.js, baseline.json, runner, checker, common helper ושני מסמכי קלט. ה-baseline בקומיט המקור הנעול מכיל 38 רשומות; README המקורי עדיין אומר 21 ולכן הוא stale. הסוויטה לא רצה נגד RED ואינה CI. FWD-4 הוא פריט נפרד: קורפוס הטקסט הארוך מ-IMUD כבר יובא ל-fixture פעיל ונבדק לפי ISSUE_REGISTRY.


## העברות נתונים בין מאגרים — 10.11.2026

### IMUD_TORANI — preset מקום בינה v20.5
- מקור: `SUGINACH/IMUD_TORANI@da31142ed868da987b14af5213b41495e81733c4`, נתיב `presets/makom-bina-v20.5/`.
- יובאו ללא טרנספורמציה ל-`red-build/ui/assets/imud/presets/makom-bina-v20.5/`: `default_settings.json` ושלושת קובצי `setting_sets` (תלמוד, פרשנות, קונטרס).
- כל ארבעת הקבצים אומתו כ-JSON עם 249 מפתחות. ברירות המחדל זהות בתוכן ל-fixture שכבר היה ב-RED; שלוש ערכות הסגנון שונות מהערכות הרגילות ולכן נשמרו בנתיב preset נפרד.
- Commit הייבוא ב-RED Work: `bb5996e012e2abd3cf8b8ed6fb6ac393e831b771`.
- הייבוא הוא data-only: לא חובר אוטומטית ל-UI, לא שינה הגדרות פעילות ולא השפיע על ה-pipeline.

### Gold V21 — test-triggers
- מקור: `SUGINACH/Tora_Book_Typesetter_Gold@a444d34ccad30fd5ed0d6fd3873adbe9c23cb7e0`, נתיב `test-triggers/`.
- עשרת קובצי הטריגרים הועתקו ללא שינוי אל `red-build/tests/fixtures/legacy-trigger-corpus/gold-v21/`; Git blob IDs של הקבצים המיובאים זהים ל-Gold.
- Commit הייבוא ב-RED Work: `78d0597b025f3b1586fc38d2cd4382a269b13adc`.
- הקבצים הם ארכיון מקור בלבד: אינם מחוברים ל-`npm test`, ל-CI או לנתיב יצירת מסמכים; לא הורצו נגד RED. אין לראות בהם fixtures תקינים ל-D-100 בלי התאמה ובדיקה נפרדות.
- ה-runner וה-generator הישנים לא הועתקו: הם קשורים ל-iframe ול-`window.__geomAudit` של Gold, ולתחביר מקור קודם.


## ארכיון בין-ריפואי — עדכון מלא 10.11.2026

- **נתיב:** `reference-archive/cross-repo-2026-11-10/`; אינדקס קובץ-מול-מקור: `reference-archive/cross-repo-2026-11-10/README.md`.
- נשמרו **78 קובצי מקור ייחודיים** מתשעת המקורות: Gold V21, Green V23, Orange main, Yellow V22, React main, Kotlin main, Rust main, Typesetter_doc main ו-IMUD main. שלושת המסמכים שנוספו לאחר הספירה המקורית הם React work-conventions, Typesetter_doc Session_handoff ו-Functional_gaps_analysis; לכל אחד אומת Git blob מול הקומיט והנתיב המקוריים. תשעה נתיבי ארכיון נוספים הם עותקים מדויקים עם blob זהה; מדריך IMUD אחד נוצר מקומית ואינו נספר כמקור. בעץ הארכיון 89 קבצים כולל README.
- בין החומרים: שיטות audit רב-שלבי, מודולי diagnostics/trace ישנים ובדיקותיהם, screenshot report helper, 11 line-battery raw inputs של React, 38 תרחישי layout היסטוריים של IMUD baseline, מפרטי/ADRs/מחקרים/מפות תלויות/מטריצות תאימות.
- **גבול הפעלה:** כל 78 קובצי המקור, תשעת העותקים הכפולים והמדריך המקומי הם ארכיוניים בלבד; אינם נטענים ב-runtime ואינם ב-`npm test`, ב-corpus manifests או ב-GitHub Actions. אין להריץ renderer/runner ישנים מול RED. כל התאמה עתידית תיכתב כקובץ RED חדש, מחוץ לארכיון.
- **הבהרת ספירה:** baseline של סוויטת IMUD הנעולה מכיל 38 שמות תרחיש; README המקור אומר 21 והוא stale. אין להשתמש ב-page counts/violation counts של baseline כהגדרת הצלחה ל-RED.

### אימות סוויטת IMUD ההיסטורית

- מקור: `SUGINACH/IMUD_TORANI@da31142ed868da987b14af5213b41495e81733c4`.
- הועברו 8 קבצים: `tests/layout/scenarios.js`, `baseline.json`, `run-suite.js`, `check_layout.js`, `tests/lib/common.js`, `tests/README.md`, `tests/corpus/problem_chapters.txt`, `test_doc.txt`.
- כל 8 Git blob IDs תואמים למקור. ה-harness הישן דורש Playwright/Chromium, root page, DOM selectors ומזהי הגדרות של IMUD; אין להריצו מול RED.
- המחולל הדטרמיניסטי יכול לשמש בעתיד מקור לבחירת קלטים סמנטיים, לאחר בדיקת כיסוי ו-D-100, אך אין להעתיק את baseline/הציפיות שלו ואין לבצע השוואת שורות/מילים/פסקאות.

### Makom Bina v20.5 — מצב שימוש בפועל

- ארבעת JSON נמצאים ב-`red-build/ui/assets/imud/presets/makom-bina-v20.5/` ואומתו (249 מפתחות בכל אחד).
- `red-build/src/ui/imud-library.js` כבר מגדיר `SETTING_PRESETS` נפרד עבור Makom Bina v20.5 עם `listSettingPresets/loadSettingPreset`; `red-build/src/ui/settings-panel.js` כבר מציג בחירה, preview עם מקור/גרסה וכפתור Apply מפורש. לכן לא נדרשה שכבת UI חדשה — ייבוא ארבעת קובצי הנתונים השלים את הנתיב הקיים.
- נוספה `red-build/tests/integration/setting-presets.test.js` לשרשרת הבדיקות. ריצת PR על HEAD הישן חשפה assertion שציפה ל-URL מקודד אף שהבדיקה עצמה מפענחת את הנתיב; תוקן ב-commit `31e7b4c`. אין עדיין לטעון שהריצה החוזרת עברה עד לקבלת תוצאת CI ל-HEAD המתוקן.
- ברירות המחדל הרגילות לא שונו; ה-preset אינו מופעל אוטומטית.
