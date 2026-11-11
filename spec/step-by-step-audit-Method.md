# שיטת Step-by-Step Audit למנוע RED

**מעמד:** מפרט שיטה ליישום מדורג; אינו מצהיר שהמנגנון המלא כבר מומש.  
**תאריך:** 11.11.2026  
**ענף עבודה:** `work/reference-intent-clarification`  
**תחולה:** מנוע RED בלבד — EventLog, Ledger, מודל העמוד, diagnostics-v2 ו-Testing Tab.  
**מסמכי ליווי:** `STEP_BY_STEP_AUDIT_GAP_ANALYSIS.md`, `YELLOW_DIAGNOSTICS_CONTRACT_GAP.md`.

---

## 1. מטרת הבדיקה

להחליף ככל האפשר בדיקה חזותית ידנית של מקור הבעיה במנגנון שמוכיח, על בסיס נתוני RED, באיזה שלב:

1. ממצא הופיע לראשונה כשהיעד כבר היה קיים וניתן להשוואה.
2. ניסיון תיקון לא הוחל, נדחה או נחסם — ומדוע.
3. תיקון שהוחל הצליח, ולאחר מכן בוטל או הוחמר על ידי פעולה מאוחרת.
4. שינוי באלמנט אחר באותו עמוד שינה את הקיבולת או את התנאים ויצר תופעת לוואי.
5. הממצא רק נעשה ניתן לצפייה בשלב מאוחר יותר, מפני שהמדידה או הישות עדיין לא היו קיימות קודם.
6. אין די ראיות לקבוע סיבתיות — ואז התוצאה חייבת להישאר `not-comparable` או `unresolved`.

הדרישה המכרעת היא **לא לתעד רק את האלמנט הבעייתי**. לכל עמוד שהפך רלוונטי בגלל ממצא, יש לשמר את מצב כל יתר האלמנטים שהשתתפו בו, ואת כל האלמנטים שנוספו, הוסרו או השתנו מאז הופעת הממצא הראשונה ועד לשלב שיצר אותו, חסם את תיקונו או ביטל תיקון קודם.

## 2. גבולות ארכיטקטוניים

### 2.1 מקור אמת יחיד

הבדיקה תרחיב את המבנים הקיימים:
- `EventLog` — סדר אירועים ושלבים, עם metadata מפורש של מצב איסוף.
- `Ledger` — זהות הממצא, predicate לפני/אחרי, lifecycle, candidates, capacity ו-rollback evidence.
- מודל העמוד והטורים של RED — מקור הגאומטריה והזהויות.
- `diagnostics-v2` ופרוטוקול Worker — העברת התוצאה.
- Testing Tab — תצוגת ממצאים, trace, כיסוי וייצוא debug.

אסור להקים logger, trace manager או issue registry שניים.

### 2.2 אין שימוש במנגנון DOM הישן

אין להשתמש ב-`iframe`, ב-`getBoundingClientRect()`, ב-`document.fonts`, ב-global monkey-patching או ב-renderer ישן כדי לבנות את בדיקת RED. מקור האמת הוא הגאומטריה שכבר קיימת במודל של RED.

### 2.3 הפרדה בין שלוש שכבות

יש להבחין תמיד בין:

1. **מצב ממצא:** לדוגמה `created`, `correction-blocked`, `resolved`, `reintroduced`.
2. **שינוי באלמנט:** לדוגמה `added`, `removed`, `moved`, `resized`, `restyled`.
3. **ממצא גאומטרי/טיפוגרפי על האלמנט:** לדוגמה `widow-bottom`, `orphan-top`, `column-imbalance`, `containment`, `page-underfill`, `sparse-line`.

אלו אינם שמות חלופיים. אלמנט יכול להיות `moved` בלי ממצא; ממצא יכול `persist` גם בלי שינוי באלמנט; ואותו אלמנט יכול לשאת כמה ממצאים שונים.

## 3. יחידות זהות ומידע שנשמר

### 3.1 זהות ריצה

כל audit קשור ל-`runId` חד-משמעי ול-manifest של הקלט:
- hash תוכן מוגדר;
- hash קנוני של settings אפקטיביים;
- גרסת חוזה settings;
- מימוש המדידה;
- manifest גופנים ומצב זמינותם;
- מצב איסוף ה-trace.

חסר מידע אינו מושמט בשקט: הוא מקבל ערך מפורש `unknown` וסיבת חוסר.

### 3.2 זהות checkpoint ופעולה

