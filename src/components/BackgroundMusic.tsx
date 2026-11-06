import { useEffect, useId, useState } from 'react';
import { musicById, type MusicService } from '../content/music-cues';
import { Icon } from './Icons';
import '../styles/premium-music.css';

export interface BackgroundTrack {id: string; service: MusicService}
export function BackgroundMusic({track, onClose, onService, interactionLocked = false, onReturnToStory, onOpenLibrary}: {track: BackgroundTrack; onClose: () => void; onService: (service: MusicService) => void; interactionLocked?: boolean; onReturnToStory?: () => void; onOpenLibrary?: () => void}) {
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loadedKey, setLoadedKey] = useState('');
  const [failedKey, setFailedKey] = useState('');
  const [slow, setSlow] = useState(false);
  const optionsId = useId();
  const cue = musicById[track.id];
  const apple = track.service === 'apple';
  const url = apple ? cue.appleEmbedUrl : cue.spotifyEmbedUrl;
  const external = apple ? cue.appleMusicTrackUrl : cue.spotifyTrackUrl;
  const provider = apple ? 'Apple Music' : 'Spotify';
  const frameKey = `${track.service}:${track.id}:${retry}`;
  const loaded = loadedKey === frameKey;
  const failed = failedKey === frameKey;
  useEffect(() => {
    setSlow(false);
    setFailedKey('');
    const timer = window.setTimeout(() => setSlow(true), 7000);
    return () => window.clearTimeout(timer);
  }, [frameKey]);
  const status = failed ? 'הנגן לא נפתח. ננסה שוב?' : loaded ? 'נוגעים ב־Play בנגן וממשיכים בסיפור' : slow ? 'זה לוקח עוד רגע. אפשר לנסות שוב.' : 'פותחים את השיר…';
  if (!url) return null;
  return <aside className={`music-dock premium-music-dock ${expanded ? 'music-dock-expanded' : 'music-dock-compact'}`} aria-label="נגן מוזיקה עם הסיפור" data-testid="background-player" inert={interactionLocked || undefined}>
    <header className="premium-dock-header">
      <div className="premium-dock-title"><span className="premium-dock-note" aria-hidden="true"><Icon name="music" size={19}/></span><div><span className="dock-provider">המוזיקה של הרגע · <bdi>{provider}</bdi></span><h2 dir="auto">{cue.displayTitle}</h2></div></div>
      <div className="premium-dock-actions"><button className="dock-expand" aria-expanded={expanded} aria-controls={optionsId} aria-label={expanded ? 'מזעור אפשרויות הנגן' : 'הרחבת אפשרויות הנגן'} onClick={() => setExpanded(value => !value)}><span>{expanded ? 'פחות' : 'עוד'}</span><svg className={expanded ? 'is-expanded' : ''} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><button className="icon-button" aria-label="סגירת נגן המוזיקה" onClick={onClose}><Icon name="close" size={18}/></button></div>
    </header>
    <div className="persistent-embed premium-official-embed" data-testid="official-embed" aria-busy={!loaded && !failed}><iframe key={frameKey} src={url} title={`${provider}: ${cue.displayTitle}`} height={apple ? 175 : 152} width="100%" allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoadedKey(frameKey)} onError={() => setFailedKey(frameKey)}/></div>
    <div className="premium-dock-status"><span className={`dock-status ${!loaded ? 'dock-status-waiting' : ''}`} role="status" aria-live="polite">{status}</span>{(slow && !loaded || failed) && <button className="premium-retry-inline" onClick={() => setRetry(n => n + 1)}><Icon name="replay" size={16}/>ננסה שוב</button>}</div>
    <div className="premium-music-options" id={optionsId} hidden={!expanded}>
      <p>השיר נשאר איתנו כשממשיכים לקרוא.<br/>להאזנה מלאה, מתחברים למינוי בשירות המוזיקה.</p>
      <div className="premium-provider-options"><span>נקשיב דרך</span><div role="group" aria-label="בחירת שירות לנגן"><button dir="ltr" aria-pressed={apple} onClick={() => {if (!apple) onService('apple');}}>Apple Music</button><button dir="ltr" aria-pressed={!apple} onClick={() => {if (apple) onService('spotify');}}>Spotify</button></div></div>
      <div className="premium-provider-links"><button onClick={() => setRetry(n => n + 1)}><Icon name="replay" size={15}/>טעינה מחדש</button><a href={external || (apple ? cue.fallback.appleMusicAlbumUrl : cue.fallback.spotifyAlbumUrl)} target="_blank" rel="noopener noreferrer"><Icon name="external" size={15}/>פתיחה ב־<bdi>{provider}</bdi></a></div>
    </div>
    {(onOpenLibrary || onReturnToStory) && <div className="premium-dock-footer">{onOpenLibrary && <button className="premium-library-link" onClick={onOpenLibrary}><Icon name="music" size={16}/>לכל שירי הסיפור</button>}{onReturnToStory && <button className="music-return-to-story" onClick={onReturnToStory}>נחזור לסיפור<Icon name="left" size={17}/></button>}</div>}
  </aside>;
}
