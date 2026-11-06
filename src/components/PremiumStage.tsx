import {useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type PointerEvent} from 'react';
import gsap from 'gsap';
import {asset,illustration,thumbnail,characterInfo,type Chapter,type CharacterId} from '../content/scenes';
import geometry from '../content/stage-geometry.json';
import {premiumMasks,type PremiumMask} from '../motion/premium-masks';
import {openingMask,openingPieces} from '../motion/premium-opening';
import {Icon} from './Icons';
import type {Mode} from '../utils/progress';
import '../styles/premium-stage.css';

const scenes = {
  3:{action:'ניגע בנוצה וננסה סוף אחר',hint:'אן מציעה סוף אחר, והנוצה כבר מתחילה לכתוב.',done:'אולי באמת אפשר לכתוב סוף אחר?',anchor:[.12,.15]},
  14:{action:'ננדנד את הנברשת',hint:'הנברשת מתנדנדת לבד. אפשר גם לגרור בעדינות.',done:'ג׳ולייט מתנדנדת מעל הנשף!',anchor:[.49,.67]},
  46:{action:'נדליק את הבמה של ג׳ולייט',hint:'האורות עולים, וג׳ולייט תופסת את הבמה.',done:'הבמה כולה של ג׳ולייט!',anchor:[.5,.5]},
} as const;
type PremiumScene = keyof typeof scenes;
type Piece = {solidPaths:readonly string[];strokes:readonly {d:string;width:number}[]};
function Matte({mask,fill='white'}:{mask:PremiumMask;fill?:string}){
  return <><g fill={fill} stroke="none">{mask.solidPaths.map((d,i)=><path key={i} d={d}/>)}</g><g stroke={fill} fill="none" strokeLinecap="round" strokeLinejoin="round">{mask.strokes.map((s,i)=><path key={i} d={s.d} strokeWidth={s.width}/>)}</g><g fill={fill==='white'?'black':'white'}>{mask.holes.map((d,i)=><path key={i} d={d}/>)}</g></>;
}

/** A layered paper-theatre rig. Every visible actor samples the original WebP.
 * Clean plates are only revealed at the small vacated edges of moving pieces. */