כל checkpoint נושא:
- `checkpointId` יציב;
- `seq` לוגי מונוטוני;
- `stage` מתוך ה-stage vocabulary של RED;
- `operationId` כאשר יש פעולת מנוע מוגדרת;
- `parentOperationId` אם קיימת פעולה מקוננת;
- `runId`;
- עמודים שנכללו והצהרת completeness.

אין להשתמש בשעון קיר כדי לקבוע סיבתיות. הסדר נקבע לפי רצף האירועים וה-checkpoints הלוגי.

### 3.3 זהות עמוד

`pageIndex` הוא מיקום ברצף, לא זהות יציבה. הכנסת שער, עמוד הערות או תוכן עניינים יכולה להזיז אינדקסים.

יש להעדיף:
1. מזהה עמוד יציב אם קיים במודל.
2. מזהה סמנטי שמבוסס על עוגני token/section ועל סוג העמוד.
3. התאמה מורכבת רק אם היא יחידה וחד-משמעית.

אם שתי אפשרויות מתאימות לאותו עמוד, או שאין עוגן יציב, יש לסמן `pageIdentityAmbiguous` ולהחזיר `not-comparable`. אסור להסיק שהעמוד "השתנה" רק מפני שהאינדקס שלו השתנה.

### 3.4 זהות אלמנט

זהות של אלמנט טקסטואלי תתבסס, לפי הזמינות, על:
- `tokenId`;
- `fragmentId` או מזהה שבר;
- `role` סמנטי;
- מזהה parent/container;
- מיקום קריאה/סדר לוגי.

אלמנטים שאינם טקסט — כותרת עליונה, גיליון, עיטור, מפריד, אזור הערות, טור — יקבלו מזהה סמנטי המבוסס על סוג, סלוט, עמוד/חלק והורה.

כאשר פסקה או בלוק מתפצלים או מתאחדים, יש לתעד `lineage` מפורש: parent→children או children→parent. אין להתאים לפי טקסט קצר, y או גובה בלבד. בהיעדר lineage אמין, יש לסמן `identityAmbiguous`.

### 3.5 כרטיס אלמנט

לכל אלמנט במלאי העמוד יישמר תקציר נתונים:
- `elementId`, `role`, `parentId`, `tokenId`, `fragmentId`, `lineage`;
- `pageId`, `columnId`, `readingOrder`;
- גאומטריית מודל: x/y/w/h, baseline/line boxes אם קיימים, capacity/used אם רלוונטי;
- attributes שמשפיעים על החלטות: רמה, מצב הערה, continuation, full-width, side-note, decoration mode;
- `findingRefs[]` — מזהי ממצאים המשויכים לאלמנט;
- `textDigest` ו-preview קצר, רק כשנדרש לזיהוי אנושי.

אין צורך לשכפל טקסט מלא לכל checkpoint. יש לשמור את הייצוג הסמנטי ואת המדדים הדרושים להוכחה.

## 4. תוכנית checkpoints

### 4.1 checkpoints ברירת מחדל

הצילום המפורט יהיה opt-in בלבד, ורק לעמודים שבהם קיים ממצא או שהשתתפו בניסיון תיקון/rollback.

נקודות גבול מומלצות:
1. אחרי יצירת מודל שורות/בלוקים ולפני תכנון העמודים.
2. אחרי תכנון עמודים ראשוני.
3. אחרי הגנות, איזון, retreat ופעולות שינוי גבולות.
4. אחרי תקצוב/הכנסת הערות ו-refit.
5. אחרי עיטורים, הערות צד, כותרות, גיליונות ותוכן עניינים.
6. לפני החזרת התוצאה ל-Worker/UI.

יש להתאים את שמות ה-checkpoints לשלבים שמתקיימים בפועל ב-pipeline; אין ליצור checkpoint מלאכותי לשלב שלא ביצע פעולה.

### 4.2 checkpoint ראשוני שאינו תקין

הבעיה הראשונה שמופיעה ב-checkpoint הראשון אינה בהכרח נוצרה בו. אם לא נשמר מצב קודם, הסיווג הוא `created-at-first-observable-checkpoint` או `unresolved`, לא `created-by-stage`.

### 4.3 הרחבה ממוקדת

אם הפער בין שני checkpoints רחב מדי, מוסיפים checkpoint פנימי רק:
- לעמודים שכבר סומנו;
- לסוג הממצא הרלוונטי;
- סביב הפעולה החשודה;
- או סביב ניסיון תיקון מסוים.

אין להפעיל snapshots מלאים אחרי כל פונקציה בכל מסמך רגיל.

