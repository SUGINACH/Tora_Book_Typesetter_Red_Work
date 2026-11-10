# Session 03 — שחזור והוכחת שורש אובדן הכותרת

> **Repository:** SUGINACH/Tora_Book_Typesetter_Red_Work בלבד  
> **Branch בו נשמרה גרסת הביקורת:** `work/session-04-heading-rollback-fix`  
> **Fixed-document input SHA-256:** `04c6a13fc90b9052566129ecf4c4b26fbaeba341439c5fa485e345f9cad87232`  
> **Baseline main:** `6f801568c15071a27f97918ff8479def9c719c0d`  
> **Status:** root cause proven in Session 03; fixed and regression-tested in Session 04. See `execution/SESSION-04-HEADING-ROLLBACK-FIX.md`.

## 1. שחזור מדויק

המסמך נוצר מחדש באמצעות אותו מחולל ואותן הגדרות כמו ב-`s62-user-questions.test.js`:

```js
generateTestDocument({ mode: 'fixed', scale: 'full' })
`
ומורץ בנתיב `legacyTypeset` עם הגדרות IMUD המקוריות.

נתוני הקלט:
- 1,800,076 bytes.
- 2,025 שורות.
- SHA-256 לעיל.
- 522 עמודים בפלט.
- `contentPreserved=false`.
- `contentStats.missingCount=2`: `לשון (41/42)`, `הפוסקים (41/42)`.

השוואה בין טוקני המקור לבין קווי הפלט הוכיחה שהמילים אינן חסרות בתוך גוף הערה. הפריט החסר הוא כותרת H5 שלמה:
- token ID: `lt817`.
- type: `h5`.
- text: `לשון הפוסקים`.
- source line: 929.
- כותרת המקור: `כותרת 5 - לשון הפוסקים`.

הטוקן נמצא ב-`result.tokens`, אך אינו מופיע באף קו גוף בעמודים.

## 2. הרצף הסמוך בפלט

הטוקנים הסמוכים במקור:

| Token | סוג | תוכן | מצב בפלט |
|---|---|---|---|
| `lt815` | p | פסקה גדולה עם הערות | הוצבה |
| `lt816` | p | פסקה גדולה עם הערות | הוצבה, 32 שורות |
| `lt817` | h5 | לשון הפוסקים | **לא הוצבה** |
| `lt818` | h6 | חילוקי דינים | **הוצבה פעמיים** |
| `lt819` | p | הפסקה הבאה | הוצבה והמשיכה לעמוד הבא |

בבלוק הסופי של העמוד:
- הטור הימני מכיל את `lt816`.
- הטור השמאלי מכיל שתי יחידות Heading זהות עם אותו `tokenId=818` ואותו טקסט `חילוקי דינים`.
- אין יחידה עם `tokenId=817`.
- `block.split=false`; לכן הכפילות קיימת כבר במחסנית היחידות, ולא נוצרה עקב הקרנה בלבד.

## 3. הוכחת השורש באמצעות trace

הופעל trace חד-פעמי באמצעות `RED_TRACE_HEADING_ID=817`. הלוג של GitHub Actions תיעד את הרצף הבא (מספרי `pageIndex` הם האינדקס בזמן יצירת העמוד, לפני כל שינויי סדר מאוחרים):

1. `section-membership`: הטוקן 817 נמצא ב-section, באינדקס המקומי `ti=22`, מיד אחרי p816 ומיד לפני h6 818.
2. `loop-start` עבור token 817: `pageIndex=224`, `ti=22`, `fill=0`.
3. `heading-fit-evaluated` עבור token 817: `hFits=true`. הכותרת הוכנסה לטור הימני.
4. `loop-start` עבור token 818: `ti=23`, `fill=0`. הכותרת H6 אינה נכנסת ליתרת הטור הימני.
5. קריאה ל-`rollbackTrailingHeadings()` החזירה `rolledBack=1`: יחידת H5 הוסרה מהטור הימני.
6. הקוד ביצע `ti -= 1` והעביר את `block.fill` לטור השמאלי, **אך לא התחיל מחדש את הלולאה**.
7. באותה איטרציה הוצב token 818 (H6) בטור השמאלי, ו-`ti++` החזיר את `ti` לערך 23.
8. האיטרציה הבאה קראה שוב את token 818, והציבה אותו פעם שנייה.

