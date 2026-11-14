import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { asset, illustration, chapters, characterInfo, locationForScene, type ChapterId, type CharacterId } from '../content/scenes';
import { musicById, musicCues } from '../content/music-cues';
import { Icon } from '../components/Icons';
import { Stage } from '../components/Stage';
import { OfflineBook } from '../components/OfflineBook';
import { Modal } from '../components/Modal';
import { MusicPanel } from '../components/MusicPanel';
import { BackgroundMusic, type BackgroundTrack } from '../components/BackgroundMusic';
import { ContentsPanel } from '../components/ContentsPanel';
import { ReaderDock } from '../components/ReaderDock';
import { TheatreCurtain, CURTAIN_ART } from '../components/TheatreCurtain';
import { loadPreferences, parseSceneHash, savePreferences, swipeDirection, type Mode, type Preferences } from '../utils/progress';
import { useNetworkOnline } from '../utils/network';

const PremiumStage = lazy(() => import('../components/PremiumStage').then(module => ({default:module.PremiumStage})));
const JourneyStage = lazy(() => import('../components/JourneyStage').then(module => ({default:module.JourneyStage})));

type Overlay = 'contents' | 'settings' | 'music' | 'identity' | 'intermission' | 'finish' | null;
const initial = loadPreferences();
const initialLink = parseSceneHash(location.hash);

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>({...initial, ...(initialLink ? {...initialLink, hasProgress: true} : {})});
  const [cover, setCover] = useState(!initialLink);
  const [curtain, setCurtain] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [cue, setCue] = useState('larger-than-life');
  const [identity, setIdentity] = useState<CharacterId>('shakespeare');
  const [reading, setReading] = useState(false);
  const [replay, setReplay] = useState(0);
  const [backgroundTrack, setBackgroundTrack] = useState<BackgroundTrack | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [systemReduced, setSystemReduced] = useState(matchMedia('(prefers-reduced-motion: reduce)').matches);
  const online = useNetworkOnline();
  const scroll = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const gesture = useRef<{x: number; y: number; t: number} | null>(null);
  const edgeTap = useRef<{x: number; y: number; t: number; direction: 'next' | 'back'} | null>(null);
  const musicOrigin = useRef<HTMLElement | null>(null);
  const chapter = chapters.find(c => c.id === preferences.chapter)!;
  const chapterIndex = chapters.indexOf(chapter);
  const beat = chapter.beats[preferences.beat];
  const moving = preferences.motion && !systemReduced && preferences.mode !== 'quiet' && !hidden;
  const sceneMusic = chapter.music.filter(id => musicById[id].sourceScene === beat.sourceScene);
  const showcase = !cover;
  const StageComponent = [3, 14, 46].includes(beat.sourceScene) ? PremiumStage : [10,24].includes(beat.sourceScene) ? JourneyStage : Stage;
  const currentCue = musicCues.find(c => c.sourceScene === beat.sourceScene)?.id || chapter.music[0] || musicCues[0].id;
  const dense = beat.paragraphs.length >= 8 || beat.paragraphs.join(' ').split(/\s+/).length >= 43;

  function update(value: Partial<Preferences>) { setPreferences(p => ({...p, ...value})); }
  useEffect(() => savePreferences(preferences), [preferences]);
  useEffect(() => {
    if (!cover) return;
    const timer = setTimeout(() => {
      for (const url of new Set([asset(CURTAIN_ART), illustration(1), illustration(beat.sourceScene)])) {const warm = new Image(); warm.src = url;}
    }, 160);
    return () => clearTimeout(timer);
  }, [cover, beat.sourceScene]);
  useEffect(() => {const change = () => {setHidden(document.hidden); savePreferences(preferences);}; document.addEventListener('visibilitychange', change); return () => document.removeEventListener('visibilitychange', change);}, [preferences]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setSystemReduced(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    const onHash = () => {
      if (location.hash === '#story-text') {
        scroll.current?.focus({preventScroll: true});
        const layout = document.querySelector<HTMLElement>('.reader-layout');
        if (layout) history.replaceState(null, '', `#/${layout.dataset.chapter}/${Number(layout.dataset.beat) + 1}`);
        return;
      }
      setCurtain(false); setSceneReady(false); setPlayerOpen(false);
      const p = parseSceneHash(location.hash);
      if (p) {update({...p, hasProgress: true}); setCover(false); setOverlay(null);} else setCover(true);
    };
    addEventListener('hashchange', onHash); return () => removeEventListener('hashchange', onHash);
  }, []);
  useLayoutEffect(() => {
    if (!cover) history.replaceState(null, '', `#/${chapter.id}/${preferences.beat + 1}`);
    scroll.current?.scrollTo(0, 0); window.scrollTo({top:0,behavior:"instant"}); setReading(false);
  }, [chapter.id, preferences.beat, cover, curtain]);
  useEffect(() => {
    if (overlay || cover || curtain) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,select,textarea,[contenteditable=true]')) return;
      if (e.key === 'ArrowLeft') {e.preventDefault(); advance();}
      if (e.key === 'ArrowRight') {e.preventDefault(); back();}
    };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  });

  function go(id: ChapterId, index = 0) { if (curtain) return; setPlayerOpen(false); setSceneReady(false); update({chapter: id, beat: index, hasProgress: true}); setCover(false); setOverlay(null); }
  function start(resume: boolean) {
    if (curtain) return;
    setSceneReady(false);
    if (!resume) go('opening'); else {setCover(false); update({hasProgress: true});}
    if (moving) setCurtain(true);
  }
  function advance() {
    if (curtain) return;
    setPlayerOpen(false);
    if (beat.sourceScene === 24) {setOverlay('intermission'); return;}
    if (preferences.beat < chapter.beats.length - 1) update({beat: preferences.beat + 1, hasProgress: true});
    else if (chapterIndex < chapters.length - 1) go(chapters[chapterIndex + 1].id);
    else setOverlay('finish');
  }
  function back() {
    if (curtain) return;
    setPlayerOpen(false);
    if (preferences.beat > 0) update({beat: preferences.beat - 1});
    else if (chapterIndex > 0) { const previous = chapters[chapterIndex - 1]; go(previous.id, previous.beats.length - 1); }
    else {setCover(true); history.replaceState(null, '', '#/cover');}
  }
  function openMusic(id: string) { savePreferences(preferences); setCue(id); playInStory(id, preferences.service); }
  function openLibrary(id: string) { savePreferences(preferences); setCue(id); setOverlay('music'); }
  function openIdentity(id: CharacterId) {setIdentity(id); setOverlay('identity');}
  function playInStory(id: string, service: BackgroundTrack['service']) {
    musicOrigin.current = document.activeElement as HTMLElement | null;
    setBackgroundTrack({id, service});
    setPlayerOpen(true);
    setOverlay(null);
  }
  function closeMusic() {
    setBackgroundTrack(null);
    setPlayerOpen(false);
    requestAnimationFrame(() => {
      const origin = musicOrigin.current;
      const target = origin?.isConnected ? origin : document.querySelector<HTMLElement>('.live-cue, .reader-position');
      target?.focus({preventScroll:true});
    });
  }
  const atLast = chapterIndex === chapters.length - 1 && preferences.beat === chapter.beats.length - 1;
  const nextLabel = beat.sourceScene === 24 ? 'הפסקה קצרה' : atLast ? 'סיום' : 'ממשיכים';

  return <div className={`app prototype-app cinematic-reader ${showcase ? 'premium-showcase live-musical' : ''} mode-${preferences.mode} ${moving ? '' : 'reduced-motion'}`} onClickCapture={e => {
    // Safari does not focus a tapped button by default. Retain a concrete
    // focus-return target before native dialogs open, including on iPad.
    (e.target as Element).closest<HTMLElement>('button:not(:disabled),a[href]')?.focus({preventScroll: true});
  }}>
    {!cover && <a className="skip-link" href="#story-text" tabIndex={curtain ? -1 : 0} onClick={e => {e.preventDefault(); if (!curtain) {scroll.current?.focus({preventScroll: true}); scroll.current?.scrollIntoView({block: 'nearest', behavior: 'auto'});}}}>לסיפור</a>}
    {cover ? <main className="cover-screen" data-testid="cover">
      <div className="cover-art"><img src={asset('cover/front.webp')} alt="ג'ולייט על במה מוארת, בלב ורוד וזהב" fetchPriority="high"/><div className="cover-light one"/><div className="cover-light two"/></div>
      <div className="cover-copy"><span className="eyebrow cover-kicker">הרפתקה מוזיקלית, במיוחד בשבילך</span><img className="cover-logo" src={asset('cover/logo.webp')} alt="& Juliet"/>
        <h1>רון,<br/>הבמה שלך.</h1><p>סיפור של אהבה, אומץ<br/>והתחלות חדשות.</p>
        {preferences.hasProgress ? <><button className="button primary start-button" onClick={() => start(true)} data-testid="continue-story" aria-label="נמשיך מאיפה שעצרנו">נמשיך בסיפור<Icon name="left"/></button><button className="text-button continue-button" onClick={() => start(false)} data-testid="start-story">נפתח מהתחלה<Icon name="replay" size={18}/></button></> : <button className="button primary start-button" onClick={() => start(false)} data-testid="start-story">נפתח את המסך<Icon name="left"/></button>}
        <span className="cover-footnote">{preferences.hasProgress ? `כאן עצרנו · ${chapter.subtitle}` : 'סיפור שלם בשתי מערכות. הבמה כולה שלך.'}</span>
      </div><div className="cover-drape drape-right"/><div className="cover-drape drape-left"/>
      <button className="cover-settings icon-button" aria-label="הגדרות להורים" onClick={() => setOverlay('settings')}><Icon name="settings"/></button>
    </main> : <>
      <header className="reader-header" inert={curtain}>
        <button className="brand-button" aria-label="חזרה למסך הפתיחה" onClick={() => {setPlayerOpen(false); setCover(true); history.replaceState(null, '', '#/cover');}}><img src={asset('cover/logo.webp')} alt="& Juliet"/></button>
        <div className="header-title"><span>מערכה {chapter.act === 1 ? 'ראשונה' : 'שנייה'}</span><span className="header-divider"/><b>{chapter.subtitle}</b></div>
        <div className="header-controls"><button className="icon-button" aria-label="בחירת פרק" onClick={() => setOverlay('contents')}><Icon name="contents"/></button><button className="icon-button" aria-label="כל השירים" onClick={() => openLibrary(currentCue)}><Icon name="music"/></button><button className="icon-button" aria-label="הגדרות להורים" onClick={() => setOverlay('settings')}><Icon name="settings"/></button></div>
      </header>

      <main className="reader-layout" inert={curtain} aria-busy={curtain} data-chapter={chapter.id} data-beat={preferences.beat} data-source-scene={beat.sourceScene} data-family={chapter.family} data-density={dense ? "dense" : "regular"} onPointerDown={e => {
        edgeTap.current = null;
        if (overlay || !matchMedia('(orientation: landscape)').matches || (e.target as HTMLElement).closest('button,a,.story-copy,iframe,[data-premium-gesture]')) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        if (e.clientX < bounds.left + 20 || e.clientX > bounds.right - 20) edgeTap.current = {x: e.clientX, y: e.clientY, t: performance.now(), direction: e.clientX < bounds.left + 20 ? 'next' : 'back'};
      }} onPointerUp={e => {
        const start = edgeTap.current; edgeTap.current = null;
        if (start && !overlay && performance.now() - start.t < 600 && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10) {
          if (start.direction === 'next') advance(); else back();
        }
      }} onPointerCancel={() => {edgeTap.current = null;}} onTouchStart={e => {
        if (overlay || e.touches.length !== 1 || (e.target as HTMLElement).closest('button,a,.reading-panel,iframe,[data-premium-gesture]')) {gesture.current = null; return;}
        const p = e.touches[0]; gesture.current = {x: p.clientX, y: p.clientY, t: performance.now()};
      }} onTouchCancel={() => {gesture.current = null;}} onTouchEnd={e => {
        const start = gesture.current; gesture.current = null;
        if (!start || overlay || (e.touches?.length || 0) > 0) return;
        const p = e.changedTouches[0]; const result = swipeDirection(p.clientX - start.x, p.clientY - start.y, performance.now() - start.t);
        if (result === 'next') advance(); else if (result === 'back') back();
      }}>
        {moving && !curtain && !overlay && <div key={beat.sourceScene} className="scene-light-crossing" aria-hidden="true"/>}
        <Suspense fallback={<Stage key={beat.sourceScene} chapter={chapter} beatIndex={preferences.beat} motion={moving && !overlay && !curtain} mode={preferences.mode} reading={reading} replay={replay} onIdentity={openIdentity} onInteract={() => setReading(false)} onReady={() => setSceneReady(true)}/>}>
        <StageComponent key={beat.sourceScene} chapter={chapter} beatIndex={preferences.beat} motion={moving && !overlay && !curtain} mode={preferences.mode} reading={reading} replay={replay} onIdentity={openIdentity} onInteract={() => setReading(false)} onReady={() => setSceneReady(true)}/>
        </Suspense>
        <section className={`reading-panel ${dense ? 'dense-story' : ''}`} onPointerDown={() => setReading(true)}>
          <div className="reading-heading"><span className="eyebrow">{chapter.subtitle}</span><h1 ref={heading} tabIndex={-1}>{beat.title}</h1><span className="literary-rule"/></div>
          <div className="story-copy" ref={scroll} id="story-text" tabIndex={0} onFocus={() => setReading(true)} aria-label="טקסט הסיפור">
            {beat.paragraphs.map((paragraph, i) => <p key={`${beat.sourceScene}-${i}`}>{paragraph}</p>)}
          </div>
        </section>
      </main>
      {sceneMusic.length > 0 && <div className="live-floor" inert={curtain}>
        {sceneMusic.map(id => <button key={id} className="live-cue" onClick={() => openMusic(id)}
          aria-label={`${online ? 'להאזנה' : 'האזנה בלי רשת'}: ${musicById[id].displayTitle}`}>
          <span className="live-cue-play"><Icon name={online ? 'play' : 'music'} size={19}/></span>
          <span className="live-cue-copy" dir="ltr"><b>{musicById[id].displayTitle}</b>
            {online ? <small>Original Broadway Cast Recording</small> : <small dir="rtl">האזנה בלי רשת</small>}
          </span>
        </button>)}
        <div className="live-floor-track"/>
      </div>}
      <ReaderDock beat={beat} nextLabel={nextLabel} locked={curtain} onBack={back} onNext={advance} onContents={() => setOverlay('contents')}/>
    </>}
    {curtain && <TheatreCurtain ready={sceneReady} animate={moving} title={chapter.act === 1 ? 'המסך עולה' : 'המערכה השנייה'} onComplete={() => setCurtain(false)}/>}
    <span className="sr-only" aria-live="polite" aria-atomic="true">{!cover && !curtain ? beat.title : ''}</span>
    {overlay === 'contents' && <ContentsPanel current={chapter.id} beatIndex={preferences.beat} onGo={go} onClose={() => setOverlay(null)} onReplay={() => {setReading(false); setReplay(n => n + 1); setOverlay(null);}}/>}
    {overlay === 'intermission' && <Modal title="הפסקה קצרה" onClose={() => setOverlay(null)} className="intermission-modal"><div className="intermission-curtains" aria-hidden="true"/><span className="eyebrow">סוף המערכה הראשונה</span><p>המסך יורד לרגע.<br/>כשתהיו מוכנים, המערכה השנייה מחכה.</p><button className="button primary" onClick={() => {const next = locationForScene(25)!; go(next.chapter, next.beat); if (moving) setCurtain(true);}} data-testid="start-act-two">נפתח שוב את המסך<Icon name="left"/></button></Modal>}
    {overlay === 'finish' && <Modal title="הבמה שלך, רון!" onClose={() => setOverlay(null)} className="finish-modal"><img src={asset('cover/logo.webp')} alt="& Juliet"/><p>הסיפור הזה נגמר.<br/>הסיפור שלך רק מתחיל!</p><button className="button primary" onClick={() => {setReading(false); setReplay(n => n + 1); setOverlay(null);}}>עוד חגיגה על הבמה<Icon name="spark"/></button><button className="text-button" onClick={() => go('opening')}><Icon name="replay" size={18}/>נחזור להתחלה</button><button className="text-button" onClick={() => openLibrary(currentCue)}><Icon name="music" size={18}/>לכל שירי הסיפור</button></Modal>}
    {overlay === 'settings' && <Modal title="איך נעלה לבמה?" onClose={() => setOverlay(null)} className="settings-modal"><p className="muted small">ההעדפות נשמרות במכשיר הזה.</p><fieldset><legend>הקצב שלנו</legend><div className="mode-choices">{([['read', 'קוראים', 'הסיפור במרכז'], ['explore', 'מגלים', 'תאורה ותנועה עדינה'], ['quiet', 'שקט', 'בלי תנועה ואפקטים']] as [Mode, string, string][]).map(([value, name, description]) => <button key={value} aria-pressed={preferences.mode === value} onClick={() => update({mode: value})}><b>{name}</b><span>{description}</span></button>)}</div></fieldset><div className="setting-row"><div><b>הנפשות בכל הספר</b><p className="small muted">{moving ? "פועלות ברצף בכל סצנה. אפשר להפסיק כאן." : "ההנפשות כבויות. אפשר לקרוא עם במה שקטה."}</p></div><button className="switch" aria-label="הנפשות בכל הספר" role="switch" aria-checked={moving} disabled={systemReduced || preferences.mode === 'quiet'} onClick={() => update({motion: !preferences.motion})}><i/></button></div>{systemReduced && <p className="small muted">הפחתת התנועה של המכשיר פעילה.</p>}<fieldset><legend>איפה נקשיב?</legend><div className="segmented"><button dir="ltr" aria-pressed={preferences.service === 'apple'} onClick={() => update({service: 'apple'})}>Apple Music</button><button dir="ltr" aria-pressed={preferences.service === 'spotify'} onClick={() => update({service: 'spotify'})}>Spotify</button></div></fieldset><OfflineBook/><p className="settings-note">ספר משפחתי לרון, בהשראת המחזמר. אין פרסומות, חשבון משתמש או איסוף מידע. המוזיקה נפתחת בשירות שתבחרו.</p></Modal>}
    {overlay === 'identity' && <Modal title={characterInfo[identity].name} onClose={() => setOverlay(null)} className="identity-modal"><img className="identity-portrait" src={asset(identity === 'francois' ? 'performance/francois-portrait.webp' : `characters/${characterInfo[identity].image}.webp`)} alt={characterInfo[identity].name}/><p>{characterInfo[identity].description}</p><button className="button primary" onClick={() => setOverlay(null)}>נחזור לסיפור<Icon name="left"/></button></Modal>}
    {overlay === 'music' && <MusicPanel cueId={cue} service={preferences.service} online={online} onService={service => update({service})} favorites={preferences.favorites} onFavorite={id => update({favorites: preferences.favorites.includes(id) ? preferences.favorites.filter(x => x !== id) : [...preferences.favorites, id]})} onClose={() => setOverlay(null)} onPlayHere={playInStory}/>}
    {backgroundTrack && <BackgroundMusic track={backgroundTrack} open={playerOpen} online={online} interactionLocked={curtain}
      onToggle={() => setPlayerOpen(value => !value)} onClose={closeMusic}
      onService={service => {setBackgroundTrack({...backgroundTrack, service}); update({service});}}/>}
  </div>;
}