## 5. תוכן snapshot ו-delta

### 5.1 מלאי עמוד מלא

בכל checkpoint רלוונטי יישמר מלאי של כל האלמנטים באותו עמוד, לא רק האלמנט שעליו נורה הממצא. המלאי כולל:
- פסקאות, שברי פסקאות ושורות;
- כותרות מכל הרמות;
- טורים ומפרידים;
- הערות שוליים, הערות סיום, הערות צד וסמני הערות;
- עיטורים, שערים, כותרות עליונות וגיליונות;
- אזורי תוכן, קיבולת וגובה שמור.

יש לתעד גם אלמנטים תקינים שאין להם ממצא. אחרת אי אפשר לזהות תופעת לוואי או שינוי במתחרה על הקיבולת.

### 5.2 סיווג delta

ה-delta בין שני checkpoints עוקבים יכלול:
- `added` — אלמנט שהופיע לראשונה;
- `removed` — אלמנט שנעלם;
- `moved` — שינוי x/y או שינוי במיקום הקריאה;
- `resized` — שינוי w/h או line geometry;
- `restyled` — שינוי מאפייני סגנון שאינו שינוי גאומטרי;
- `reparented` — מעבר parent/container;
- `split` / `merged` — שינוי lineage;
- `unchanged` — נשאר בר-השוואה ולא השתנה.

יש להפריד גאומטריה משינוי סגנון. צבע או עיטור אינם סיבה לטעון ששבירת העמוד השתנתה, אלא אם הוכח שהשינוי השפיע על מדידה/קיבולת.

### 5.3 נתוני עמוד

לצד האלמנטים נשמרים מדדי העמוד שהמודל מספק:
- מספר/זהות טורים;
- גובה ורוחב זמינים;
- גובה מנוצל בכל טור;
- קיבולת לאחר מרזב/מפריד/תקציב הערות;
- גובה אזור הערות ויתרתו;
- בלוקים חוצי-טורים;
- מספר אלמנטים מכל role;
- סטטוסי ממצאים בעמוד.

### 5.4 חלון ממצא

לכל `issue_id` יש ליצור `issueWindow` הכולל:
- checkpoint ראשון שבו הממצא בר-השוואה;
- checkpoint אחרון שבו predicate היה תקין;
- checkpoint ראשון שבו predicate נכשל;
- ה-stage/operation שביניהם;
- כל ניסיונות התיקון הרלוונטיים והסיבות לקבלתם/דחייתם;
- כל המעברים ב-Ledger;
- מלאי מלא של העמוד בכל נקודת זמן בחלון;
- כל ה-deltas של יתר האלמנטים באותו עמוד;
- שינויים בקיבולת, בגובה ובמיקום;
- רמת הוודאות והסיבות למגבלות.

החלון מתחיל מהופעת הממצא הראשונה שניתן להשוות, לא מה-checkpoint שבו נוח להתחיל. הוא מסתיים בשלב שהוכח שיצר את הבעיה, חסם תיקון, ביטל תיקון או הותיר אותה unresolved.

## 6. סיווג סיבתיות — רף הוכחה

| סיווג | תנאים הכרחיים | מה אסור להסיק |
|---|---|---|
| `created-by-stage` | אותו issue/target בר-השוואה; predicate תקין לפני הפעולה ונכשל מיד אחריה; הפעולה מזוהה | הופעה ראשונה ללא checkpoint קודם אינה הוכחה |
| `correction-blocked` | קיים ניסיון תיקון בפועל; ה-Ledger/operation מתעדים candidate, rejection או skip reason; predicate נשאר נכשל | עצם קיומו של ממצא שלא תוקן אינו מוכיח שניסיון נחסם |
| `correction-reverted` | predicate השתפר/נפתר לאחר תיקון, ואחר כך חזר/הוחמר; הפעולה המאוחרת מזוהה | סדר זמנים בלבד אינו מוכיח שהפעולה המאוחרת ביטלה את התיקון |
| `became-observable-later` | לפני כן חסרה מדידה/ישות/עמוד או שה-predicate לא ניתן לחישוב; בהמשך נוצרה אפשרות מדידה | היעדר ממצא קודם אינו נחשב מצב תקין |
| `competing-repair-side-effect` | אלמנט אחר באותו עמוד השתנה; קיימת תלות נמדדת בקיבולת/מיקום/תכנון; השינוי קשור ל-predicate שהוחמר | שינוי באח סמוך ללא ראיית תלות אינו סיבתיות |
| `persists` | אותו target/predicate נשאר נכשל ב-checkpoints בני-השוואה | זהות לא ודאית אינה מאפשרת persistence |
| `resolved` | predicate עבר מתקלה לתקין ונשאר כך בחלון שנבדק | disappearance בגלל page identity loss אינו resolution |
| `reintroduced` | ממצא resolved חוזר על target תואם או lineage מוכח | התאמת טקסט/מיקום משוערת אינה מספיקה |
| `not-comparable` | עמוד/אלמנט/fragment identity אינם חד-משמעיים | אין לכנותו no-change |
| `unresolved` | חסר checkpoint, predicate, operation evidence או completeness | אין לבחור את השלב הסמוך כגורם משוער |

