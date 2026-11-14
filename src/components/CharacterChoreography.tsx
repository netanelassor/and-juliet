import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {asset} from '../content/scenes';
import '../styles/character-choreography.css';

const performances = {
  38: {
    entrance: .9,
    rest: 4.1,
    light: [.01, 2.25],
    moves: [
      ['prep', 1, .16, .04],
      ['hit', 1, .18, .40],
      ['hit', 0, .22, .88],
      ['hit', 1, .17, 1.28],
      ['hit', 0, .23, 1.86],
      ['prep', 0, .22, 2.31],
    ],
  },
  46: {
    entrance: .7,
    rest: 6.1,
    light: [.05, .89],
    moves: [
      ['prep', 1, .20, .08],
      ['hit', 1, .28, .84],
      ['prep', 0, 0, 1.16],
      ['hit', 0, .21, 1.73],
    ],
  },
  48: {
    entrance: 1.2,
    rest: 6.6,
    light: [.01, 2.25],
    moves: [
      ['prep', 1, .18, .06],
      ['hit', 1, .32, .52],
      ['hit', 0, .32, 1.70],
      ['prep', 0, .22, 2.31],
    ],
  },
} as const;

export type ChoreographyScene = keyof typeof performances;

export function CharacterChoreography({scene, enabled, run, onBow}: {
  scene: ChoreographyScene; enabled: boolean; run: number; onBow?: () => void;
}) {
  const prep = useRef<HTMLImageElement>(null);
  const hit = useRef<HTMLImageElement>(null);
  const light = useRef<HTMLSpanElement>(null);
  const bow = useRef(onBow);
  const [decodedScene, setDecodedScene] = useState<ChoreographyScene>();

  useLayoutEffect(() => {bow.current = onBow;}, [onBow]);

  useEffect(() => {
    if (!enabled || !prep.current || !hit.current) return;
    let current = true;
    Promise.all([prep.current.decode(), hit.current.decode()]).then(() => {
      if (current) setDecodedScene(scene);
    }).catch(() => {
      if (current) setDecodedScene(undefined);
    });
    return () => {current = false;};
  }, [scene, enabled]);

  useLayoutEffect(() => {
    if (!enabled || scene !== decodedScene || !prep.current || !hit.current || !light.current) return;
    const score = performances[scene];
    const pictures = {prep: prep.current, hit: hit.current};
    const sequence = gsap.timeline({repeat: -1, repeatDelay: score.rest, delay: run ? 0 : score.entrance});

    // The prep frame stays underneath the hit for a clean dissolve back to it.
    // Keep the original stage at rest beneath both untransformed frames.
    for (const [pose, opacity, duration, start] of score.moves) {
      sequence.to(pictures[pose], {opacity, duration, ease: 'sine.inOut'}, start);
    }
    for (const start of score.light) {
      sequence.to(light.current, {opacity: .64, duration: .12, ease: 'sine.out'}, start)
        .to(light.current, {opacity: 0, duration: .34, ease: 'sine.inOut'}, start + .12);
    }
    if (scene === 48) sequence.call(() => bow.current?.(), [], .84);
    return () => {sequence.revert();};
  }, [decodedScene, enabled, run, scene]);

  if (!enabled) return null;
  const path = `performance/scene-${scene}`;
  return <div className="character-choreography" aria-hidden="true" data-choreography={scene}>
    <img ref={prep} src={asset(`${path}-prep.webp`)} alt="" draggable={false} decoding="async" data-pose="prep"/>
    <img ref={hit} src={asset(`${path}-hit.webp`)} alt="" draggable={false} decoding="async" data-pose="hit"/>
    <span ref={light} className="choreography-light"/>
  </div>;
}