export function PremiumStage({chapter,beatIndex,motion,mode,reading,replay,onIdentity,onInteract,onReady}:{
  chapter:Chapter;beatIndex:number;motion:boolean;mode:Mode;reading:boolean;replay:number;
  onIdentity:(id:CharacterId)=>void;onInteract:()=>void;onReady:()=>void;
}){
  const scene=chapter.beats[beatIndex].sourceScene as PremiumScene;
  const beat=chapter.beats[beatIndex], info=scenes[scene];
  const prefix='premium-'+useId().replaceAll(':','');
  const root=useRef<HTMLElement>(null), rig=useRef<SVGGElement>(null),quill=useRef<SVGGElement>(null),finger=useRef<SVGGElement>(null),head=useRef<SVGGElement>(null),paper=useRef<SVGGElement>(null);
  const sequence=useRef<gsap.core.Timeline|null>(null);
  const drag=useRef<{x:number;rotation:number;moved:boolean}|null>(null);
  const [originalReady,setOriginalReady]=useState(false),[plateReady,setPlateReady]=useState(false),[failed,setFailed]=useState(false);
  const [run,setRun]=useState(0),[message,setMessage]=useState('');
  const lastReplay=useRef(replay);
  const moving=motion&&mode!=='quiet';
  const ready=originalReady&&plateReady;
  const mask=scene===3?openingMask:premiumMasks[scene];
  const removalMask: PremiumMask = mask.removalPaths ? {...mask,solidPaths:mask.removalPaths,holes:mask.removalHoles??mask.holes,strokes:[]} : mask;
  const image=illustration(scene), plate=asset(`premium/scene-${String(scene).padStart(2,'0')}-clean.webp`);
  const hotspots=(geometry.scenes as Record<string,{hotspots:{characterId:string;x:number;y:number;radius:number}[]}>)[String(scene).padStart(2,'0')].hotspots;
  const confetti=useMemo(()=>Array.from({length:46},(_,i)=>({x:3+(i*37.7)%94,y:-12-(i*7)%23,r:(i*47)%360,color:['#FFC84B','#EF168F','#29C5F6','#FFF2DD'][i%4]})),[]);
  const origin=`${mask.origin[0]} ${mask.origin[1]}`;

  useEffect(()=>{if(scene<48){const next=new Image();next.src=illustration(scene+1);}return()=>{sequence.current?.kill();};},[scene]);
  useEffect(()=>{if(lastReplay.current!==replay){lastReplay.current=replay;activate();}},[replay]);
  useEffect(()=>{
    if(moving)return;
    sequence.current?.kill(); sequence.current=null;
    gsap.set([rig.current,quill.current,finger.current,head.current].filter(Boolean),{clearProps:'transform'});
    if(paper.current)gsap.set(paper.current,{opacity:0});
    root.current?.querySelectorAll('.premium-confetti').forEach(el=>gsap.set(el,{opacity:0}));
  },[moving]);

  useLayoutEffect(()=>{
    if(!ready||scene===46||!moving)return;
    sequence.current?.kill();
    const tl=gsap.timeline({repeat:-1,repeatDelay:scene===14?.45:1.8});sequence.current=tl;
    if(scene===3){
      tl.to(quill.current,{rotation:-7,svgOrigin:'343 333',duration:.27,ease:'sine.inOut'})
        .to(quill.current,{rotation:4,duration:.19,repeat:3,yoyo:true,ease:'sine.inOut'})
        .to(finger.current,{rotation:-5,svgOrigin:'782 344',duration:.46,ease:'power2.out'},.4)
        .to(head.current,{rotation:2,x:-3,svgOrigin:'431 274',duration:.45,ease:'sine.out'},.68)
        .fromTo(paper.current,{opacity:0,rotation:-9,x:0,y:35,scale:.82},{opacity:1,rotation:4,y:0,scale:.8,duration:.4,svgOrigin:'300 630',ease:'power2.out'},.9)
        .to(paper.current,{scaleX:-.75,x:55,opacity:0,duration:.9,ease:'power2.inOut'},1.9)
        .to([quill.current,finger.current,head.current],{rotation:0,x:0,duration:.7,ease:'sine.inOut'},2.35);
    }else{
      const start=Number(gsap.getProperty(rig.current,'rotation'))||0;
      const amplitude=Math.min(1.1,Math.max(.68,Math.abs(start)));
      tl.to(rig.current,{rotation:start>0?-amplitude:amplitude,svgOrigin:origin,duration:.92,ease:'sine.inOut'})
        .to(rig.current,{rotation:start>0?amplitude*.65:-amplitude*.65,duration:1.35,ease:'sine.inOut'})
        .to(rig.current,{rotation:start>0?-amplitude*.32:amplitude*.32,duration:1.25,ease:'sine.inOut'})
        .to(rig.current,{rotation:0,duration:1.1,ease:'sine.inOut'});
      tl.fromTo(root.current!.querySelectorAll('.premium-crystal-light'),{opacity:0},{opacity:.85,duration:.5,stagger:.1},0)
        .to(root.current!.querySelectorAll('.premium-crystal-light'),{opacity:0,duration:1.5,stagger:.07},1.8);
    }
    return()=>{tl.kill();};
  },[run,ready,moving]);

  useLayoutEffect(()=>{
    if(scene!==46||!ready||!moving)return;
    sequence.current?.kill();
    const tl=gsap.timeline({repeat:-1,repeatDelay:1.2});sequence.current=tl;
    const beams=root.current!.querySelectorAll('.premium-auto-beam');
    const pieces=root.current!.querySelectorAll('.premium-confetti');
    tl.set(beams,{opacity:0}).set(pieces,{opacity:0})
      .to(beams,{opacity:.26,duration:1.2,stagger:.65,ease:'sine.inOut'},.2)
      .to(rig.current,{y:-8,duration:2.7,ease:'power2.inOut'},.3)
      .fromTo(pieces,{opacity:0,y:0,x:0,rotation:0},{opacity:1,duration:.25,stagger:.012},2)
      .to(pieces,{y:1120,x:i=>Math.sin(i*2)*95,rotation:i=>i*23,duration:5.7,ease:'sine.in',stagger:.012},2.1)
      .to(pieces,{opacity:0,duration:.7},6.9)
      .to(beams,{opacity:0,duration:1.5,stagger:.12},7.1)
      .to(rig.current,{y:0,duration:1.7,ease:'sine.inOut'},7.1);
    return()=>{tl.kill();};
  },[ready,moving,run]);

  function activate(){
    if(!ready)return;onInteract();
    setMessage(info.done);setRun(n=>n+1);
  }

  function down(e:PointerEvent<HTMLButtonElement>){
    if(!ready||scene!==14)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);onInteract();sequence.current?.kill();
    drag.current={x:e.clientX,rotation:Number(gsap.getProperty(rig.current,'rotation'))||0,moved:false};
  }
  function move(e:PointerEvent<HTMLButtonElement>){
    if(!drag.current||scene!==14||!moving)return;
    const width=root.current!.querySelector('.stage-picture')!.getBoundingClientRect().width;
    const delta=e.clientX-drag.current.x;drag.current.moved ||=Math.abs(delta)>4;
    gsap.set(rig.current,{rotation:gsap.utils.clamp(-1.1,1.1,drag.current.rotation+delta/width*7),svgOrigin:origin});
  }
  function up(){if(!drag.current)return;drag.current=null;activate();}
  const sample=(piece:Piece,id:string)=><mask id={`${prefix}-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><g fill="white">{piece.solidPaths.map((d,i)=><path key={i} d={d}/>)}</g><g stroke="white" fill="none" strokeLinecap="round">{piece.strokes.map((s,i)=><path key={i} d={s.d} strokeWidth={s.width}/>)}</g></mask>;
  const source=(matte:string)=><image href={image} width="1536" height="1024" mask={`url(#${prefix}-${matte})`}/>;

  return <section ref={root} className={`stage premium-stage premium-scene-${scene} ${ready?'layers-ready':''} ${moving?'motion-on':'motion-off'}`} aria-label={`הבמה. ${beat.title}`} data-scene={scene} data-run={run} data-layered="original-pixels">
    <div className="ambient-backdrop" aria-hidden="true"><img src={image} alt=""/></div>
    <div className="stage-picture premium-stage-picture">
      <img className={`premium-original scene-art ${ready?'original-behind-layers':''}`} src={image} alt={beat.title} fetchPriority="high" decoding="async" draggable={false} onLoad={()=>{setOriginalReady(true);onReady();}} onError={()=>{setFailed(true);onReady();}}/>
      <img className="premium-preload" src={plate} alt="" onLoad={()=>setPlateReady(true)} onError={()=>setFailed(true)}/>
      {ready&&<svg className="premium-canvas" viewBox="0 0 1536 1024" aria-hidden="true">
        <defs>
          <mask id={`${prefix}-moving`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><Matte mask={mask}/></mask>
          <mask id={`${prefix}-base`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><rect width="1536" height="1024" fill="white"/><Matte mask={removalMask} fill="black"/></mask>
          <mask id={`${prefix}-front`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><g fill="white">{mask.fixedForegroundPaths.map((d,i)=><path key={i} d={d}/>)}</g></mask>
          {scene===3&&Object.entries(openingPieces).map(([id,piece])=><g key={id}>{sample(piece,id)}</g>)}
          <radialGradient id={`${prefix}-glow`}><stop stopColor="#FFF2DD" stopOpacity=".8"/><stop offset="1" stopColor="#FFC84B" stopOpacity="0"/></radialGradient>
          <linearGradient id={`${prefix}-beam`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FFF2DD" stopOpacity=".65"/><stop offset="1" stopColor="#FFC84B" stopOpacity="0"/></linearGradient>
        </defs>
        <image href={plate} width="1536" height="1024"/>{source('base')}
        {scene===46&&<g className="premium-followspots">{[355,768,1163].map((x,i)=><g key={x} className="premium-auto-beam" opacity="0"><path d={`M${x-12} 195 L${x+12} 195 L${x+340} 880 L${x-260} 880Z`} fill={`url(#${prefix}-beam)`}/><ellipse cx={x+30} cy="870" rx="230" ry="50" fill={`url(#${prefix}-glow)`}/></g>)}</g>}
        {scene===3?<><g ref={head}>{source('head')}</g><g ref={quill}>{source('quill')}</g><g ref={finger}>{source('finger')}</g><g ref={paper} className="premium-manuscript" opacity="0"><path d="M190 529 Q280 502 383 525 L405 737 Q303 716 205 750Z" fill="#FFF2DD" stroke="#B98E4C" strokeWidth="4"/>{[0,1,2,3].map(i=><path key={i} d={`M230 ${560+i*29} Q300 ${548+i*29} 356 ${561+i*29}`} fill="none" stroke="#8C665B" strokeWidth="3"/>)}<path d="M225 702Q291 683 368 700" stroke="#EF168F" fill="none" strokeWidth="4"/></g></>:<g ref={rig}>{source('moving')}</g>}
        {source('front')}
        {scene===14&&<g>{[[479,75],[1062,78],[475,390],[1026,498],[785,126],[995,333]].map(([x,y],i)=><circle key={i} className="premium-crystal-light" cx={x} cy={y} r="29" opacity="0" fill={`url(#${prefix}-glow)`}/>)}</g>}
        {scene===46&&<g>{confetti.map((p,i)=><rect key={i} className="premium-confetti" x={p.x*15.36} y={p.y} width={i%2?9:13} height={i%3?20:10} rx="2" fill={p.color} opacity="0" transform={`rotate(${p.r} ${p.x*15.36} ${p.y})`}/>)}</g>}
      </svg>}
      {scene===14&&<button className="premium-swing-target" aria-label="משיכת הנברשת מצד לצד" disabled={!ready} data-premium-gesture="true" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={e=>{if(e.detail===0)activate();}}/>}

      {hotspots.filter(p=>p.characterId in characterInfo).map(p=><button key={p.characterId} className="character-hotspot premium-character-hotspot" aria-label={`מי זה? ${characterInfo[p.characterId as CharacterId].name}`} style={{left:`${p.x*100}%`,top:`${p.y*100}%`,width:`${p.radius*140}%`,height:`${p.radius*140}%`}} onClick={()=>onIdentity(p.characterId as CharacterId)}><span>{characterInfo[p.characterId as CharacterId].name}</span></button>)}
      {!ready&&<span className="premium-loading">{failed?'אפשר לקרוא. שכבות הבמה מתעכבות לרגע.':'מכינים את רגע הבמה…'}</span>}
    </div>
    <div className="premium-stage-footer"><p aria-live="polite">{message||info.hint}</p><button aria-label="נפעיל שוב את רגע הבמה" disabled={!ready} onClick={activate}><Icon name="replay" size={17}/><span>שוב</span></button></div>
  </section>;
}
