import data from './chapters-data.json';

export type ChapterId = string;
export type CharacterId = 'juliet' | 'shakespeare' | 'anne' | 'may' | 'francois' | 'angelique' | 'lance' | 'romeo';
export interface Beat {
  sourceScene: number; sourcePdfPage: number; title: string; paragraphs: string[];
  musicTrackNumber: number | null; canonicalTrackTitle: string | null; act: 1 | 2;
}
export interface Chapter {
  id: ChapterId; title: string; subtitle: string; family: 'dialogue' | 'musical' | 'quiet';
  act: 1 | 2; beats: Beat[]; music: string[]; characters: CharacterId[]; action: string;
}
export const chapters = data as Chapter[];
export const allBeats = chapters.flatMap(chapter => chapter.beats);
export function locationForScene(scene: number) {
  const chapter = chapters.find(c => c.beats.some(b => b.sourceScene === scene));
  return chapter ? {chapter: chapter.id, beat: chapter.beats.findIndex(b => b.sourceScene === scene)} : null;
}
export const characterInfo: Record<CharacterId, {name: string; description: string; image: string}> = {
  juliet: {name: "ג'ולייט", description: 'הסיפור שלה עוד לא נגמר. היא רוצה לבחור את הדרך שלה.', image: 'juliet'},
  shakespeare: {name: 'ויליאם שייקספיר', description: 'הסופר עם הנוצה. הוא מגלה שסיפור יכול להשתנות כשמקשיבים לאחרים.', image: 'shakespeare'},
  anne: {name: 'אן / אפריל', description: "אן היא אשתו של שייקספיר. כשהיא נכנסת לסיפור, היא משחקת את אפריל. זאת אותה אישה!", image: 'anne'},
  may: {name: 'מיי', description: "החבר הכי טוב של ג'ולייט. לא בן ולא בת. פשוט מיי.", image: 'may'},
  francois: {name: 'פרנסואה', description: 'מוזיקאי עם לב רגיש. הוא רוצה לנגן, לשיר ולהיות הוא עצמו.', image: 'francois'},
  angelique: {name: "אנג'ליק", description: "מכירה את ג'ולייט מאז שהייתה קטנה. היא מלאה חום, צחוק ואהבה.", image: 'angelique'},
  lance: {name: 'לאנס', description: "אבא של פרנסואה. הוא לומד להקשיב ללב של הבן שלו וגם ללב של עצמו.", image: 'lance'},
  romeo: {name: 'רומיאו', description: "כוכב עם המון ביטחון. גם הוא יכול ללמוד להקשיב ולהכיר את ג'ולייט מחדש.", image: 'romeo'},
};
export const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;
export const illustration = (scene: number) => asset(`story/scene-${String(scene).padStart(2, '0')}.webp`);
export const thumbnail = (scene: number) => asset(`thumbs/scene-${String(scene).padStart(2, '0')}.webp`);
