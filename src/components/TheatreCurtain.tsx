import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import gsap from 'gsap';
import {asset} from '../content/scenes';
import '../styles/theatre-curtain.css';

export const CURTAIN_ART = 'theatre/curtain-illustrated-v1.webp';

/** A finite, illustrated cloth reveal. Completion owns the navigation lock;
 * there are no separate timers that can dismiss a later reveal accidentally. */
export function TheatreCurtain({ready, animate, title, onComplete}: {
  ready: boolean; animate: boolean; title: string; onComplete: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const finish = useRef(onComplete); finish.current = onComplete;
  const [artReady, setArtReady] = useState(false);
  const [waitExpired, setWaitExpired] = useState(false);
  const canReveal = (ready && artReady) || waitExpired;
  useEffect(() => {const timer = setTimeout(() => setWaitExpired(true), 3600); return () => clearTimeout(timer);}, []);
  useLayoutEffect(() => {
    if (!animate) {finish.current(); return;}
    if (!canReveal) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({onComplete: () => finish.current()});
      timeline.to('.curtain-seal', {opacity: 0, y: -7, duration: .3, ease: 'power1.in'}, .16)
        .to('.curtain-wing-left', {xPercent: -104, scaleX: .78, skewY: -1.2, transformOrigin: '0% 0%', duration: 1.4, ease: 'power3.inOut'}, .38)
        .to('.curtain-wing-right', {xPercent: 104, scaleX: .78, skewY: 1.2, transformOrigin: '100% 0%', duration: 1.4, ease: 'power3.inOut'}, .38)
        .to('.curtain-edge-light', {opacity: 0, duration: .7}, .5)
        .to(root.current, {backgroundColor: 'rgba(11,8,25,0)', duration: .85}, .45);
    }, root);
    return () => ctx.revert();
  }, [canReveal, animate]);
  return <div ref={root} className="curtain-reveal illustrated-curtain" data-testid="opening-curtain" aria-hidden="true" onPointerDown={e => e.preventDefault()}>
    <div className="curtain-wing curtain-wing-left"><img src={asset(CURTAIN_ART)} alt="" draggable={false} onLoad={() => setArtReady(true)} onError={() => setArtReady(true)}/></div>
    <div className="curtain-wing curtain-wing-right"><img src={asset(CURTAIN_ART)} alt="" draggable={false}/></div>
    <div className="curtain-edge-light"/>
    <div className="curtain-seal"><img src={asset('cover/logo.webp')} alt=""/><span>{ready ? title : 'הבמה מתכוננת...'}</span></div>
  </div>;
}
