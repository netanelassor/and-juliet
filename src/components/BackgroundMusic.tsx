import { useEffect, useId, useRef, useState } from 'react';
import { musicById, type MusicService } from '../content/music-cues';
import { Icon } from './Icons';
import { MusicHandoff } from './MusicHandoff';
import '../styles/premium-music.css';

export interface BackgroundTrack {id: string; service: MusicService}

export function BackgroundMusic({track, open, online, onToggle, onClose, onService, interactionLocked = false}: {
  track: BackgroundTrack; open: boolean; online: boolean; onToggle: () => void; onClose: () => void;
  onService: (service: MusicService) => void; interactionLocked?: boolean;
}) {
  const [retry, setRetry] = useState(0);
  const [loadedKey, setLoadedKey] = useState('');
  const [failedKey, setFailedKey] = useState('');
  const [slowKey, setSlowKey] = useState('');
  const toggle = useRef<HTMLButtonElement>(null);
  const controlsId = useId();
  const cue = musicById[track.id];
  const apple = track.service === 'apple';
  const url = apple ? cue.appleEmbedUrl : cue.spotifyEmbedUrl;
  const provider = apple ? 'Apple Music' : 'Spotify';
  const frameKey = `${track.service}:${track.id}:${retry}`;
  const loaded = loadedKey === frameKey;
  const failed = failedKey === frameKey;
  const slow = slowKey === frameKey;

  useEffect(() => {
    if (!online) {
      setLoadedKey('');
      setFailedKey('');
      setSlowKey('');
      return;
    }
    if (!url) return;
    const timer = window.setTimeout(() => setSlowKey(frameKey), 7000);
    return () => window.clearTimeout(timer);
  }, [frameKey, online, url]);

  useEffect(() => {
    if (open && !interactionLocked) toggle.current?.focus({preventScroll: true});
  }, [open, interactionLocked, track.id]);

  const status = failed || !url ? 'אפשר לפתוח את השיר בשירות המוזיקה'
    : loaded ? 'כפתור הניגון נמצא בנגן של השירות'
    : slow ? 'הנגן עדיין נטען' : 'פותחים את הנגן…';

  return <aside className={`music-dock premium-music-dock ${open ? 'music-dock-expanded' : 'music-dock-minimized'}`}
    aria-label="נגן מוזיקה עם הסיפור" data-testid="background-player" inert={interactionLocked || undefined}>
    <header className="sound-header">
      <button ref={toggle} className="sound-toggle" onClick={onToggle} aria-expanded={open} aria-controls={controlsId}
        aria-label={open ? 'מזעור נגן המוזיקה' : 'פתיחת נגן המוזיקה'}>
        <span className="sound-note"><Icon name="music" size={17}/></span>
        <span className="sound-title"><small>{provider}</small><bdi>{cue.displayTitle}</bdi></span>
        <span className="sound-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <button className="icon-button" aria-label="סגירת נגן המוזיקה" onClick={onClose}><Icon name="close" size={18}/></button>
    </header>
    <div id={controlsId} hidden={!open} className="sound-controls">
      {online && url && <div className="persistent-embed premium-official-embed" data-testid="official-embed" aria-busy={!loaded && !failed && !slow}>
        <iframe key={frameKey} src={url} title={`${provider}: ${cue.displayTitle}`} height={apple ? 175 : 152} width="100%"
          allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture" allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoadedKey(frameKey)} onError={() => setFailedKey(frameKey)}/>
      </div>}
      {online && <p className="sound-status" role="status">{status}</p>}
      {online && url && (slow && !loaded || failed) && <div className="sound-tools"><button onClick={() => setRetry(n => n + 1)}>ננסה שוב</button></div>}
      <MusicHandoff cue={cue} service={track.service} online={online}/>
      <div className="segmented sound-services" role="group" aria-label="בחירת שירות לנגן">
        <button dir="ltr" aria-pressed={apple} onClick={() => onService('apple')}>Apple Music</button>
        <button dir="ltr" aria-pressed={!apple} onClick={() => onService('spotify')}>Spotify</button>
      </div>
    </div>
  </aside>;
}