כלומר, סדר הפעולות הנוכחי הוא:

```text
ti=23, tok=H6(818)
rollbackTrailingHeadings() => removes H5(817), returns 1
ti = 23 - 1 = 22
block.fill = left
continue execution with stale local variable tok=H6(818)
place H6(818)
ti = 22 + 1 = 23
next loop reads H6(818) again
place H6(818) a second time
```

**זהו שורש מוכח:** ה-index rollback מתבצע, אך זרימת הבקרה אינה חוזרת לקרוא את הטוקן שאליו הוחזר האינדקס. הטוקן הנוכחי ממשיך להתבצע מתוך המשתנה המקומי `tok`, ולכן הכותרת הקודמת נעלמת והכותרת הנוכחית משוכפלת.

## 4. המקום המדויק לתיקון

ב-`red-build/src/engine/layout/legacy-imud-flow.js`, בענף:

```js
if (!hFits) {
  if (block.fill === 0 && !isH0 && !(block.cols[0].length === 0)) {
    ti -= rollbackTrailingHeadings();
    block.fill = 1;
  } else if (...) {
    ...
  }
}
```

ההתנהגות הנדרשת לאחר העברת כותרות זנב לטור השמאלי:
- אם `rollbackTrailingHeadings()` החזיר 0 — אפשר להציב את הכותרת הנוכחית בטור השמאלי כפי שהקוד עושה כיום.
- אם החזיר מספר גדול מ-0 — יש להחזיר את השליטה לראש לולאת `fillPage` לפני הצבת הטוקן הנוכחי. כך הכותרות שהוחזרו ייקראו מחדש לפי הסדר, ורק לאחריהן תעובד הכותרת הנוכחית.

המימוש המועמד לסשן 4:

```js
const rolledBack = rollbackTrailingHeadings();
ti -= rolledBack;
block.fill = 1;
if (rolledBack > 0) continue fillPage;
```

יש לאמת את סמנטיקת `rollbackTrailingHeadings()` ואת כל מקרי הקצה לפני קבלת השינוי הסופי. אין לשנות את ענף page-close השני, שבו הלולאה כבר מסתיימת והטוקנים מוחזרים לעמוד הבא.

## 5. ראיות וקישורי ריצה

- [PR #3 — שחזור ואבחון](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/pull/3)
- [ריצת שחזור עם trace](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42767419842)
- [ריצת parity על אותו commit](https://github.com/SUGINACH/Tora_Book_Typesetter_Red_Work/actions/runs/42767420035)
- artifact: `content-loss-two-words-repro`, ID `13740681193`.
- ה-artifact כולל קלט מדויק, report, שכני הטוקן ו-`headingTracePages`.
- ה-job log מכיל את אירועי `RED_HEADING_TRACE` שהוכיחו את סדר הפעולות.

## 6. גבולות הסשן ותנאי מעבר

בסשן 3:
- נוצרו כלי שחזור, report ו-trace מותנה.
- הוכח שה-parser יצר את כותרת H5.
- הוכח שהכותרת הושמה תחילה ואז הוסרה בעקבות נסיגה.
- הוכח שהכותרת העוקבת שוכפלה עקב המשך האיטרציה עם `tok` ישן.
- **לא בוצע שינוי בהחלטת העימוד או בתנאי ה-placement.**

**תוצאת סשן 4:** הבדיקה המחמירה נכשלה לפני התיקון (12/13) ועברה לאחריו (13/13). H5 `לשון הפוסקים` וה-H6 העוקבת מופיעות פעם אחת בדיוק; `contentPreserved=true`, missing=0. התיקון הממוקד והאימותים מפורטים ב-`execution/SESSION-04-HEADING-ROLLBACK-FIX.md`.
