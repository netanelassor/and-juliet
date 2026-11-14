import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {asset} from '../content/scenes';
import '../styles/character-choreography.css';

const performances = {
  15: {
    entrance: .62,
    rest: 7.2,
    light: [.56],
    moves: [
      ['prep', 1, .22, .04],
      ['hit', 1, .23, .61],
      ['prep', 0, 0, .86],
      ['hit', 0, .22, 2.14],
    ],
  },
  17: {
    entrance: .75,
    rest: 8,
    light: [1.12],
    moves: [
      ['prep', 1, .30, .04],
      ['hit', 1, .42, 1.15],
      ['prep', 0, 0, 1.59],
      ['hit', 0, .28, 2.69],
    ],
  },
  18: {
    entrance: .7,
    rest: 7,
    light: [0, 2.44],
    moves: [
      ['prep', 1, .19, .04],
      ['hit', 1, .19, .55],
      ['hit', 0, .18, 1.07],
      ['hit', 1, .19, 1.55],
      ['hit', 0, .19, 2.42],
      ['prep', 0, .19, 2.47],
    ],
  },
  20: {
    entrance: .8,
    rest: 4.8,
    light: [.09, 2.08],
    moves: [
      ['prep', 1, .15, .09],
      ['hit', 1, .17, .62],
      ['prep', 0, 0, .81],
      ['hit', 0, .28, 2.18],
    ],
  },
  26: {
    entrance: .7,
    rest: 5.6,
    light: [.60],
    moves: [
      ['prep', 1, .24, .05],
      ['hit', 1, .30, .62],
      ['prep', 0, 0, .94],
      ['hit', 0, .30, 2.24],
    ],
  },
  31: {
    entrance: 1.15,
    rest: 8,
    light: [.64],
    moves: [
      ['prep', 1, .50, .04],
      ['hit', 1, .74, 1.30],
      ['prep', 0, 0, 2.06],
      ['hit', 0, .36, 3.08],
    ],
  },
  33: {
    entrance: .85,
    rest: 5.4,
    light: [.06, 2.2],
    moves: [
      ['prep', 1, .18, .09],
      ['hit', 1, .21, .52],
      ['hit', 0, .20, 1.03],
      ['hit', 1, .19, 1.46],
      ['hit', 0, .21, 2.13],
      ['prep', 0, .23, 2.26],
    ],
  },
  36: {
    entrance: .65,
    rest: 6.7,
    light: [.58],
    moves: [
      ['prep', 1, .29, .05],
      ['hit', 1, .40, .69],
      ['prep', 0, 0, 1.12],
      ['hit', 0, .30, 2.18],
    ],
  },
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
  40: {
    entrance: .62,
    rest: 6.7,
    light: [.03, 1.10],
    moves: [
      ['prep', 1, .25, .05],
      ['hit', 1, .36, 1.04],
      ['prep', 0, 0, 1.42],
      ['hit', 0, .34, 2.54],
    ],
  },
  42: {
    entrance: .65,
    rest: 5.8,
    light: [.58, 2.34],
    moves: [
      ['prep', 1, .18, .04],
      ['hit', 1, .27, .60],
      ['prep', 0, 0, .89],
      ['hit', 0, .28, 2.34],
    ],
  },
  43: {
    entrance: .75,
    rest: 7.8,
    light: [.94],
    moves: [
      ['prep', 1, .28, .07],
      ['hit', 1, .39, .95],
      ['prep', 0, 0, 1.36],
      ['hit', 0, .47, 2.68],
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

export function hasCharacterChoreography(scene: number): scene is ChoreographyScene {
  return Object.hasOwn(performances, scene);
}

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
    // Keep the scene's resting artwork beneath both untransformed frames.
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
