import {useEffect, useLayoutEffect, useRef, useState, type CSSProperties} from 'react';
import gsap from 'gsap';
import {asset, illustration, thumbnail, characterInfo, type Chapter, type CharacterId} from '../content/scenes';
import geometry from '../content/stage-geometry.json';
import {motionForScene} from '../motion/scene-motion';
import {TheatricalEffects} from './TheatricalEffects';
import {Icon} from './Icons';
import type {Mode} from '../utils/progress';

type Point = {characterId: string; x: number; y: number; radius: number};
type Geometry = {hotspots: Point[]; interactionAnchor?: {x: number; y: number}};
const sceneGeometry = geometry.scenes as Record<string, Geometry>;

export function Stage({chapter, beatIndex, motion, mode, reading, replay, onIdentity, onInteract, onReady}: {
  chapter: Chapter; beatIndex: number; motion: boolean; mode: Mode; reading: boolean; replay: number;
  onIdentity: (id: CharacterId) => void; onInteract: () => void; onReady: () => void;
}) {
  const root = useRef<HTMLDivElement>(null), art = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const cameraAction = useRef<gsap.core.Timeline | null>(null);
  const [loaded, setLoaded] = useState(false), [run, setRun] = useState(0);
  const [imageError, setImageError] = useState(false), [retry, setRetry] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const lastReplay = useRef(replay);
  const autoConsumed = useRef(false);
  const beat = chapter.beats[beatIndex], direction = motionForScene(beat.sourceScene);
  const geo = sceneGeometry[String(beat.sourceScene).padStart(2, '0')];
  const hotspots = (geo?.hotspots || []).filter(p => p.characterId in characterInfo);
  const present = [...new Set(hotspots.map(p => p.characterId as CharacterId))];
  const cast = (present.length ? present : chapter.characters).slice(0, 4);
  const anchor = geo?.interactionAnchor || {x: direction.focal[0], y: direction.focal[1]};
  const moving = motion && mode !== 'quiet';

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (loaded && moving && !reading) gsap.fromTo(art.current, {opacity: 0, scale: 1.025}, {opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out'});
    }, root);
    return () => {cameraAction.current?.kill(); ctx.revert();};
  }, [loaded]);
  useEffect(() => {
    if (beat.sourceScene < 48) {const next = new Image(); next.src = illustration(beat.sourceScene + 1);}
  }, [beat.sourceScene]);
  useEffect(() => {
    if (!loaded || !moving || reading || autoConsumed.current) return;
    const timer = window.setTimeout(() => {if (autoConsumed.current) return; autoConsumed.current = true; setRun(n => n + 1);}, 650);
    return () => clearTimeout(timer);
  }, [loaded, moving, reading]);
  useEffect(() => {
    if (lastReplay.current !== replay) {lastReplay.current = replay; trigger();}
  }, [replay]);
  useEffect(() => {
    if (!moving) {cameraAction.current?.kill(); gsap.killTweensOf(art.current); gsap.set(art.current, {opacity: 1, scale: 1, rotation: 0, x: 0, y: 0});}
    const idle = moving && mode === 'explore' && !reading && loaded
      ? gsap.to(camera.current, {x: direction.camera === 'ride' ? 9 : 4, y: direction.camera === 'ride' ? -2 : -3, scale: 1.012, duration: direction.camera === 'ride' ? 5 : 10, repeat: -1, yoyo: true, ease: 'sine.inOut'}) : null;
    return () => {idle?.kill(); gsap.set(camera.current, {x: 0, y: 0, scale: 1});};
  }, [moving, mode, reading, loaded]);
  useEffect(() => {
    if (reading) {cameraAction.current?.kill(); gsap.killTweensOf(art.current); gsap.set(art.current, {rotation: 0, scale: 1, x: 0, y: 0});}
    if (run < 1 || !moving || reading) return;
    cameraAction.current?.kill();
    const tl = gsap.timeline(); cameraAction.current = tl;
    const target = art.current;
    if (direction.camera === 'sway') tl.to(target, {rotation: .65, transformOrigin: '50% 0%', duration: .85, ease: 'sine.inOut'}).to(target, {rotation: -.45, duration: 1.3, ease: 'sine.inOut'}).to(target, {rotation: 0, duration: 1.25, ease: 'sine.inOut'});
    else if (direction.camera === 'ride') tl.to(target, {y: -3, x: 4, duration: .26, ease: 'sine.inOut', repeat: 7, yoyo: true}).to(target, {y: 0, x: 0, duration: .6, ease: 'sine.out'});
    else if (direction.camera === 'lift') tl.to(target, {scale: 1.02, y: -3, duration: 1.7, ease: 'sine.inOut'}).to(target, {scale: 1, y: 0, duration: 1.8, ease: 'sine.inOut'});
    else if (direction.camera === 'reveal') tl.fromTo(target, {scale: 1.025}, {scale: 1, duration: 2.2, ease: 'power2.out'});
    return () => {tl.kill();};
  }, [run, reading]);

  function trigger() {if (!loaded) return; autoConsumed.current = true; onInteract(); setAnnouncement(direction.announcement); setRun(n => n + 1);}
  return <section ref={root} className={`stage stage-${chapter.family} motion-scene-${direction.kind} ${moving ? 'motion-on' : 'motion-off'} ${run > 0 ? 'activated' : ''} ${reading ? 'reading' : ''} ${imageError ? 'stage-is-error' : loaded ? 'stage-is-ready' : 'stage-is-loading'}`} aria-label={`הבמה. ${beat.title}`} data-scene={beat.sourceScene} data-run={run}>
    <div className="ambient-backdrop" aria-hidden="true"><img src={illustration(beat.sourceScene)} alt=""/></div>
    <div className="stage-ceiling" aria-hidden="true"><span/><span/><span/><span/><span/></div>
    <div className="light-beam beam-one" aria-hidden="true"/><div className="light-beam beam-two" aria-hidden="true"/>
    <div className="stage-picture" onClick={e => {
      if ((e.target as Element).closest('button,a')) return;
      const bounds = e.currentTarget.getBoundingClientRect();
      if (e.clientX > bounds.left + 24 && e.clientX < bounds.right - 24) trigger();
    }}>
      <img className="scene-preview" src={thumbnail(beat.sourceScene)} alt="" aria-hidden="true" onError={e => {e.currentTarget.style.visibility = 'hidden';}}/>
      <div ref={art} className="art-plane"><div ref={camera} className="camera-plane"><img key={retry} className="scene-art" src={illustration(beat.sourceScene) + (retry ? `?attempt=${retry}` : '')} alt={beat.title} draggable={false} fetchPriority="high" decoding="async" onLoad={() => {setLoaded(true); setImageError(false); onReady();}} onError={() => {setLoaded(false); setImageError(true); onReady();}}/></div></div>
      <div className="light-wash" aria-hidden="true"/>
      <TheatricalEffects scene={beat.sourceScene} run={run} enabled={moving} ambient={mode === 'explore'} paused={reading}/>
      <button className={`prop-hotspot ${moving ? 'prop-awake' : ''}`} disabled={!loaded} style={{left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%`} as CSSProperties} aria-label={direction.action} onClick={trigger}><Icon name="spark" size={17}/></button>
      {hotspots.map(point => <button key={point.characterId} className="character-hotspot" style={{left: `${point.x * 100}%`, top: `${point.y * 100}%`, width: `${point.radius * 200}%`, height: `${point.radius * 200}%`}} aria-label={`מי זה? ${characterInfo[point.characterId as CharacterId].name}`} onClick={() => onIdentity(point.characterId as CharacterId)}><span>מי זה?</span></button>)}
      {!loaded && <div className="stage-load-status" aria-live="polite">{imageError ? <><span>האיור מתעכב לרגע.</span><button data-testid="artwork-retry" onClick={() => {setImageError(false); setRetry(n => n + 1);}}><Icon name="replay" size={16}/>ננסה שוב</button></> : <span>מכינים את הבמה...</span>}</div>}
    </div>
    <div className="stage-floor" aria-hidden="true"/>
    <div className="stage-interactions"><button className="stage-action" disabled={!loaded} onClick={trigger} data-testid="stage-interaction"><Icon name={direction.kind === 'heart' ? 'heart' : 'spark'} size={18}/>{direction.action}</button>
      <div className="cast-strip" aria-label="מי על הבמה?">{cast.map(id => <button key={id} title={characterInfo[id].name} aria-label={`על ${characterInfo[id].name}`} onClick={() => onIdentity(id)}><img src={asset(`characters/${characterInfo[id].image}.webp`)} alt=""/><span>{characterInfo[id].name}</span></button>)}</div>
    </div><span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  </section>;
}
