import {useEffect,useId,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import gsap from 'gsap';
import {asset,illustration,thumbnail,characterInfo,type Chapter,type CharacterId} from '../content/scenes';
import geometry from '../content/stage-geometry.json';
import {carriageMatte,type JourneyMatte} from '../motion/journey-masks';
import {Icon} from './Icons';
import {RomeoDescent} from './RomeoDescent';
import {StageCue} from './StageCue';
import type {Mode} from '../utils/progress';
import '../styles/journey-stage.css';

export interface JourneyStageProps {
  chapter:Chapter;beatIndex:number;motion:boolean;mode:Mode;reading:boolean;replay:number;
  onIdentity:(id:CharacterId)=>void;onInteract:()=>void;onReady:()=>void;
}
function Paint({matte,fill='white'}:{matte:JourneyMatte;fill?:string}){
  return <g fill={fill} stroke={matte.margin?fill:'none'} strokeWidth={matte.margin??0} strokeLinejoin="round" strokeLinecap="round">{matte.paths.map((d,i)=><path key={i} d={d}/>)}</g>;
}

/** Carriage travel and Romeo's fly-in both rest on a complete illustrated frame. */
export function JourneyStage({chapter,beatIndex,motion,mode,replay,onIdentity,onInteract,onReady}:JourneyStageProps){
  const beat=chapter.beats[beatIndex], scene=beat.sourceScene as 10|24;
  const carriage=scene===10;
  const prefix='journey-'+useId().replaceAll(':','');
  const root=useRef<HTMLElement>(null),background=useRef<SVGGElement>(null),coach=useRef<SVGGElement>(null);
  const wheels=useRef<(SVGGElement|null)[]>([]);
  const wheelMotion=useRef<gsap.core.Tween[]>([]);
  const speedCue=useRef<gsap.core.Timeline|null>(null);
  const [originalReady,setOriginalReady]=useState(false),[plateReady,setPlateReady]=useState(false),[failed,setFailed]=useState(false),[run,setRun]=useState(0);
  const previousReplay=useRef(replay);
  const moving=motion&&mode!=='quiet',ready=originalReady&&plateReady,layered=ready&&moving;
  const image=illustration(scene),plate=asset(carriage?'premium/scene-10-clean.webp':'performance/scene-24-prep.webp');
  const hotspots=(geometry.scenes as Record<string,{hotspots:{characterId:string;x:number;y:number;radius:number}[]}>)[String(scene)].hotspots;
  const hint=carriage?'הגלגלים מסתובבים, והדרך לפריז כבר מתחילה.':'הסתכלו למעלה. רומיאו יורד אל הבמה!';

  useEffect(()=>{if(scene<48){const next=new Image();next.src=illustration(scene+1);}},[scene]);
  useEffect(()=>{if(previousReplay.current!==replay){previousReplay.current=replay;setRun(n=>n+1);}},[replay]);
  useLayoutEffect(()=>{
    if(!layered||!carriage)return;
    const ctx=gsap.context(()=>{
        // Rotate the circular source-space wheel planes, then their outer SVG
        // groups reproject to the original perspective ellipses. Rims stay put.
        wheelMotion.current = wheels.current.flatMap((wheel, i) => wheel
          ? [gsap.fromTo(wheel, {rotation:0}, {rotation:360, svgOrigin:'0 0', duration:i?4.2:3.4, ease:'none', repeat:-1})]
          : []);
        gsap.timeline({repeat:-1}).to(coach.current,{y:-1.8,rotation:-.055,svgOrigin:'770 800',duration:.78,ease:'sine.inOut'})
          .to(coach.current,{y:.7,rotation:.035,duration:.86,ease:'sine.inOut'})
          .to(coach.current,{y:0,rotation:0,duration:.78,ease:'sine.inOut'});
        gsap.fromTo(background.current,{x:2,scale:1.006,svgOrigin:'768 512'},{x:-3,scale:1.006,duration:6.5,repeat:-1,yoyo:true,ease:'sine.inOut'});
        gsap.fromTo('.journey-road-light',{x:70,opacity:0},{x:-105,opacity:.25,duration:2.4,repeat:-1,stagger:.55,ease:'none'});
    },root);
    return()=>{speedCue.current?.kill(); speedCue.current = null; wheelMotion.current = []; ctx.revert();};
  },[layered,carriage]);

  const action = carriage ? 'להאיץ את הכרכרה' : 'להוריד את רומיאו לבמה';
  function replayMoment() {
    if (!ready || !moving) return;
    onInteract();
    if (!carriage) {setRun(n => n + 1); return;}
    speedCue.current?.kill();
    speedCue.current = gsap.timeline()
      .to(wheelMotion.current, {timeScale:2.7, duration:.3, ease:'power2.out'})
      .to(wheelMotion.current, {timeScale:1, duration:1.55, ease:'sine.inOut'}, .68);
  }
  const source=(mask:string)=><image href={image} width="1536" height="1024" mask={`url(#${prefix}-${mask})`}/>;

  return <section ref={root} className={`stage premium-stage journey-stage journey-scene-${scene} ${layered?'journey-layered':''} ${moving?'motion-on':'motion-off'}`} aria-label={`הבמה. ${beat.title}`} data-scene={scene} data-run={run} data-layered={layered?(carriage?'original-pixels':'romeo-fly-in'):'source-still'}>
    <div className="ambient-backdrop" aria-hidden="true"><img src={image} alt=""/></div>
    <div className="stage-picture journey-picture">
      <img className="journey-preview" src={thumbnail(scene)} alt="" aria-hidden="true"/>
      <img className={`scene-art journey-original ${layered&&carriage?'journey-original-covered':''}`} src={image} alt={carriage?beat.title:'רומיאו עומד על נדנדה תלויה מול שלט מואר עם השם ROMEO. ג׳ולייט מביטה בו מהבמה.'} fetchPriority="high" decoding="async" draggable={false} onLoad={()=>{setOriginalReady(true);onReady();}} onError={e=>{setFailed(true);e.currentTarget.style.visibility='hidden';onReady();}}/>
      <img className="journey-preload" src={plate} alt="" onLoad={()=>setPlateReady(true)} onError={()=>setFailed(true)}/>
      {layered&&carriage&&<svg className="journey-canvas" viewBox="0 0 1536 1024" aria-hidden="true">
        <defs>
          <mask id={`${prefix}-base`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><rect width="1536" height="1024" fill="white"/><Paint matte={carriageMatte.removal} fill="black"/><path d={carriageMatte.reins} stroke="black" strokeWidth="15" fill="none" strokeLinecap="round"/></mask>
          <mask id={`${prefix}-figure`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><Paint matte={carriageMatte.body}/><path d={carriageMatte.reins} stroke="white" strokeWidth="10" fill="none" strokeLinecap="round"/>{carriageMatte.wheels.map((w,i)=><ellipse key={i} cx={w.cx} cy={w.cy} rx={w.rx} ry={w.ry} fill="black"/>)}</mask>
          {carriageMatte.wheels.map((w,i)=><g key={i}>
            <clipPath id={`${prefix}-round-${i}`} clipPathUnits="userSpaceOnUse"><circle cx="0" cy="0" r="1"/></clipPath>
            <mask id={`${prefix}-paint-${i}`} maskUnits="userSpaceOnUse" x="-2" y="-2" width="4" height="4"><g transform={`scale(${1/w.rx} ${1/w.ry}) translate(${-w.cx} ${-w.cy})`}><path d={w.paintPath} fill="white"/></g></mask>
          </g>)}
        </defs>
        <g ref={background}><image href={plate} width="1536" height="1024"/>{source('base')}</g>
        <g ref={coach}>
          {source('figure')}
          {carriageMatte.wheels.map((w,i)=><g key={i} transform={`translate(${w.cx} ${w.cy}) scale(${w.rx} ${w.ry})`}><g ref={el=>{wheels.current[i]=el;}} clipPath={`url(#${prefix}-round-${i})`}><image href={image} preserveAspectRatio="none" x={-w.cx/w.rx} y={-w.cy/w.ry} width={1536/w.rx} height={1024/w.ry} mask={`url(#${prefix}-paint-${i})`}/></g></g>)}
        </g>
        <g stroke="#FFC84B" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5">{[0,1,2].map(i=><path key={i} className="journey-road-light" d={`M${15+i*85} ${918+i*23}q46-8 96 0`} opacity="0"/>)}</g>
      </svg>}
      {layered&&!carriage&&<RomeoDescent image={image} plate={plate} run={run}/>}
      {hotspots.filter(p=>p.characterId in characterInfo).map(p=><button key={p.characterId} className="character-hotspot journey-character-hotspot" style={{left:`${p.x*100}%`,top:`${p.y*100}%`,width:`${p.radius*140}%`,height:`${p.radius*140}%`} as CSSProperties} aria-label={`מי זה? ${characterInfo[p.characterId as CharacterId].name}`} onClick={()=>onIdentity(p.characterId as CharacterId)}><span>{characterInfo[p.characterId as CharacterId].name}</span></button>)}
      {layered && <StageCue x={carriage ? 63.6 : 75} y={carriage ? 78.8 : 77} label={action} icon={carriage ? 'replay' : 'spark'} onActivate={replayMoment}/>}
      {moving&&!ready&&<span className="journey-loading">{failed?'אפשר להמשיך לקרוא.':'מכינים את רגע הבמה…'}</span>}
    </div>
    <div className="premium-stage-footer journey-stage-footer"><p>{moving?hint:'רגע שקט בסיפור.'}</p><button aria-label={action} onClick={replayMoment} disabled={!ready||!moving}><Icon name="replay" size={17}/><span>{action}</span></button></div>
  </section>;
}
