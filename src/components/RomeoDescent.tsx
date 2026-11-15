import {useId,useLayoutEffect,useRef} from 'react';
import gsap from 'gsap';

// The clean and landed frames share this coordinate system. The actor, lit
// letters and platform are cut out together to keep the ride rigid.
const marqueeOutline = [
  // The oversize R, with its inner counter cut clear.
  'M366 271Q380 235 424 240L451 250Q451 240 433 232L432 227Q450 217 449 208Q408 206 418 177Q422 159 451 153L455 126Q428 141 410 120Q396 104 408 84Q425 52 459 59Q477 64 488 78Q502 72 520 64Q561 49 585 69Q607 85 600 115Q594 163 524 197L558 202Q553 253 586 276Q600 288 621 287Q617 264 640 259Q665 255 675 281L674 305Q643 337 597 329Q548 327 524 277Q511 250 507 221Q500 236 502 278Q502 293 518 290L525 285Q521 314 483 321L470 336Q458 330 444 335Q413 343 393 333Q361 320 364 286Z M508 112Q522 89 540 90Q551 91 549 107L539 129Q551 140 541 147L507 176Z',
  // The scroll above the smaller letters and the long lower flourish.
  'M603 84Q607 59 637 53L675 46Q680 38 683 47L689 51Q693 42 698 47L700 55Q725 47 775 54L844 58Q929 58 972 82Q979 88 969 88L856 77Q727 67 662 95Q616 117 610 108Q603 103 603 84Z M734 231Q800 201 872 203Q943 200 988 218Q993 227 977 230L933 230Q888 221 849 234Q795 253 756 250Z',
  // Uppercase O M E O and the open counters.
  'M579 170Q588 140 609 125Q640 105 665 120Q694 139 691 179L683 213Q660 251 623 239Q586 229 579 193L573 181Z M628 147Q644 141 648 154L651 176Q644 184 648 194L647 214Q637 230 623 217L621 190Q631 181 623 170Z',
  'M691 108L726 102L744 142L766 97L805 95L805 110L800 110L799 147L805 153L798 160L800 185L806 188L806 201L762 212L761 191L768 188L768 152L748 208L729 214L711 162L712 187L720 196L721 213L690 217L690 205L696 197L696 159L691 154L696 149L694 122L692 123Z',
  'M809 95L880 92L882 123L865 123L861 111L846 112L845 137L860 131L866 131L866 159L850 159L847 150L846 179L857 176L864 162L883 162L885 193L807 201L807 186L814 182L814 158L808 154L813 146L813 114L808 110Z',
  'M882 142Q890 123 900 111Q921 88 951 92Q974 95 986 127L990 143L982 158Q973 198 943 201Q908 207 893 176Q885 158 881 151Z M919 134L923 146L919 156Q920 180 933 185Q947 184 950 162L946 147L949 137Q948 110 934 110Q920 108 919 134Z',
  // Romeo's full silhouette. His hands and head overlap the lettering.
  'M561 225L581 214L577 205Q577 197 586 202L602 222L622 224L637 232L657 231L669 222L654 212L652 201L645 196L651 188L658 183L662 171L678 166L691 162L707 168L714 179L718 181L719 196L711 206L716 217L729 216L734 224L745 228L758 236L764 250L790 266L812 271L820 269L826 260L832 262L828 273L848 280L848 290L838 294L814 288L786 288L760 273L767 303L783 344L777 349L776 378L768 374L758 363L752 358L752 383L745 400L751 424L751 432L779 445L789 451L790 464L780 470L731 473L725 457L729 440L724 429L722 415L730 389L727 350L712 366L701 387L683 401L672 416L660 424L657 434L647 437L643 461L632 469L608 471L608 461L619 447L623 434L628 422L631 401L650 385L659 361L678 339L666 323L649 341L644 345L637 332L627 308L630 299L653 285L669 271L675 257L653 264L630 258L615 250L603 257L596 244L587 246L579 242L581 236L564 241L559 236L577 230L562 231Z',
  // The handrail is narrow, so the background stays visible between the posts.
  'M510 416Q507 408 515 407Q524 406 523 417L868 417Q866 407 876 407Q884 408 882 417L880 423L879 463L888 467L916 469L916 478L909 479Q905 493 891 496L883 507L877 501L874 496L721 496L695 514L683 506L680 500L520 497L508 507L502 500L487 495L478 483L477 479L475 477L476 470L506 468L511 463L513 423Z M520 423L521 461L868 461L871 423Z',
];
const cablePoints = [[515,415],[876,415]];

export function RomeoDescent({image,plate,run}:{image:string;plate:string;run:number}) {
  const prefix = 'romeo-' + useId().replaceAll(':','');
  const scene = useRef<SVGSVGElement>(null);
  const rig = useRef<SVGGElement>(null);
  const beam = useRef<SVGPathElement>(null);
  const footlight = useRef<SVGEllipseElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({repeat:-1,repeatDelay:6})
        .set(rig.current,{y:-535},0)
        .fromTo(scene.current,{opacity:0},{opacity:1,duration:.22,ease:'sine.inOut'},0)
        .fromTo(beam.current,{opacity:.03},{opacity:.49,duration:1.1,ease:'sine.out'},.13)
        .to(rig.current,{y:0,duration:1.88,ease:'sine.inOut'},.31)
        .fromTo(footlight.current,{opacity:0},{opacity:.52,duration:.36,ease:'sine.out'},1.9)
        .to(footlight.current,{opacity:0,duration:.95,ease:'sine.inOut'},2.34)
        .to(beam.current,{opacity:.05,duration:1.04,ease:'sine.inOut'},2.38)
        .to(scene.current,{opacity:0,duration:.37,ease:'sine.inOut'},3.42);
    }, scene);
    return () => ctx.revert();
  }, [run]);

  return <svg ref={scene} className="journey-canvas" viewBox="0 0 1086 724"
    aria-hidden="true" opacity="0" data-romeo-descent>
    <defs>
      <clipPath id={`${prefix}-outline`}>{marqueeOutline.map(d => <path key={d} d={d} clipRule="evenodd"/>)}</clipPath>
      <linearGradient id={`${prefix}-beam`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#cfefff" stopOpacity=".56"/>
        <stop offset=".65" stopColor="#9e6dff" stopOpacity=".17"/>
        <stop offset="1" stopColor="#31254d" stopOpacity="0"/>
      </linearGradient>
      <radialGradient id={`${prefix}-footlight`}>
        <stop stopColor="#ffe1a4" stopOpacity=".69"/>
        <stop offset="1" stopColor="#ffc66d" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <image href={plate} width="1086" height="724"/>
    <path ref={beam} d="M605 0H704L980 650H378Z" fill={`url(#${prefix}-beam)`} opacity="0"/>
    <ellipse ref={footlight} cx="688" cy="550" rx="256" ry="44" fill={`url(#${prefix}-footlight)`} opacity="0"/>
    <g ref={rig} data-romeo-rig>
      {cablePoints.map(([x,y]) => <g key={x} opacity=".62">
        <path d={`M${x} -50V${y}`} fill="none" stroke="#161a34" strokeWidth="3.2"/>
        <path d={`M${x-.35} -50V${y}`} fill="none" stroke="#d7dcf6" strokeWidth="1.2"/>
      </g>)}
      <image href={image} width="1086" height="724" clipPath={`url(#${prefix}-outline)`}/>
    </g>
  </svg>;
}