### 6.1 הקשר בין סטטוס הממצא לבין סוגו

הסטטוס הוא lifecycle של ה-issue. ה-kind מתאר את התנאי:
- טיפוגרפיה: `sparse-line`, `runt-line`, `widow-top/bottom`, `orphan-top/bottom`, `drop-word`, `note-marker-line-break`.
- גאומטריה: `column-imbalance`, `page-underfill`, `containment`, `stretch-overshoot`.
- הערות: `fn-split-column`, `fn-split-page`, `fn-overlap`, `fn-out-of-order`, `side-note-overflow`, `h7-conversion-missing`.
- מבנה/תוכן: `heading-escort`, `reading-order-break`, `text-completeness`, `paren-cross-boundary`, `unmatched-closer`.
- גרפיקה/עימוד: `ornament-overflow`, `ornament-overlap`, `ornament-asymmetry`, `divider-height`, `pn-sequence`, `pn-overflow`.

אין לאחד `sparse-line` עם `runt-line`, ואין לאחד `widow` עם `orphan`. אלו predicates שונים וצריכים להישאר מובחנים.

### 6.2 פטורים ו-non-findings

ה-audit חייב לשמור את כללי הפטור של RED. לדוגמה, `terminal-residual` ו-`containment-rounding` מוגדרים non-findings; פתיחת חלק ועמוד סיום אינם בהכרח `page-underfill`. אין להפוך עמוד לפגום רק משום שהוא לא מלא, בלי לבדוק את סוגו ואת predicate התקף.

## 7. מצב איסוף ושלמות ראיות

כל דוח יציין:
- האם trace נאסף או כובה;
- רמת verbosity;
- מספר אירועים שנדחו;
- מספר snapshots/אלמנטים שהושמטו עקב caps;
- מספר זהויות עמומות;
- מספר עמודים שלא ניתן היה להשוות;
- האם ה-issue windows שלמים;
- אילו שדות הושמטו במכוון.

`trace-verbosity=off` אינו יכול להציג רשימת אירועים ריקה כאילו היא הוכחה שלא אירעו החלטות. שינוי ה-trace-v2 התוספתי מ-`69a80232` מוסיף capture metadata; יש להמשיך לשמור את ההבדל בין disabled, complete ו-incomplete.

אם חסר מידע, התוצאה אינה "אין שינוי", אלא `incomplete` עם סיבה. אין להסתיר אירוע שנשמט או אלמנט שחצה cap.

## 8. מבנה פלט מוצע

השמות הסופיים יותאמו למודלים הקיימים, אך המבנה הלוגי צריך לכלול:

```json
{
  "schema": "red-step-audit-v1",
  "runId": "run-...",
  "capture": {
    "recording": true,
    "verbosity": "full",
    "complete": false,
    "droppedEvents": 0,
    "droppedSnapshots": 1,
    "ambiguousIdentities": 2,
    "reasons": ["element-cap"]
  },
  "checkpoints": [
    {
      "checkpointId": "cp-03",
      "seq": 31,
      "stage": "balance",
      "operationId": "op-...",
      "pageIds": ["page-..."]
    }
  ],
  "deltas": [
    {
      "fromCheckpoint": "cp-02",
      "toCheckpoint": "cp-03",
      "pageId": "page-...",
      "added": [],
      "removed": [],
      "moved": [],
      "resized": [],
      "restyled": [],
      "reparented": [],
      "split": [],
      "merged": []
    }
  ],
  "issueWindows": [
    {
      "issueId": "column-imbalance@...",
      "kind": "column-imbalance",
      "status": "created-by-stage",
      "firstComparableCheckpoint": "cp-02",
      "lastGoodCheckpoint": "cp-02",
      "firstBadCheckpoint": "cp-03",
      "causalOperation": "op-...",
      "evidence": [],
      "pageTimeline": [
        {
          "checkpointId": "cp-03",
          "targetElementState": {},
          "targetFindings": [],
          "siblingInventory": [],
          "siblingDeltas": [],
          "pageMetrics": {}
        }
      ]
    }
  ]
}
```

