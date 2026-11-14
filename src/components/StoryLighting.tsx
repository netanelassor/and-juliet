import type {CSSProperties} from 'react';
import '../styles/story-lighting.css';

type Light = [x: number, y: number, color: 'gold' | 'rose' | 'blue'];
type LightingCue = {label: string; announcement: string; target: [number, number]; pools: readonly Light[]};

const lighting: Partial<Record<number, LightingCue>> = {
  15: {label: 'להאיר את הפסנתר', announcement: 'האור עובר מהקלידים אל פרנסואה ומיי.', target: [43, 71], pools: [[43, 62, 'gold'], [31, 30, 'blue'], [62, 26, 'rose']]},
  17: {label: 'להאיר את הקלידים', announcement: 'אור ורוד נוגע בקלידים, וג׳ולייט ופרנסואה מקשיבים זה לזה.', target: [65, 61], pools: [[64, 53, 'rose'], [46, 25, 'blue'], [32, 27, 'gold']]},
  19: {label: 'להדליק אור לשניים', announcement: 'אנג׳ליק ולאנס מזהים זה את זו.', target: [50, 66], pools: [[32, 31, 'rose'], [64, 30, 'gold']]},
  22: {label: 'להאיר את השיחה', announcement: 'אור רך מתקרב אל מיי ופרנסואה.', target: [48, 71], pools: [[38, 34, 'blue'], [60, 36, 'rose']]},
  27: {label: 'לראות מי מחזיק בנוצה', announcement: 'אור נפרד מאיר את אן ואת שייקספיר בזמן הוויכוח.', target: [50, 70], pools: [[34, 34, 'rose'], [69, 36, 'gold']]},
  29: {label: 'להאיר את מיי', announcement: 'מיי מקבל רגע באור, ופרנסואה מקשיב.', target: [49, 74], pools: [[60, 35, 'rose'], [33, 30, 'blue']]},
  30: {label: 'להאיר את המסדרון', announcement: 'האור נפרד ממיי ונשאר עם פרנסואה.', target: [53, 76], pools: [[26, 42, 'blue'], [76, 42, 'gold']]},
  35: {label: 'להאיר את המדרגות', announcement: 'אור חם עולה על אן וג׳ולייט שישובות יחד.', target: [49, 78], pools: [[39, 42, 'gold'], [62, 41, 'rose']]},
  39: {label: 'להאיר את קשת החתונה', announcement: 'האור עובר מלאנס לשני החברים שמתלבטים.', target: [49, 76], pools: [[24, 40, 'gold'], [55, 36, 'rose'], [74, 36, 'blue']]},
  45: {label: 'להאיר את החיבוק', announcement: 'האורות של שלושת החברים נפגשים.', target: [50, 78], pools: [[36, 32, 'blue'], [61, 35, 'rose'], [50, 47, 'gold']]},
  47: {label: 'להאיר התחלה חדשה', announcement: 'האור עובר בין ג׳ולייט לרומיאו, ואז לאן ושייקספיר.', target: [49, 76], pools: [[47, 38, 'blue'], [22, 35, 'rose'], [73, 36, 'gold']]},
};

export function lightingForScene(scene: number) {
  return lighting[scene];
}

export function StoryLighting({lighting}: {lighting: LightingCue}) {
  return <div aria-hidden="true" className="story-lighting" data-story-lighting>
    {lighting.pools.map(([x, y, tone], index) => (
      <i key={index} data-tone={tone} style={{left: `${x}%`, top: `${y}%`, '--pool-delay': `${index * .65}s`} as CSSProperties}/>
    ))}
  </div>;
}
