import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {illustration, thumbnail, characterInfo, type Chapter, type CharacterId} from '../content/scenes';
import geometry from '../content/stage-geometry.json';
import {motionForScene} from '../motion/scene-motion';
import {TheatricalEffects} from './TheatricalEffects';
import {Icon} from './Icons';
import {PaintedPerformance} from './PaintedPerformance';
import {CharacterChoreography, hasCharacterChoreography, type ChoreographyScene} from './CharacterChoreography';
import {StoryLighting, lightingForScene} from './StoryLighting';
import type {IconName} from './Icons';
import {StageCue} from './StageCue';
import {StageMomentEffect, stageMoment} from './StageMoments';
import type {Mode} from '../utils/progress';

type Point = {characterId: string; x: number; y: number; radius: number};
type Geometry = {hotspots: Point[]; interactionAnchor?: {x: number; y: number}};
const sceneGeometry = geometry.scenes as Record<string, Geometry>;

const performanceCues: Partial<Record<ChoreographyScene, {x: number; y: number; icon: IconName; label: string; announcement: string}>> = {
  15: {x: 48, y: 78, icon: 'spark', label: 'לפגוש את פרנסואה', announcement: 'מיי ופרנסואה נתקלים זה בזה ומחייכים.'},
  17: {x: 50, y: 75, icon: 'music', label: 'להפתיע את פרנסואה בפסנתר', announcement: 'ג׳ולייט מגיעה מאחור. פרנסואה מסתובב אליה ומחייך.'},
  18: {x: 42, y: 77, icon: 'music', label: 'לרקוד על השולחן', announcement: 'ג׳ולייט ופרנסואה רוקדים על השולחן!'},
  20: {x: 51, y: 40, icon: 'music', label: 'לנסות את הצעד של לאנס', announcement: 'אנג׳ליק תופסת את לאנס והוא חוזר לרקוד.'},
  26: {x: 47, y: 71, icon: 'spark', label: 'לפתוח מקום לג׳ולייט', announcement: 'ג׳ולייט פונה לקהל ורומיאו מקשיב.'},
  31: {x: 49, y: 72, icon: 'spark', label: 'להרים את ספסל הירח', announcement: 'ספסל הירח עולה מול הגלגל הענק.'},
  33: {x: 53, y: 88, icon: 'music', label: 'להתחיל את הריקוד', announcement: 'ג׳ולייט, רומיאו והלהקה עונים זה לזה בריקוד.'},
  36: {x: 46, y: 83, icon: 'spark', label: 'לקום עם אן וג׳ולייט', announcement: 'אן עומדת לצד ג׳ולייט, והן קמות יחד.'},
  38: {x: 50, y: 85, icon: 'music', label: 'להרקיד את הלהקה', announcement: 'הלהקה רוקדת יחד!'},
  40: {x: 51, y: 81, icon: 'spark', label: 'לעצור רגע את החתונה', announcement: 'פרנסואה פונה אל מיי וג׳ולייט מחייכת.'},
  42: {x: 51, y: 82, icon: 'spark', label: 'לפנות לג׳ולייט את הבמה', announcement: 'ג׳ולייט עומדת יציבה ומרימה יד. עכשיו כולם מקשיבים.'},
  43: {x: 46, y: 79, icon: 'heart', label: 'לחבק את לאנס', announcement: 'פרנסואה ולאנס מתחבקים ומיי מחייך לידם.'},
  48: {x: 47, y: 91, icon: 'heart', label: 'להזמין את כולם לקידה', announcement: 'הלהקה קדה והקהל מוחא כפיים.'},
};