הדוגמה סכמטית בלבד. אין לטעון שמזהים או שדות אלה קיימים כיום במנוע.

## 9. תהליך אבחון כשלא נמצאה הסיבה

יש לבצע את ההרחבה בהדרגה, ורק על אותו issue/עמוד:

1. **בדיקת שלמות:** האם trace כבוי? האם יש dropped events/snapshots? האם נחתך חלון הזמן? אם כן, אין להסיק סיבתיות.
2. **בדיקת זהות:** האם page identity ו-element lineage יציבים? אם לא, לשפר מזהה סמנטי; לא להרחיב snapshots לפני פתרון עמימות.
3. **בדיקת predicate:** האם תנאי הממצא מוגדר כמותית ומחושב באותה דרך בכל checkpoint? אם לא, לתקן את מדידת ה-predicate/negative control.
4. **הקטנת חלון:** להוסיף checkpoint אחד בין ה-checkpoint האחרון התקין לראשון הפגום, סביב operation מסוים.
5. **הרחבת מלאי עמוד:** להפעיל inventory מלא של כל האלמנטים באותו עמוד, כולל הערות, כותרות, עיטורים ומפרידים, ולא רק target.
6. **בדיקת קיבולת ותלות:** לתעד capacity before/after, תוספת גובה, מרווחים וגבולות של אזורי הערות; לקשור שינוי באלמנט אחר רק אם יש תלות מדידה.
7. **בדיקת ניסיון תיקון:** לאתר candidate, route, rejection reason, selected action ו-rollback. אם אין evidence של ניסיון, אין לקבוע correction-blocked.
8. **instrumentation ממוקד:** אם עדיין חסר מידע, להוסיף event/checkpoint opt-in לפעולה אחת. אין להוסיף logger שני או snapshot DOM.
9. **סיווג סופי:** אם לא הושגה הוכחה, להשאיר `unresolved` ולפרט בדיוק איזה נתון חסר.

## 10. אפשרויות כיוונון

הכיוונון מחולק לעומק האיסוף, תחום האיסוף, זהות, וספים. אין לשנות ספים כדי להפוך ממצאים לאדומים פחות.

| פרמטר | אפשרויות | ברירת מחדל מומלצת | מתי להרחיב |
|---|---|---|---|
| `checkpointGranularity` | pipeline / stage / operation / page / element | pipeline + stage | כשהממצא נוצר בתוך שלב רחב |
| `pageScope` | pages-with-findings / affected-pages / selected-pages / all-pages | affected-pages | כשהעמוד הקודם/הבא עשוי להיות מעורב |
| `issueKinds` | רשימת kinds או all | kinds שנמצאו + תלויים | כשה-predicate הראשוני צר מדי |
| `elementRoles` | role allowlist או all | כל האלמנטים באותו עמוד | כשיש חשד לאלמנט שלא נכלל במלאי |
| `maxCheckpoints` | cap דטרמיניסטי | מספיק לכל חלון הממצא | כשהחלון נחתך; יש לדווח cap |
| `maxElementsPerPage` | cap דטרמיניסטי | ללא חיתוך בעמודי ממצא, cap בעמודים אחרים | כאשר הדוח גדול; לעולם לא לחתוך עמוד ממצא בלי לציין זאת |
| `identityMode` | strict / lineage-assisted / ambiguous-allowed | strict | כשיש split/merge; להוסיף lineage, לא התאמת טקסט מקרית |
| `geometryPrecision` | exact model values / quantized | exact model values | רק אם נדרשת הפחתת רעש מספרי, תוך שמירת המקור |
| `textPreviewLength` | 0 / short / extended | short | כשצריך לזהות תוכן; digest תמיד עדיף על טקסט מלא |
| `captureMode` | off / summary / affected-pages / deep | off במסלול רגיל; affected-pages באודיט יזום | כשיש צורך בחקירה ממוקדת |
| `causalityStrictness` | strict / diagnostic-candidate | strict | diagnostic-candidate רשאי להציע חשוד, אך לא לקבוע סיבתיות |
| `dependencyChecks` | capacity / parent-child / reading-order / all | all available | כשנחשד side effect של אלמנט אחר |

### 10.1 כללי כיוונון

