import {useLayoutEffect, useRef, type RefObject} from 'react';
import gsap from 'gsap';
import {bindPaintedGesture} from '../motion/painted-gesture';

export function PaintedPerformance({painting, ready, motion, run, ensemble = false}: {
  painting: RefObject<HTMLImageElement | null>; ready: boolean; motion: boolean; run: number; ensemble?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const surface = canvas.current, artwork = painting.current, light = spot.current;
    if (!ready || !motion || !surface || !artwork || !light) return;
    const renderer = bindPaintedGesture(surface, artwork, ensemble);
    const pose = {head:0, wrist:0, ribbon:0, hem:0};
    const draw = () => renderer?.draw(pose.head, pose.wrist, pose.ribbon, pose.hem);
    surface.hidden = !renderer;
    draw();
    const sequence = gsap.timeline({repeat:-1, repeatDelay:run ? 6 : 5, delay:run ? 0 : 1.2, onUpdate:draw});
    const contextLost = (event: Event) => {event.preventDefault(); surface.hidden = true;};
    surface.addEventListener('webglcontextlost', contextLost);
    if (ensemble) {
      sequence
        .to(pose,{head:1, wrist:-.7,duration:.65,ease:'sine.inOut'},0)
        .to(pose,{head:-.9,wrist:1,duration:.9,ease:'sine.inOut'},.67)
        .to(pose,{head:.68,wrist:-.75,duration:.84,ease:'sine.inOut'},1.6)
        .to(pose,{head:0,wrist:0,duration:.66,ease:'sine.inOut'},2.7);
    } else sequence
      .fromTo(light, {opacity:0, rotation:-7}, {opacity:run ? .9 : .64, rotation:0, duration:.68, ease:'sine.inOut'},0)
      .to(pose,{head:1, duration:.85, ease:'sine.inOut'},.18)
      .to(pose,{wrist:1, duration:.9, ease:'sine.inOut'},.5)
      .to(pose,{ribbon:1, duration:.64, ease:'sine.inOut'},.78)
      .to(pose,{hem:1, duration:.8, ease:'sine.inOut'},1.02)
      .to(pose,{ribbon:-.4, hem:-.27, duration:.63, ease:'sine.inOut'},1.7)
      .to(pose,{ribbon:.15, hem:.15, duration:.6, ease:'sine.inOut'},2.32)
      .to(pose,{head:0, wrist:0, ribbon:0, hem:0, duration:1.1, ease:'sine.inOut'},2.85)
      .to(light,{opacity:0, duration:1.05, ease:'sine.inOut'},2.9);
    return () => {
      sequence.revert();
      surface.hidden = true;
      surface.removeEventListener('webglcontextlost', contextLost);
      renderer?.dispose();
    };
  }, [painting, ready, motion, run, ensemble]);

  return <>
    <canvas ref={canvas} className="juliet-performance" hidden aria-hidden="true"/>
    <div ref={spot} className="juliet-followspot" aria-hidden="true"/>
  </>;
}
