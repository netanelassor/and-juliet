/** Direction for existing, flattened artwork. These are theatrical overlays and
 * camera cues, not claims of separately rigged character acting. */
export type MotionKind = 'quill' | 'spotlight' | 'petals' | 'sunrise' | 'carriage' | 'city' | 'chandelier' | 'heart' | 'duet' | 'ring' | 'reveal' | 'quill-snap' | 'music' | 'wedding' | 'courage' | 'finale';
export interface SceneMotion {
  kind: MotionKind;
  action: string;
  announcement: string;
  ambient: 'dust' | 'petals' | 'stars' | 'city' | 'none';
  focal: [number, number];
  camera: 'sway' | 'ride' | 'reveal' | 'lift' | 'still';
  intensity: 'gentle' | 'regular' | 'grand';
}
const cue = (kind: MotionKind, action: string, announcement: string,
  focal: [number, number], camera: SceneMotion['camera'] = 'still',
  ambient: SceneMotion['ambient'] = 'dust', intensity: SceneMotion['intensity'] = 'regular'): SceneMotion =>
  ({kind, action, announcement, focal, camera, ambient, intensity});

export const sceneMotions: Record<number, SceneMotion> = {
  1: cue('quill', 'קסם של מחזה', 'דפי המחזה מתרוממים סביב הנוצה של שייקספיר.', [.54, .14], 'lift', 'stars'),
  2: cue('spotlight', 'רגע של שקט', 'האור מתכנס. כל הבמה מקשיבה לסוף של שייקספיר.', [.59, .34], 'still', 'none', 'gentle'),
  3: cue('spotlight', 'הזרקור של אן', 'זרקור חם עובר אל אן. יש לה רעיון אחר.', [.60, .26], 'reveal', 'stars'),
  4: cue('quill', 'דף לסיפור חדש', 'דף חדש נפתח. אפשר לנסות לכתוב אחרת.', [.44, .34], 'lift', 'stars'),
  5: cue('petals', 'אור עדין לג\'ולייט', 'עלי כותרת נעים לאט באור שקט.', [.5, .61], 'still', 'none', 'gentle'),
  6: cue('sunrise', 'הסיפור מתעורר', 'האור מתרחב. הסיפור של ג\'ולייט ממשיך.', [.51, .46], 'lift', 'stars', 'grand'),
  7: cue('reveal', 'גם היא הכירה אותו?', 'אור קטן עובר בין ההפתעות של ההלוויה.', [.55, .38], 'reveal', 'none'),
  8: cue('courage', 'מה ג\'ולייט רוצה?', 'אור חם נשאר לצד ג\'ולייט והשאלה שלה.', [.48, .47], 'still', 'dust', 'gentle'),
  9: cue('heart', 'לא יוצאים לבד', 'שלושה אורות נפגשים. החברים יוצאים יחד.', [.51, .5], 'lift', 'stars'),
  10: cue('carriage', 'יצאנו לדרך!', 'גלגלים, אורות דרך ורוח קטנה. הכרכרה יוצאת לפריז.', [.49, .81], 'ride', 'dust'),
  11: cue('carriage', 'כמעט בפריז', 'אורות הדרך חולפים והכרכרה ממשיכה לנסוע.', [.5, .8], 'ride', 'city'),
  12: cue('city', 'אורות של פריז', 'אורות העיר נוצצים לקראת הנשף.', [.5, .4], 'reveal', 'city', 'grand'),
  13: cue('reveal', 'הדלתות נפתחות', 'המסך נפתח אל האור והמוזיקה של הנשף.', [.51, .4], 'reveal', 'stars'),
  14: cue('chandelier', 'ניצוצות בנשף', 'האור עולה אל הנברשת. ניצוצות זהב מרחפים מעל הנשף.', [.5, .22], 'sway', 'stars', 'grand'),
  15: cue('music', 'המנגינה של פרנסואה', 'מנגינה קטנה של אור עולה ליד מיי ופרנסואה.', [.49, .54], 'still', 'dust', 'gentle'),
  16: cue('heart', 'אור קטן של חברות', 'יש מקום להיות בדיוק מי שאנחנו.', [.56, .42], 'still', 'none', 'gentle'),
  17: cue('duet', 'מישהו שמבין', 'שני קווי אור נפגשים בשיחה של ג\'ולייט ופרנסואה.', [.5, .5], 'still', 'dust', 'gentle'),
  18: cue('heart', 'רגע, מה קרה?', 'לב קטן עולה, והאור נעשה שקט יותר ליד מיי.', [.51, .46], 'still', 'none', 'gentle'),
  19: cue('reveal', 'לאנס? אנג\'ליק?', 'שני אורות של פעם נפגשים שוב.', [.49, .45], 'reveal', 'dust'),
  20: cue('duet', 'צעד ועוד צעד', 'סרטי אור מסתובבים כמו הריקוד של לאנס ואנג\'ליק.', [.5, .61], 'sway', 'stars'),
  21: cue('ring', 'הצעה מפתיעה', 'טבעת אור קטנה נוצצת. לג\'ולייט עוד יש שאלות.', [.54, .65], 'still', 'dust'),
  22: cue('heart', 'הלב לא שואל', 'שני אורות מתקרבים ברגע השקט של מיי ופרנסואה.', [.5, .47], 'still', 'none', 'gentle'),
  23: cue('quill', 'מה הוא כותב?', 'עוד דף מתרומם מעל התוכנית הסודית של שייקספיר.', [.51, .46], 'reveal', 'dust'),
  24: cue('reveal', 'רומיאו?!', 'מסך של אור נפתח. רומיאו חוזר לבמה!', [.61, .35], 'reveal', 'stars', 'grand'),
  25: cue('spotlight', 'רומיאו באור הזרקורים', 'זרקור גדול מקבל את רומיאו, אבל הסיפור כבר השתנה.', [.59, .34], 'reveal', 'stars'),
  26: cue('courage', 'כבר יש לי דרך', 'אור חדש נפרש ליד ג\'ולייט והחיים שבחרה.', [.5, .45], 'lift', 'stars'),
  27: cue('duet', 'שני סופרים, שני אורות', 'שני קווי אור נפגשים מעל הוויכוח של אן ושייקספיר.', [.5, .35], 'still', 'dust'),
  28: cue('quill-snap', 'קראק! ומה עכשיו?', 'הנוצה הגרפית נפרדת לשניים ודפי המחזה מתפזרים.', [.5, .49], 'reveal', 'none', 'grand'),
  29: cue('heart', 'אומץ להגיד', 'אור חם עולה לאט בשיחה של מיי ופרנסואה.', [.5, .49], 'still', 'none', 'gentle'),
  30: cue('petals', 'נותנים ללב רגע', 'עלי כותרת נעים בעדינות. לא לכל שאלה יש תשובה מיד.', [.5, .59], 'still', 'none', 'gentle'),
  31: cue('spotlight', 'עכשיו מקשיבים', 'האור נהיה רך. הפעם רומיאו מקשיב.', [.5, .43], 'still', 'dust', 'gentle'),
  32: cue('heart', 'אפשר לתת זמן', 'לב של אור עולה לאט ומשאיר מקום לבחור.', [.5, .54], 'still', 'none', 'gentle'),
  33: cue('duet', 'סלט של אהבות', 'סרטי אור צבעוניים מצטלבים כמו המחשבות של כולם.', [.5, .48], 'sway', 'stars'),
  34: cue('quill', 'התוכנית הסודית', 'שייקספיר כבר מכין דפים לעוד הפתעה.', [.51, .47], 'reveal', 'dust'),
  35: cue('petals', 'יושבים ומקשיבים', 'אור חם ועלי כותרת שקטים מלווים את אן וג\'ולייט.', [.49, .55], 'still', 'none', 'gentle'),
  36: cue('sunrise', 'אפשר לעצור ולחשוב', 'אור רך מתרחב, בלי למהר לשום מקום.', [.49, .57], 'still', 'dust', 'gentle'),
  37: cue('music', 'כולם לחזרה!', 'אורות של להקה ותווים גרפיים מתעוררים בחזרה.', [.5, .73], 'sway', 'stars'),
  38: cue('music', 'הלהקה על הבמה', 'פסי האור עולים בקצב והנשף מתעורר.', [.5, .69], 'sway', 'stars', 'grand'),
  39: cue('wedding', 'רגע לפני שמחליטים', 'פרחים מוארים נעים בעדינות סביב רגע החתונה.', [.5, .62], 'still', 'dust', 'gentle'),
  40: cue('courage', 'אומרים את האמת', 'אורות הזהב נפתחים. סוף סוף אומרים מה מרגישים.', [.5, .47], 'lift', 'stars'),
  41: cue('spotlight', 'מספיק!', 'כל האורות נעצרים לרגע ומפנים מקום לקול של ג\'ולייט.', [.5, .4], 'still', 'none'),
  42: cue('courage', 'זה הסיפור שלי!', 'מעגלי אור מתרחבים סביב הבחירה של ג\'ולייט.', [.5, .43], 'lift', 'stars', 'grand'),
  43: cue('heart', 'גם סליחה היא התחלה', 'אור של חברות עובר בין לאנס, פרנסואה ומיי.', [.5, .52], 'still', 'none', 'gentle'),
  44: cue('sunrise', 'גם לך מגיע', 'אור זהב קטן נפתח אל החלומות של אנג\'ליק.', [.5, .54], 'lift', 'dust', 'gentle'),
  45: cue('heart', 'חיבוק של חברים', 'שלושה אורות נפגשים בחיבוק של חברות.', [.5, .49], 'still', 'dust', 'gentle'),
  46: cue('finale', 'שאגה של אורות!', 'האורות עולים אל המרפסת וקונפטי צבעוני יורד על הבמה.', [.5, .29], 'lift', 'stars', 'grand'),
  47: cue('heart', 'התחלה חדשה', 'לב של אור נשאר פתוח להתחלה חדשה.', [.5, .48], 'still', 'dust', 'gentle'),
  48: cue('finale', 'כולם לבמה!', 'המסך נפתח, האורות נוצצים והחברים חוגגים יחד!', [.5, .43], 'lift', 'stars', 'grand'),
};

export function motionForScene(scene: number): SceneMotion {
  return sceneMotions[scene] ?? sceneMotions[1];
}