- מתחילים מהרחבת רזולוציית checkpoints, לא מהרחבת מספר המסמכים.
- מרחיבים תחילה לעמוד ולכל האלמנטים שבו, ורק אחר כך לכל המסמך.
- כאשר יש עמימות זהות, מוסיפים token/fragment lineage; לא מחליפים מזהה לפי y או טקסט.
- כאשר הממצא אינו מופיע, בודקים את תנאי הסף ואת negative control. אין להנמיך threshold רק כדי לייצר ממצא.
- כאשר התיקון לא חל, מתעדים את סיבת הדחייה, לא רק את העובדה שהבעיה נשארה.
- כאשר התיקון בוטל, נדרשת עדות לרצף תקין→תיקון→חזרה. אין לסווג לפי סמיכות בזמן.
- כאשר הבעיה הופיעה ב-checkpoint הראשון, יש להוסיף checkpoint קודם/פנימי; אין לבחור אוטומטית את השלב הראשון כגורם.

## 11. תקציב ביצועים

1. מסלול עימוד רגיל אינו מבצע snapshots מפורטים.
2. audit מופעל רק לפי בקשה או הגדרת diagnostic מפורשת.
3. צילום מלא נשמר רק בעמודים הרלוונטיים ובשכנות שנדרשות לחלון הממצא.
4. חתימות וסיכומי עמוד יהיו דטרמיניסטיים; ה-delta מחושב מחוץ למסלול ההחלטות של ה-DP.
5. כל cap מגדיל את מוני החסר ומסמן completeness=false.
6. אין להפעיל audit שמבצע re-typeset, משנה settings או משפיע על geometry.
7. יש להוכיח no-op: הפעלה וכיבוי של איסוף האבחון אינם משנים layout hash או content preservation.

## 12. קריטריוני קבלה ליישום

יישום מלא ייחשב תקין רק אם:
- כל issue window קשור ל-`issue_id` קיים ב-Ledger או מסומן במפורש כלא משויך.
- לפני/אחרי נמדדים על אותה זהות סמנטית או מסומנים not-comparable.
- מלאי העמוד כולל גם אלמנטים ללא ממצא.
- כל delta כולל from/to checkpoint.
- correction-blocked מכיל ניסיון תיקון וסיבת חסימה.
- correction-reverted מכיל רצף הוכחה של תיקון ולאחריו החמרה.
- competing-repair-side-effect מכיל sibling delta וראיית תלות בקיבולת/גאומטריה.
- trace disabled, trace incomplete ו-trace complete מובחנים.
- בדיקות חיוביות ושליליות מוכיחות רגישות וספציפיות.
- כשלי זהות, truncation ונתון חסר מובילים ל-unresolved/not-comparable, לא ליצירת סיבתיות משוערת.
- האיסוף אינו משנה את פריסת RED.

## 13. גבולות מחייבים

- אין שימוש ב-harness, runner או renderer ההיסטוריים.
- אין שימוש ב-PDF הישן כיעד גאומטרי או כתוצאת קבלה.
- אין חיבור של קורפוס ארכיוני ל-CI ללא החלטה נפרדת והמרה לתרחישי RED תקינים לפי D-100.
- אין העתקת קוד React/Kotlin/Rust/Gold/Green/Yellow אל runtime.
- P6/P7 נשארים מחוץ לתחום לחלוטין.

---

**סטטוס נכון ל-12.11.2026:** reducer טהור קיים ב-red-build/src/engine/audit/step-audit-reducer.js; adapter למודל העמוד האמיתי קיים ב-red-build/src/engine/audit/step-audit-model-adapter.js. שניהם נכללים ב-npm test וב-test:unit. ה-adapter מפיק normalized checkpoint מתוך אובייקטי RED קיימים, עם page identity תחומה לריצת adapter, line-seq ו-token/fragment identities, מלאי גאומטרי של רכיבים, Ledger mapping שמרני ו-completeness reasons. נוסף גם מסלול ממוקד ל-parenthesis ranges: DP משמר lineIdx, מיפוי source-word refs עוקב אחר מילים שעברו drop-word repair, וה-pipeline מריץ מחדש רק את predicate של parenConsistency אחרי יצירת הטווחים. עם זאת, אין עדיין producer כללי של checkpoints בכל שלבי pipeline/Worker, אין קישור operation מלא לכל פעולות התיקון, ואין UI issue-centered ב-Testing Tab. לכן המנגנון המלא עדיין אינו Step-by-Step Audit כללי של מסמך אמיתי; יש adapter פעיל לבדיקה ומסלול סוגריים ממוקד בלבד.


