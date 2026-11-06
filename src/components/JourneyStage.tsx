import {useEffect,useId,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import gsap from 'gsap';
import {asset,illustration,thumbnail,characterInfo,type Chapter,type CharacterId} from '../content/scenes';
import geometry from '../content/stage-geometry.json';
import {carriageMatte,romeoMatte,type JourneyMatte} from '../motion/journey-masks';
import {Icon} from './Icons';
import type {Mode} from '../utils/progress';
import '../styles/journey-stage.css';

export interface JourneyStageProps {
  chapter:Chapter;beatIndex:number;motion:boolean;mode:Mode;reading:boolean;replay:number;
  onIdentity:(id:CharacterId)=>void;onInteract:()=>void;onReady:()=>void;
}
function Paint({matte,fill='white'}:{matte:JourneyMatte;fill?:string}){
  return <g fill={fill} stroke={matte.margin?fill:'none'} strokeWidth={matte.margin??0} strokeLinejoin="round" strokeLinecap="round">{matte.paths.map((d,i)=><path key={i} d={d}/>)}</g>;
}

/** Layered journey/reveal scenes. Every visible rider, wheel and Romeo pixel
 * comes from the original painting. A separate clean plate fills vacated edges.
 * Quiet/reduced-motion gets the untouched complete source image. */
export function JourneyStage({chapter,beatIndex,motion,mode,replay,onIdentity,onInteract,onReady}:JourneyStageProps){
  const beat=chapter.beats[beatIndex], scene=beat.sourceScene as 10|24;
  const carriage=scene===10;
  const prefix='journey-'+useId().replaceAll(':','');
  const root=useRef<HTMLElement>(null),background=useRef<SVGGElement>(null),coach=useRef<SVGGElement>(null),actor=useRef<SVGGElement>(null);
  const wheels=useRef<(SVGGElement|null)[]>([]);
  const [originalReady,setOriginalReady]=useState(false),[plateReady,setPlateReady]=useState(false),[failed,setFailed]=useState(false),[run,setRun]=useState(0);
  const previousReplay=useRef(replay);
  const moving=motion&&mode!=='quiet',ready=originalReady&&plateReady,layered=ready&&moving;
  const image=illustration(scene),plate=asset(`premium/scene-${scene}-clean.webp`);
  const hotspots=(geometry.scenes as Record<string,{hotspots:{characterId:string;x:number;y:number;radius:number}[]}>)[String(scene)].hotspots;
  const hint=carriage?'הגלגלים מסתובבים, והדרך לפריז כבר מתחילה.':'האורות עולים. מישהו חזר לבמה!';

  useEffect(()=>{if(scene<48){const next=new Image();next.src=illustration(scene+1);}},[scene]);
  useEffect(()=>{if(previousReplay.current!==replay){previousReplay.current=replay;setRun(n=>n+1);}},[replay]);
  useLayoutEffect(()=>{
    if(!layered)return;
    const ctx=gsap.context(()=>{
      if(carriage){
        // Rotate the circular source-space wheel planes, then their outer SVG
        // groups reproject to the original perspective ellipses. Rims stay put.
        wheels.current.forEach((wheel,i)=>{if(wheel)gsap.fromTo(wheel,{rotation:0},{rotation:360,svgOrigin:'0 0',duration:i?4.2:3.4,ease:'none',repeat:-1});});
        gsap.timeline({repeat:-1}).to(coach.current,{y:-1.8,rotation:-.055,svgOrigin:'770 800',duration:.78,ease:'sine.inOut'})
          .to(coach.current,{y:.7,rotation:.035,duration:.86,ease:'sine.inOut'})
          .to(coach.current,{y:0,rotation:0,duration:.78,ease:'sine.inOut'});
        gsap.fromTo(background.current,{x:2,scale:1.006,svgOrigin:'768 512'},{x:-3,scale:1.006,duration:6.5,repeat:-1,yoyo:true,ease:'sine.inOut'});
        gsap.fromTo('.journey-road-light',{x:70,opacity:0},{x:-105,opacity:.25,duration:2.4,repeat:-1,stagger:.55,ease:'none'});
      }else{
        // One entrance, then an unhurried recurring followspot. Romeo remains
        // visible during the loop; the story is never covered by a curtain.
        gsap.fromTo(actor.current,{y:8,opacity:.55},{y:0,opacity:1,duration:1.15,ease:'power2.out'});
        gsap.timeline({repeat:-1,delay:1.2,repeatDelay:.8})
          .to(actor.current,{y:-1.7,duration:2.6,ease:'sine.inOut'})
          .to(actor.current,{y:0,duration:3.1,ease:'sine.inOut'})
          .to(actor.current,{y:.6,duration:1.9,ease:'sine.inOut'})
          .to(actor.current,{y:0,duration:2,ease:'sine.inOut'});
        gsap.timeline({repeat:-1,repeatDelay:1.1})
          .fromTo('.journey-reveal-light',{opacity:.08},{opacity:.34,duration:1.3,ease:'sine.out'})
          .to('.journey-reveal-light',{opacity:.16,duration:3.8,ease:'sine.inOut'})
          .to('.journey-reveal-light',{opacity:.28,duration:2.5,ease:'sine.inOut'})
          .to('.journey-reveal-light',{opacity:.08,duration:2.4,ease:'sine.inOut'});
        gsap.fromTo('.journey-podium-glow',{opacity:.05},{opacity:.26,duration:3.2,repeat:-1,yoyo:true,ease:'sine.inOut'});
      }
    },root);
    return()=>ctx.revert();
  },[layered,scene,run]);

  function replayMoment(){if(!ready||!moving)return;onInteract();setRun(n=>n+1);}
  const source=(mask:string)=><image href={image} width="1536" height="1024" mask={`url(#${prefix}-${mask})`}/>;
  const figure=carriage?carriageMatte.body:romeoMatte.character;
  const removal=carriage?carriageMatte.removal:romeoMatte.removal;

  return <section ref={root} className={`stage premium-stage journey-stage journey-scene-${scene} ${layered?'journey-layered':''} ${moving?'motion-on':'motion-off'}`} aria-label={`הבמה. ${beat.title}`} data-scene={scene} data-run={run} data-layered={layered?'original-pixels':'source-still'}>
    <div className="ambient-backdrop" aria-hidden="true"><img src={image} alt=""/></div>
    <div className="stage-picture journey-picture">
      <img className="journey-preview" src={thumbnail(scene)} alt="" aria-hidden="true"/>
      <img className={`scene-art journey-original ${layered?'journey-original-covered':''}`} src={image} alt={beat.title} fetchPriority="high" decoding="async" draggable={false} onLoad={()=>{setOriginalReady(true);onReady();}} onError={e=>{setFailed(true);e.currentTarget.style.visibility='hidden';onReady();}}/>
      <img className="journey-preload" src={plate} alt="" onLoad={()=>setPlateReady(true)} onError={()=>setFailed(true)}/>
      {layered&&<svg className="journey-canvas" viewBox="0 0 1536 1024" aria-hidden="true">
        <defs>
          <mask id={`${prefix}-base`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><rect width="1536" height="1024" fill="white"/><Paint matte={removal} fill="black"/>{carriage&&<path d={carriageMatte.reins} stroke="black" strokeWidth="15" fill="none" strokeLinecap="round"/>}</mask>
          <mask id={`${prefix}-figure`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><Paint matte={figure}/>{carriage&&<><path d={carriageMatte.reins} stroke="white" strokeWidth="10" fill="none" strokeLinecap="round"/>{carriageMatte.wheels.map((w,i)=><ellipse key={i} cx={w.cx} cy={w.cy} rx={w.rx} ry={w.ry} fill="black"/>)}</>}</mask>
          {carriage&&carriageMatte.wheels.map((w,i)=><g key={i}>
            <clipPath id={`${prefix}-round-${i}`} clipPathUnits="userSpaceOnUse"><circle cx="0" cy="0" r="1"/></clipPath>
            <mask id={`${prefix}-paint-${i}`} maskUnits="userSpaceOnUse" x="-2" y="-2" width="4" height="4"><g transform={`scale(${1/w.rx} ${1/w.ry}) translate(${-w.cx} ${-w.cy})`}><path d={w.paintPath} fill="white"/></g></mask>
          </g>)}
          {!carriage&&<mask id={`${prefix}-front`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><g fill="white">{romeoMatte.fixedForegroundPaths.map((d,i)=><path key={i} d={d}/>)}</g></mask>}
          <linearGradient id={`${prefix}-beam`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FFF2DD" stopOpacity=".7"/><stop offset=".7" stopColor="#29C5F6" stopOpacity=".12"/><stop offset="1" stopColor="#29C5F6" stopOpacity="0"/></linearGradient>
          <radialGradient id={`${prefix}-floor`}><stop stopColor="#FFF2DD" stopOpacity=".65"/><stop offset="1" stopColor="#29C5F6" stopOpacity="0"/></radialGradient>
        </defs>
        <g ref={background}><image href={plate} width="1536" height="1024"/>{source('base')}</g>
        {!carriage&&<><path className="journey-reveal-light" d="M904 0H1052L1346 719H659Z" fill={`url(#${prefix}-beam)`} opacity="0"/><ellipse className="journey-podium-glow" cx="1018" cy="704" rx="362" ry="69" fill={`url(#${prefix}-floor)`} opacity="0"/></>}
        {carriage?<g ref={coach}>
          {source('figure')}
          {carriageMatte.wheels.map((w,i)=><g key={i} transform={`translate(${w.cx} ${w.cy}) scale(${w.rx} ${w.ry})`}><g ref={el=>{wheels.current[i]=el;}} clipPath={`url(#${prefix}-round-${i})`}><image href={image} preserveAspectRatio="none" x={-w.cx/w.rx} y={-w.cy/w.ry} width={1536/w.rx} height={1024/w.ry} mask={`url(#${prefix}-paint-${i})`}/></g></g>)}
        </g>:<g ref={actor}>{source('figure')}</g>}
        {!carriage&&source('front')}
        {carriage&&<g stroke="#FFC84B" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5">{[0,1,2].map(i=><path key={i} className="journey-road-light" d={`M${15+i*85} ${918+i*23}q46-8 96 0`} opacity="0"/>)}</g>}
      </svg>}
      {hotspots.filter(p=>p.characterId in characterInfo).map(p=><button key={p.characterId} className="character-hotspot journey-character-hotspot" style={{left:`${p.x*100}%`,top:`${p.y*100}%`,width:`${p.radius*140}%`,height:`${p.radius*140}%`} as CSSProperties} aria-label={`מי זה? ${characterInfo[p.characterId as CharacterId].name}`} onClick={()=>onIdentity(p.characterId as CharacterId)}><span>{characterInfo[p.characterId as CharacterId].name}</span></button>)}
      {moving&&!ready&&<span className="journey-loading">{failed?'אפשר להמשיך לקרוא.':'מכינים את רגע הבמה…'}</span>}
    </div>
    <div className="premium-stage-footer journey-stage-footer"><p>{moving?hint:'רגע שקט בסיפור.'}</p><button aria-label="נפעיל שוב את רגע הבמה" onClick={replayMoment} disabled={!ready||!moving}><Icon name="replay" size={17}/><span>שוב</span></button></div>
  </section>;
}
