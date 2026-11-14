import {useState, type CSSProperties} from 'react';
import '../styles/stage-moments.css';

const quill = {
  x: 56, y: 37, icon: 'spark' as const,
  action: 'לשבור את הנוצה',
  target: 'לשבור את הנוצה של אן',
  announcement: 'קראק! הנוצה של אן נשברה לשניים.',
};

const applause = {
  x: 47, y: 91, icon: 'heart' as const,
  action: 'למחוא כפיים',
  target: 'למחוא כפיים ללהקה על הבמה',
  announcement: 'הקהל מוחא כפיים ואורות הבמה נדלקים.',
};

export function stageMoment(scene: number) {
  if (scene === 28) return quill;
  if (scene === 48) return applause;
}

const quillFlecks = [
  {x: -103, y: -112, turn: -68, delay: 0},
  {x: -54, y: -140, turn: -51, delay: .03},
  {x: 24, y: -150, turn: 61, delay: .04},
  {x: 84, y: -115, turn: 87, delay: 0},
  {x: 125, y: -51, turn: 115, delay: .07},
  {x: -141, y: -49, turn: -117, delay: .07},
  {x: 40, y: 45, turn: 142, delay: .03},
  {x: -64, y: 48, turn: -131, delay: .08},
];

const audience = [
  {x: 133, y: 1004, delay: .06, fill: '#25132b', rim: '#ef73b8'},
  {x: 443, y: 1021, delay: .24, fill: '#2e1637', rim: '#ee8dc9'},
  {x: 895, y: 1025, delay: .39, fill: '#291735', rim: '#ff92c6'},
  {x: 1260, y: 1015, delay: .54, fill: '#31213d', rim: '#e68dd5'},
  {x: 1427, y: 1004, delay: .69, fill: '#25142d', rim: '#e58bc9'},
];
const handOutline = 'M-23 6c0-13-5-24-8-36-1-5-6-11-5-14 0-2 3-3 5-1l8 9-5-22c-1-3 2-5 4-3l7 18-3-21c0-3 4-4 5-1l5 20 1-16c0-3 4-3 4 0l2 19 3-9c2-4 5-2 5 1l-1 19c0 10-3 21-6 37Z';

export function StageMomentEffect({scene}: {scene: number}) {
  const [finished, setFinished] = useState(false);
  if (finished) return null;

  return <svg
    className="stage-moment-effect"
    aria-hidden="true"
    viewBox="0 0 1536 1024"
    data-stage-moment={scene === 28 ? 'quill' : 'applause'}
    onAnimationEnd={event => {
      if (event.target === event.currentTarget && event.animationName === 'stage-moment-duration') setFinished(true);
    }}
  >
    <defs>
      <radialGradient id="stage-moment-quill-flare">
        <stop stopColor="#fff4d9" stopOpacity=".87"/>
        <stop offset=".28" stopColor="#ffcb73" stopOpacity=".52"/>
        <stop offset="1" stopColor="#ff69a4" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="stage-moment-footlight">
        <stop stopColor="#fff3d2" stopOpacity=".8"/>
        <stop offset=".24" stopColor="#ffd280" stopOpacity=".57"/>
        <stop offset="1" stopColor="#f065bc" stopOpacity="0"/>
      </radialGradient>
    </defs>
    {scene === 28 ? <g transform="translate(861 451)">
      <g className="stage-quill-connect" fill="#fff0c7" stroke="#bf966d" strokeWidth="1.1" strokeLinejoin="round">
        <path className="stage-quill-left" d="M-24-9-15-14 1-5-5 0 2 4-6 8-24 9-17 3-22 1-16-4Z"/>
        <path className="stage-quill-right" d="M0-5 15-13 25-12 16-6 28-2 16 1 25 7 16 9 2 4-5 0Z"/>
        <path d="M-24 4C-6-5 11-7 26 0" fill="none" stroke="#ffe0b1"/>
      </g>
      <ellipse className="stage-quill-flare" rx="100" ry="88" fill="url(#stage-moment-quill-flare)"/>
      {quillFlecks.map((fleck, i) => <path key={fleck.x} className="stage-quill-fleck"
        d={i % 2 === 0 ? 'M-11 3Q-5-8 15-8 12 1 4 4L-10 6Z' : 'M-15 2 4-6 15-4 3 4Z'}
        fill={i % 3 === 0 ? '#ffd184' : '#fff3d6'}
        style={{'--fleck-x': `${fleck.x}px`, '--fleck-y': `${fleck.y}px`, '--fleck-turn': `${fleck.turn}deg`, '--moment-delay': `${fleck.delay}s`} as CSSProperties}/>
      )}
    </g> : <g>
      {audience.map(({x, y, delay, fill, rim}) => <g key={x} transform={`translate(${x} ${y})`}
        style={{'--moment-delay': `${delay}s`} as CSSProperties}>
        <ellipse className="stage-applause-light" cx="0" cy="-43" rx="128" ry="60" fill="url(#stage-moment-footlight)"/>
        <g className="stage-applause-hands" fill={fill} stroke={rim} strokeWidth="1.9" strokeLinejoin="round">
          <path className="stage-applause-hand-left" d={handOutline}/>
          <path className="stage-applause-hand-right" d={handOutline}/>
        </g>
        <path className="stage-applause-marks" d="M-36-83l-7-10m43 3v-14m36 21 7-10" stroke="#ffdeb0" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      </g>)}
    </g>}
  </svg>;
}