## 14. מצב המימוש הראשון — Pure reducer

### 14.1 קבצים והיקף
- מימוש: red-build/src/engine/audit/step-audit-reducer.js.
- בדיקות: red-build/tests/unit/step-audit-reducer.test.js.
- הפעלה: npm test וכן npm run test:unit.
- המודול אינו מיובא על ידי pipeline.js, engine-worker-main.js או Testing Tab. עצם הימצאותו ב-src/engine/audit/ אינה מפעילה אותו בעימוד.

### 14.2 חוזה הקלט המנורמל
ה-reducer מצפה לאובייקט הכולל checkpoints ו-issues. כל checkpoint כולל checkpointId, seq, stage, operationId אופציונלי ו-pages. כל page כולל pageId יציב, pageIndex, pageType, metrics, evaluatedKinds, findings ו-elements. לכל element נדרשים elementId ייחודי, role, geometry (x/y/w/h), parentId, columnId, readingOrder, attributes, style, textDigest, ו-lineage כאשר יש פיצול/מיזוג.

כל finding כולל issueId (או issue_id/id), kind ו-targetElementId. ה-reducer אינו מסיק מזהה אלמנט מטקסט, ממספר עמוד או מ-y. רשומת issue כוללת issue_id, kind, pageId, targetElementId, status, transitions, candidates ונתוני capacity/causalEvidence אם קיימים. ה-Ledger הקיים עדיין משתמש ב-page מספרי וב-target טקסטואלי; אסור למפות אותם ל-pageId/elementId בלי adapter שמוכיח זהות.

### 14.3 פעולות delta שנבדקות
ה-reducer מסווג added, removed, moved, resized, restyled, textChanged, reparented ו-structuralChanged; וכן split/merge כאשר lineage מוכיח החלפה של מקור אחד בשני ילדים או יותר, או שני מקורות ומעלה ביעד אחד. הוא גם מזהה pageMoves של elementId יציב בין pageIds. מעבר עמוד עדיין מופיע כ-remove/add בדלתאות המקומיות, ובנוסף כאירוע מעבר עמוד מפורש.

### 14.4 גבולות ידועים של הגרסה
- split/merge מזוהים כרגע בתוך אותו עמוד בלבד; פיצול שחוצה עמודים דורש lineage ברמת checkpoint, ולא ייקבע על סמך התאמה משוערת.
- סיווג issue דורש pageId/elementId יציבים ו-evaluatedKinds מפורשים. אם חסרים, התוצאה not-comparable/unresolved וה-capture מסומן incomplete.
- correction-blocked נשען על candidate rejection עם reason; correction-reverted דורש active→absent→active ומעברי Ledger תואמים; side effect דורש sibling delta וראיית שינוי capacity מפורשת.
- חסר עדיין producer מתוך RED של pageId, elementId, evaluatedKinds, snapshots ו-operationId. זהו שלב adapter/model mapping נפרד לפני חיבור למנוע.
- תוצאות unit tests אינן תחליף ל-no-op proof, ל-Worker integration או לבדיקת stress מלאה.

השלב הבא הוא למפות את מודל העמוד וה-Ledger הקיימים לשדות החוזה, ולזהות אילו מזהים כבר קיימים ואילו מחייבים יצירה סמנטית. רק לאחר המיפוי יוגדר adapter. אין להוסיף instrumentation לפני שה-adapter וה-reducer מוכחים בנפרד.


## 15. עדכון מימוש — 12.11.2026

### 15.1 Adapter ממודל RED
נוסף red-build/src/engine/audit/step-audit-model-adapter.js, עם בדיקות ב-red-build/tests/unit/step-audit-model-adapter.test.js. המודול מבודד ואינו משנה את ה-pipeline בעצם טעינתו. הוא מקבל pages, settings, Ledger, evaluatedKindsByPage ו-projectedPages או פונקציית projection אופציונלית, ומפיק checkpoint מנורמל לרדוסר.

זהויות:
- pageId נוצר מ-WeakMap של אובייקט העמוד, בתחום חיי adapter/run. שינוי אינדקס או סדר העמודים אינו משנה את הזהות כל עוד אובייקט העמוד נשמר.
- שורת גוף מזוהה לפי seq של DP בתוך הריצה; fragment של paragraph לפי pageId+tokenId.
- footnote/endnote fragment מקבל זהות יציבה רק עם tokenId, noteIndex ו-fragmentIndex; מזהה חסר מסומן incomplete.
- decoration ללא rollbackKey/tokenId, side note ללא source token, או target Ledger שאינו ניתן למיפוי חד-משמעי אינם מקבלים זהות מומצאת. ה-capture מסומן incomplete/unmapped.
- evaluatedKinds חייב להיות מוגדר במפורש לכל עמוד. מערך ריק פירושו שה-predicate set נבדק ולא מצא ממצא; מפתח חסר פירושו שלא ניתן להשוות.