export function Stage({chapter, beatIndex, motion, mode, replay, onIdentity, onInteract, onReady}: {
  chapter: Chapter; beatIndex: number; motion: boolean; mode: Mode; reading: boolean; replay: number;
  onIdentity: (id: CharacterId) => void; onInteract: () => void; onReady: () => void;
}) {
  const root = useRef<HTMLDivElement>(null), art = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const painting = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false), [run, setRun] = useState(0);
  const [momentRun, setMomentRun] = useState(0);
  const [imageError, setImageError] = useState(false), [retry, setRetry] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const lastReplay = useRef(replay);
  const beat = chapter.beats[beatIndex], direction = motionForScene(beat.sourceScene);
  const juliet = beat.sourceScene === 6;
  const scene = beat.sourceScene;
  const choreography = hasCharacterChoreography(scene) ? scene : undefined;
  const moment = stageMoment(scene);
  const performance = choreography ? performanceCues[choreography] : undefined;
  const lighting = lightingForScene(scene);
  const action = performance?.label ?? lighting?.label ?? moment?.action ?? (juliet ? 'להדליק ספוט' : direction.action);
  const cue = performance ?? (moment ? {x: moment.x, y: moment.y, label: moment.target, icon: moment.icon}
    : juliet ? {x: 72, y: 37, label: 'להאיר את ג׳ולייט על הבמה', icon: 'spark' as const}
    : lighting ? {x: lighting.target[0], y: lighting.target[1], label: action}
    : undefined);
  const geo = sceneGeometry[String(beat.sourceScene).padStart(2, '0')];
  const hotspots = (geo?.hotspots || []).filter(p => p.characterId in characterInfo);
  const moving = motion && mode !== 'quiet';
  const ambientRun = moment || choreography || lighting ? 0 : run;

  useLayoutEffect(() => {
    if (!loaded || !moving || juliet || choreography) return;
    const ctx = gsap.context(() => {
      // Every scene comes alive by itself. Reading and pointer focus do not
      // suspend it; the parent's global motion/quiet/device gates do.
      gsap.fromTo(art.current, {opacity: .92}, {opacity: 1, duration: 1.4, repeat: -1, yoyo: true, repeatDelay: 4.2, ease: 'sine.inOut'});
      gsap.to(camera.current, {x: direction.camera === 'ride' ? 9 : 4, y: direction.camera === 'ride' ? -2 : -3, scale: 1.012, duration: direction.camera === 'ride' ? 5 : 10, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      gsap.fromTo('.beam-one', {rotation: -18}, {rotation: 12, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      gsap.fromTo('.beam-two', {rotation: 20}, {rotation: -13, duration: 18, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      if (direction.camera !== 'still') {
        const tl = gsap.timeline({repeat: -1, repeatDelay: direction.intensity === 'gentle' ? 3.8 : 2.6, delay: .65});
        const target = art.current;
        if (direction.camera === 'sway') tl.to(target, {rotation: .65, transformOrigin: '50% 0%', duration: .85, ease: 'sine.inOut'}).to(target, {rotation: -.45, duration: 1.3, ease: 'sine.inOut'}).to(target, {rotation: 0, duration: 1.25, ease: 'sine.inOut'});
        else if (direction.camera === 'ride') tl.to(target, {y: -3, x: 4, duration: .26, ease: 'sine.inOut', repeat: 7, yoyo: true}).to(target, {y: 0, x: 0, duration: .6, ease: 'sine.out'});
        else if (direction.camera === 'lift') tl.to(target, {scale: 1.02, y: -3, duration: 1.7, ease: 'sine.inOut'}).to(target, {scale: 1, y: 0, duration: 1.8, ease: 'sine.inOut'});
        else if (direction.camera === 'reveal') tl.fromTo(target, {scale: 1.025}, {scale: 1, duration: 2.2, ease: 'power2.out'});
      }
    }, root);
    return () => ctx.revert();
  }, [loaded, moving, beat.sourceScene, ambientRun, juliet, choreography]);
  useEffect(() => {
    if (!moment || !moving || !loaded) {
      setMomentRun(0);
      return;
    }
    if (choreography === 48) return;
    const repeat = window.setTimeout(() => setMomentRun(n => n + 1), momentRun === 0 ? 2700 : 9700);
    return () => window.clearTimeout(repeat);
  }, [moment, moving, loaded, momentRun, choreography]);
  useEffect(() => {
    if (beat.sourceScene < 48) {const next = new Image(); next.src = illustration(beat.sourceScene + 1);}
  }, [beat.sourceScene]);
  useEffect(() => {
    if (lastReplay.current !== replay) {lastReplay.current = replay; trigger();}
  }, [replay]);
  function trigger() {
    if (!loaded || !moving) return;
    onInteract();
    setAnnouncement(performance?.announcement ?? lighting?.announcement ?? moment?.announcement ?? (juliet ? 'הספוט מאיר את ג׳ולייט.' : direction.announcement));
    setRun(n => n + 1);
    if (moment && choreography !== 48) setMomentRun(n => n + 1);
  }
  return <section ref={root} className={`stage premium-standard-stage stage-${chapter.family} motion-scene-${direction.kind} ${moving ? 'motion-on' : 'motion-off'} ${loaded && moving || run > 0 ? 'activated' : ''} ${imageError ? 'stage-is-error' : loaded ? 'stage-is-ready' : 'stage-is-loading'}`} aria-label={`הבמה. ${beat.title}`} data-family={chapter.family} data-scene={beat.sourceScene} data-run={run}>
    <div className="ambient-backdrop" aria-hidden="true"><img src={illustration(beat.sourceScene)} alt=""/></div>
    <div className="stage-ceiling" aria-hidden="true"><span/><span/><span/><span/><span/></div>
    <div className="light-beam beam-one" style={{animation: 'none'}} aria-hidden="true"/><div className="light-beam beam-two" style={{animation: 'none'}} aria-hidden="true"/>
    <div className="stage-picture" onClick={e => {
      if ((e.target as Element).closest('button,a')) return;
      const bounds = e.currentTarget.getBoundingClientRect();
      if (e.clientX > bounds.left + 24 && e.clientX < bounds.right - 24) trigger();
    }}>
      <img className="scene-preview" src={thumbnail(beat.sourceScene)} alt="" aria-hidden="true" onError={e => {e.currentTarget.style.visibility = 'hidden';}}/>
      <div ref={art} className="art-plane">
        <div ref={camera} className="camera-plane">
          <img ref={painting} key={retry} className="scene-art" src={illustration(beat.sourceScene) + (retry ? `?attempt=${retry}` : '')} alt={beat.title} draggable={false} fetchPriority="high" decoding="async" onLoad={() => {setLoaded(true); setImageError(false); onReady();}} onError={() => {setLoaded(false); setImageError(true); onReady();}}/>
          {choreography && <CharacterChoreography scene={choreography} enabled={loaded && moving} run={run} onBow={() => setMomentRun(n => n + 1)}/>}
          {moment && moving && loaded && momentRun > 0 && <StageMomentEffect key={momentRun} scene={beat.sourceScene}/>}
        </div>
      </div>
      {juliet && <PaintedPerformance painting={painting} ready={loaded} motion={moving} run={run} ensemble={false}/>}
      <div className="light-wash" aria-hidden="true"/>
      <TheatricalEffects scene={beat.sourceScene} run={ambientRun} enabled={moving && loaded && !juliet} ambient/>
      {lighting && moving && loaded && <StoryLighting key={run} lighting={lighting}/>}
      {hotspots.map(point => <button key={point.characterId} className="character-hotspot" style={{left: `${point.x * 100}%`, top: `${point.y * 100}%`, width: `${point.radius * 200}%`, height: `${point.radius * 200}%`}} aria-label={`מי זה? ${characterInfo[point.characterId as CharacterId].name}`} onClick={() => onIdentity(point.characterId as CharacterId)}><span>מי זה?</span></button>)}
      {cue && loaded && moving && <StageCue {...cue} onActivate={trigger}/>}
      {!loaded && <div className="stage-load-status" aria-live="polite">{imageError ? <><span>האיור מתעכב לרגע.</span><button data-testid="artwork-retry" onClick={() => {setImageError(false); setRetry(n => n + 1);}}><Icon name="replay" size={16}/>ננסה שוב</button></> : <span>מכינים את הבמה...</span>}</div>}
    </div>
    <div className="stage-floor" aria-hidden="true"/>
    <div className="premium-stage-footer"><button disabled={!loaded || !moving} onClick={trigger} data-testid="stage-interaction" aria-label={action}><Icon name="spark" size={19}/><span>{action}</span></button></div>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  </section>;
}
