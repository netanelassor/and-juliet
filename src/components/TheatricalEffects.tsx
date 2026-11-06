import {useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties} from 'react';
import gsap from 'gsap';
import {motionForScene, type MotionKind} from '../motion/scene-motion';
import '../styles/theatrical-effects.css';

export interface TheatricalEffectsProps {
  scene: number;
  /** Optional restart token. Choreography runs automatically while enabled. */
  run: number;
  enabled: boolean;
  ambient: boolean;
}
const palette = ['#FFC84B', '#EF168F', '#29C5F6', '#FFF2DD', '#EEA3C1'];
const fraction = (n: number) => {const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v);};
const inKinds = (kind: MotionKind, kinds: MotionKind[]) => kinds.includes(kind);
const heartPath = 'M50 89 10 49C-12 22 24-1 50 24 76-1 112 22 90 49Z';
const flowerPath = 'M50 38C24-2 0 23 31 47 0 66 24 99 48 64 70 100 101 75 69 51 106 27 78 1 55 36Z';

/** Light and stage-prop choreography around the untouched original illustration.
 * Every generated shape is a theatrical effect, not a replacement character. */
export function TheatricalEffects({scene, run, enabled, ambient}: TheatricalEffectsProps) {
  const root = useRef<HTMLDivElement>(null);
  const direction = motionForScene(scene);
  const {kind, focal, intensity} = direction;
  const count = kind === 'finale' ? 48 : intensity === 'grand' ? 30 : intensity === 'gentle' ? 10 : 20;
  const particles = useMemo(() => Array.from({length: count}, (_, i) => ({
    x: 4 + fraction(scene * 97 + i * 11) * 92,
    y: kind === 'finale' ? fraction(i * 17 + scene) * 12 - 8 : 24 + fraction(scene * 5 + i * 13) * 62,
    angle: fraction(i * 7 + scene) * 100 - 50,
    color: palette[(i + scene) % palette.length],
    drift: (fraction(i * 31 + scene) - .5) * 110,
    size: intensity === 'gentle' ? 4 + fraction(i * 5 + scene) * 4 : 4 + fraction(i * 5 + scene) * 6,
  })), [scene, count, kind, intensity]);

  useLayoutEffect(() => {
    if (!root.current || !enabled) return;
    const ctx = gsap.context(() => {
      const q = (s: string) => [...root.current!.querySelectorAll(s)];
      const tl = gsap.timeline({repeat: -1, repeatDelay: intensity === 'gentle' ? 3.8 : intensity === 'grand' ? 2 : 2.8, delay: .65, defaults: {overwrite: 'auto'}});
      const body = root.current!;
      const h = Math.max(body.clientHeight, 300);

      // A steady pool of light grows and settles; never a flashing or strobe cue.
      tl.fromTo(q('.fx-halo'), {opacity: 0, scale: .78}, {opacity: intensity === 'gentle' ? .36 : .7, scale: 1, duration: 1.1, ease: 'sine.out'}, 0)
        .to(q('.fx-halo'), {opacity: 0, scale: 1.12, duration: 2.2, ease: 'sine.inOut'}, 2);

      if (kind === 'finale') {
        tl.fromTo(q('.fx-burst'), {opacity: 0, y: -25, scale: .7}, {opacity: .88, scale: 1, duration: .55, stagger: .018}, .1)
          .to(q('.fx-burst'), {y: h + 70, x: i => particles[i].drift, rotation: i => 90 + i * 31, duration: 4.7, stagger: .018, ease: 'sine.in'}, .15)
          .to(q('.fx-burst'), {opacity: 0, duration: .75, stagger: .012}, 4.45);
      } else if (inKinds(kind, ['petals', 'wedding'])) {
        tl.fromTo(q('.fx-burst'), {opacity: 0, y: -30, rotation: -12, scale: .7}, {opacity: intensity === 'gentle' ? .45 : .7, y: 35, x: i => particles[i].drift * .4, rotation: i => particles[i].angle, scale: 1, duration: 3.4, stagger: .1, ease: 'sine.inOut'}, .1)
          .to(q('.fx-burst'), {opacity: 0, y: 80, duration: 1.6, stagger: .05}, 2.9);
      } else {
        tl.fromTo(q('.fx-burst'), {opacity: 0, y: 17, scale: .25}, {opacity: intensity === 'gentle' ? .42 : .8, y: i => -35 - fraction(i * 9 + scene) * 65, x: i => particles[i].drift * .55, scale: 1, rotation: i => particles[i].angle, duration: 1.65, stagger: .035, ease: 'power2.out'}, .15)
          .to(q('.fx-burst'), {opacity: 0, y: '-=25', duration: 1.25, stagger: .025}, 1.8);
      }

      if (kind === 'quill' || kind === 'quill-snap') {
        tl.fromTo(q('.fx-paper'), {opacity: 0, y: 28, x: 0, rotation: -13, scale: .8}, {opacity: .8, y: -100, x: i => i % 2 ? 35 + i * 9 : -30 - i * 9, rotation: i => i % 2 ? 18 : -25, scale: 1, duration: 2, stagger: .13, ease: 'power2.out'}, .12)
          .to(q('.fx-paper'), {opacity: 0, y: '-=35', duration: .9, stagger: .04}, 1.7);
      }
      if (kind === 'quill') {
        tl.fromTo(q('.fx-feather'), {opacity: 0, rotation: -10, y: 5}, {opacity: .75, rotation: 8, y: -14, duration: .9, ease: 'sine.inOut'}, .1)
          .to(q('.fx-feather'), {rotation: -3, opacity: 0, y: -25, duration: 1.1}, 1.1);
      }
      if (kind === 'quill-snap') {
        tl.fromTo(q('.fx-quill-left'), {opacity: 0, x: 0, y: 0, rotation: 0}, {opacity: .9, duration: .25}, .1)
          .fromTo(q('.fx-quill-right'), {opacity: 0, x: 0, y: 0, rotation: 0}, {opacity: .9, duration: .25}, .1)
          .to(q('.fx-quill-left'), {x: -65, y: 35, rotation: -27, duration: .85, ease: 'power2.out'}, .45)
          .to(q('.fx-quill-right'), {x: 65, y: 28, rotation: 24, duration: .85, ease: 'power2.out'}, .45)
          .to(q('.fx-quill-half'), {opacity: 0, duration: .8}, 1.5);
      }
      if (inKinds(kind, ['spotlight', 'reveal', 'chandelier'])) {
        tl.fromTo(q('.fx-followspot'), {opacity: 0, rotation: -9, scaleX: .5}, {opacity: intensity === 'gentle' ? .18 : .35, rotation: 4, scaleX: 1, duration: 1.15, ease: 'sine.inOut'}, .1)
          .to(q('.fx-followspot'), {opacity: 0, rotation: 0, duration: 1.5}, 2.1);
      }
      if (kind === 'reveal') {
        tl.fromTo(q('.fx-side-curtain'), {opacity: 0, xPercent: 0}, {opacity: 1, duration: .3, ease: 'sine.inOut'}, 0)
          .to(q('.fx-curtain-left'), {xPercent: -104, duration: 1.2, ease: 'power3.inOut'}, .15)
          .to(q('.fx-curtain-right'), {xPercent: 104, duration: 1.2, ease: 'power3.inOut'}, .15)
          .set(q('.fx-side-curtain'), {opacity: 0}, 1.5);
      }
      if (kind === 'carriage') {
        tl.fromTo(q('.fx-road-streak'), {opacity: 0, x: 130}, {opacity: .45, x: -190, duration: 1.1, repeat: 2, stagger: .11, ease: 'none'}, 0)
          .fromTo(q('.fx-wheel-glimmer'), {opacity: 0, rotation: 0}, {opacity: .45, rotation: 300, duration: 3.3, ease: 'none'}, .1)
          .to(q('.fx-road-streak,.fx-wheel-glimmer'), {opacity: 0, duration: .7}, 3.2);
      }
      if (kind === 'city') {
        tl.fromTo(q('.fx-window-light'), {opacity: 0, scale: .3}, {opacity: .7, scale: 1, duration: .6, stagger: .055, ease: 'sine.out'}, .1)
          .to(q('.fx-window-light'), {opacity: .16, duration: 1.1, stagger: .025}, 1.8)
          .to(q('.fx-window-light'), {opacity: 0, duration: 1.3}, 3);
      }
      if (inKinds(kind, ['sunrise', 'courage', 'finale'])) {
        tl.fromTo(q('.fx-ray-crown'), {opacity: 0, scale: .5, rotation: -5}, {opacity: intensity === 'gentle' ? .22 : .46, scale: 1.13, rotation: 5, duration: 2.1, ease: 'sine.out'}, .05)
          .to(q('.fx-ray-crown'), {opacity: 0, scale: 1.3, duration: 1.6}, 2);
      }
      if (inKinds(kind, ['heart', 'courage', 'ring'])) {
        tl.fromTo(q('.fx-outline'), {opacity: 0, scale: .73}, {opacity: kind === 'ring' ? .75 : .35, scale: 1, duration: 1.1, stagger: .18, ease: 'sine.out'}, .15)
          .to(q('.fx-outline'), {opacity: 0, scale: 1.15, duration: 1.7, stagger: .12}, 1.6);
      }
      if (kind === 'duet') {
        tl.fromTo(q('.fx-ribbon-a'), {opacity: 0, scaleX: .4, rotation: -6}, {opacity: .44, scaleX: 1, rotation: 3, duration: 1.2, ease: 'sine.inOut'}, .1)
          .fromTo(q('.fx-ribbon-b'), {opacity: 0, scaleX: .4, rotation: 6}, {opacity: .4, scaleX: 1, rotation: -3, duration: 1.2, ease: 'sine.inOut'}, .3)
          .to(q('.fx-ribbon'), {opacity: 0, duration: 1.7}, 1.7);
      }
      if (kind === 'music') {
        tl.fromTo(q('.fx-music-bar'), {opacity: 0, scaleY: .15}, {opacity: .42, scaleY: i => .35 + fraction(scene + i * 7) * .65, duration: .4, stagger: .045, yoyo: true, repeat: 4, ease: 'sine.inOut'}, .1)
          .fromTo(q('.fx-note'), {opacity: 0, y: 15, rotation: -8}, {opacity: .7, y: -70, rotation: 8, duration: 2.2, stagger: .13, ease: 'sine.out'}, .2)
          .to(q('.fx-music-bar,.fx-note'), {opacity: 0, duration: .9}, 2.5);
      }
    }, root);
    return () => ctx.revert();
  }, [scene, run, enabled]);

  useEffect(() => {
    if (!enabled || !ambient || direction.ambient === 'none') return;
    const ctx = gsap.context(() => {
      root.current!.querySelectorAll('.fx-ambient-mote').forEach((mote, i) => {
        gsap.fromTo(mote, {opacity: .03, y: 7, scale: .7}, {opacity: intensity === 'gentle' ? .1 : .18, y: -12 - i % 3 * 4, scale: 1, duration: 3.8 + i * .25, delay: i * .25, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      });
    }, root);
    return () => ctx.revert();
  }, [scene, enabled, ambient]);

  const fxStyle = {'--fx-focal-x': `${focal[0] * 100}%`, '--fx-focal-y': `${focal[1] * 100}%`} as CSSProperties;
  const paper = kind === 'quill' || kind === 'quill-snap';
  const light = inKinds(kind, ['spotlight', 'reveal', 'chandelier']);
  const rays = inKinds(kind, ['sunrise', 'courage', 'finale']);
  return <div ref={root} className={`theatrical-effects effects-${kind} effects-${intensity} ${!enabled ? 'fx-no-motion' : ''} ${enabled || run > 0 ? 'fx-touched' : ''}`} style={fxStyle} aria-hidden="true" data-motion-kind={kind}>
    <div className="fx-static-warmth"/>
    <div className="fx-halo fx-user-piece"/>
    {light && <div className="fx-followspot fx-user-piece"/>}
    {Array.from({length: direction.ambient === 'none' ? 0 : intensity === 'gentle' ? 5 : 8}, (_, i) => <i key={`a${i}`} className="fx-ambient-mote" style={{left: `${7 + fraction(scene * 4 + i * 23) * 86}%`, top: `${12 + fraction(scene + i * 29) * 76}%`, background: palette[i % palette.length]} as CSSProperties}/>)}
    <div className="fx-burst-field">{particles.map((p, i) => <span key={i} className={`fx-burst fx-user-piece ${kind === 'finale' ? 'fx-confetti' : kind === 'petals' ? 'fx-petal' : kind === 'wedding' ? 'fx-flower' : kind === 'heart' ? 'fx-tiny-heart' : 'fx-spark'}`} style={{left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: kind === 'finale' ? p.size * 1.7 : p.size, color: p.color, background: inKinds(kind, ['wedding', 'heart']) ? 'none' : p.color, '--fx-angle': `${p.angle}deg`} as CSSProperties}>
      {kind === 'heart' ? <svg viewBox="0 0 100 100"><path d={heartPath} fill="currentColor"/></svg> : kind === 'wedding' ? <svg viewBox="0 0 100 100"><path d={flowerPath} fill="currentColor"/><circle cx="50" cy="50" r="9" fill="#FFF2DD"/></svg> : null}
    </span>)}</div>
    {paper && <><div className="fx-paper-field">{Array.from({length: kind === 'quill-snap' ? 8 : 6}, (_, i) => <span key={i} className="fx-paper fx-user-piece" style={{left: `${35 + i * 5}%`, top: `${52 + i % 3 * 6}%`}}><i/><i/><i/></span>)}</div>
      {kind === 'quill' && <svg className="fx-feather fx-user-piece" viewBox="0 0 150 180"><path d="M25 164C47 113 60 73 119 13 129 63 91 118 46 128" fill="#FFF2DD" fillOpacity=".75" stroke="#FFC84B" strokeWidth="2"/><path d="M25 164 119 13M54 116l28-4M65 95l31-7M80 73l30-14" fill="none" stroke="#A86A45" strokeWidth="2" strokeLinecap="round"/></svg>}
      {kind === 'quill-snap' && <div className="fx-snap-prop"><svg className="fx-quill-half fx-quill-left fx-user-piece" viewBox="0 0 100 120"><path d="M15 112 65 41 75 46 53 65 57 75 40 87 41 96Z" fill="#FFF2DD" stroke="#FFC84B" strokeWidth="1.5"/></svg><svg className="fx-quill-half fx-quill-right fx-user-piece" viewBox="0 0 100 120"><path d="m35 79 7-13-3-9 15-14 1-11L83 8C89 34 73 66 49 80Z" fill="#FFF2DD" stroke="#FFC84B" strokeWidth="1.5"/></svg></div>}
    </>}
    {rays && <svg className="fx-ray-crown fx-user-piece" viewBox="0 0 1000 667" preserveAspectRatio="none"><g transform={`translate(${focal[0] * 1000} ${Math.max(300, focal[1] * 667)})`}>{Array.from({length: intensity === 'gentle' ? 11 : 19}, (_, i) => {const angle = (-160 + i * (140 / (intensity === 'gentle' ? 10 : 18))) * Math.PI / 180;return <path key={i} d={`M${Math.cos(angle) * 70} ${Math.sin(angle) * 70} ${Math.cos(angle) * 340} ${Math.sin(angle) * 340}`} stroke={i % 3 === 0 ? '#FFF2DD' : '#FFC84B'} strokeWidth={i % 2 ? 1.5 : 3} strokeLinecap="round"/>;})}</g></svg>}
    {kind === 'heart' && <svg className="fx-outline fx-heart-outline fx-user-piece" viewBox="0 0 100 100"><path d={heartPath} fill="none" stroke="#F0B5C5" strokeWidth=".9"/></svg>}
    {kind === 'ring' && <svg className="fx-outline fx-ring-outline fx-user-piece" viewBox="0 0 120 120"><circle cx="60" cy="69" r="33" fill="none" stroke="#FFC84B" strokeWidth="2.4"/><path d="m46 26 14-14 14 14-14 16Z" fill="#FFF2DD" fillOpacity=".35" stroke="#FFC84B" strokeWidth="2"/><path d="M60 4v7M37 15l6 5M83 15l-6 5" stroke="#FFF2DD" strokeWidth="1.7" strokeLinecap="round"/></svg>}
    {kind === 'courage' && <><div className="fx-outline fx-courage-ring fx-user-piece"/><div className="fx-outline fx-courage-ring second fx-user-piece"/></>}
    {kind === 'duet' && <svg className="fx-duet-svg" viewBox="0 0 1000 667" preserveAspectRatio="none"><path className="fx-ribbon fx-ribbon-a fx-user-piece" d="M-70 565C110 250 310 260 505 440S830 550 1070 185" fill="none" stroke="#EF168F" strokeWidth="5"/><path className="fx-ribbon fx-ribbon-b fx-user-piece" d="M1070 565C890 250 690 260 495 440S170 550-70 185" fill="none" stroke="#29C5F6" strokeWidth="4"/></svg>}
    {kind === 'carriage' && <><div className="fx-road">{Array.from({length: 9}, (_, i) => <i key={i} className="fx-road-streak fx-user-piece" style={{left: `${i * 14 - 8}%`, top: `${i % 3 * 16}%`, width: `${55 + i % 3 * 30}px`}}/>)}</div>{[0, 1].map((_, i) => <svg key={i} className={`fx-wheel-glimmer fx-user-piece wheel-${i}`} viewBox="0 0 100 100"><circle cx="50" cy="50" r="43" fill="none" stroke="#FFC84B" strokeWidth="1"/>{Array.from({length: 8}, (_, j) => <path key={j} d="M50 12v76" transform={`rotate(${j * 22.5} 50 50)`} stroke="#FFC84B" strokeWidth=".7"/>)}<circle cx="50" cy="50" r="4" fill="#FFF2DD"/></svg>)}</>}
    {kind === 'city' && <div className="fx-city-grid">{Array.from({length: 24}, (_, i) => <i key={i} className="fx-window-light fx-user-piece" style={{left: `${i < 12 ? 3 + i % 3 * 5 : 83 + i % 3 * 5}%`, top: `${9 + Math.floor(i % 12 / 3) * 19}%`, background: palette[(i + 2) % palette.length]}}/>)}</div>}
    {kind === 'music' && <><div className="fx-music-lights">{Array.from({length: 15}, (_, i) => <i key={i} className="fx-music-bar fx-user-piece" style={{height: `${45 + fraction(scene + i * 13) * 80}px`, background: `linear-gradient(to top,${palette[i % 3]},transparent)`}}/>)}</div>{Array.from({length: 5}, (_, i) => <span key={i} className="fx-note fx-user-piece" style={{left: `${i % 2 ? 87 : 5 + i * 3}%`, top: `${53 + i % 3 * 9}%`, color: palette[i % palette.length]}}>♫</span>)}</>}
    {kind === 'reveal' && <div className="fx-curtain-pair"><div className="fx-side-curtain fx-curtain-left fx-user-piece"/><div className="fx-side-curtain fx-curtain-right fx-user-piece"/></div>}
  </div>;
}