### 15.2 כיסוי רכיבי עמוד
ה-adapter כולל line/paragraph fragments, columns, spanning H2–H6 bands, footnote area/fragments/rules, side notes, ornaments/decorations, column divider, endnote pages/fragments/title, TOC rows/items, custom boxes/images/background, folio/header slots ו-shaar content לפי projection. רכיב שגובה או מלבן שלו אינו קיים במודל (כגון header separator המבוסס CSS) נשמר כממצא חסר-גאומטריה וה-capture מסומן incomplete; אין יצירת גובה או מלבן שרירותיים.

### 15.3 מסלול סוגריים ממוקד
נמצאו שני פערים שהסתירו את ממצאי הסוגריים:
1. ה-DP לא כתב meta.lineIdx לשורות רגילות, ולכן ה-pipeline לא הצליח למפות את טווחי המקור למיקומים בפועל.
2. לאחר יצירת parenRanges, בדיקת parenConsistency לא רצה שוב; לכן ה-Ledger לא קיבל את הממצא.

התיקון:
- DP משמר block-local lineIdx בעת הצבת שורות, לרבות spanning headings.
- ה-pipeline מחשב parenSpans גם כאשר paren-style-scale=1. הסקייל עדיין קובע רק אם PAREN_SENTINEL משפיע על המדידה; בדיקת הגבול המבנית אינה תלויה בו.
- לכל מילה בטווח שניתן למיפוי מוצמד sourceWordRef={tokenId,wordIndex}. ה-reference מועבר יחד עם מילה ש-fixDropWordInColumns מעביר לשורה הבאה. לכן אין הסתמכות על lineIdx בלבד לאחר תיקון שורה.
- לאחר יצירת page.parenRanges, ה-pipeline מריץ פעם אחת רק את CHECKS.parenConsistency; הוא אינו מריץ שוב את שאר ההגנות ואינו משנה גאומטריה.
- ה-Ledger target בפועל הוא paren@pN@tN; ה-adapter מזהה אותו במדויק ומקשר אותו לאלמנט סמנטי paren-range.

כאשר יש note-ref שמשלב מילים חיצוניות, או שמספר המילים לאחר עיבוד שונה ממספר מילות המקור, המיפוי נדחה ונרשם paren-range-unmapped. זה מכוון: אין התאמה משוערת.

### 15.4 בדיקות חדשות
- התאמת Ledger target בפורמט האמיתי paren@pN@tN.
- E2E של טווח סוגריים ארוך החוצה טורים/עמודים, כולל קישור ממצא ה-Ledger לטווח.
- E2E נוסף כאשר paren-style-scale=1 כדי לוודא שההגנה המבנית אינה תלויה בעיצוב.
- בדיקת העברת sourceWordRefs בעת drop-word repair.
- בדיקות גבול ל-TOC groups, endnote title band, note fragment identities, evaluatedKinds ו-divider ink bounds.

### 15.5 גבולות שעדיין פתוחים
- אין עדיין אוסף checkpoints אוטומטי מכל שלבי pipeline; ה-adapter מוכן לצריכה אך דורש caller שיספק את page model וה-predicate coverage של אותו שלב.
- אין operationId אחיד שנקשר לכל mutation בכל שלב ה-DP/retreat/repair.
- split/merge של fragment שחוצה עמודים דורש lineage ברמת checkpoint; לא מסיקים אותו מטקסט.
- header separator ואלמנטים המבוססים CSS נשארים incomplete עד שמודל המקור יספק מלבן מדויק.
- אין UI issue-centered ואין stress/full-corpus audit של כל checkpoint; בדיקות הקורפוס הקיימות בודקות את העימוד, לא את כל היסטוריית הממצאים.
- module adapter אינו מיובא על ידי ה-renderer/Worker bundle כנתיב runtime פעיל, והוספתו לא משנה layout.

השלב הבא: producer טהור שמקבל snapshots אמיתיים בנקודות pipeline מוגדרות ומספק evaluatedKinds/operation linkage, עם no-op hash proof. רק אחרי שהחוזה מוכח יתווסף opt-in instrumentation; UI יישאר לאחר מכן.