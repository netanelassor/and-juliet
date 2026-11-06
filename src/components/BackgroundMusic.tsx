import { useEffect, useState } from 'react';
import { musicById, type MusicService } from '../content/music-cues';
import { Icon } from './Icons';

export interface BackgroundTrack {id: string; service: MusicService}
export function BackgroundMusic({track, onClose, onService, interactionLocked = false, onReturnToStory}: {track: BackgroundTrack; onClose: () => void; onService: (service: MusicService) => void; interactionLocked?: boolean; onReturnToStory?: () => void}) {
  const [retry, setRetry] = useState(0);
  const [loadedKey, setLoadedKey] = useState('');
  const [failedKey, setFailedKey] = useState('');
  const [slow, setSlow] = useState(false);
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
  const status = failed ? 'אפשר לנסות שוב או לבחור שירות אחר.' : loaded ? 'נוגעים ב־Play וממשיכים בסיפור' : slow ? 'לוקח מעט זמן. אפשר לנסות שוב.' : 'פותחים את הנגן…';
  if (!url) return null;
  return <aside className="music-dock" aria-label="נגן מוזיקה עם הסיפור" data-testid="background-player" inert={interactionLocked || undefined}>
    <header><div className="dock-identity"><span className="dock-provider"><Icon name="music" size={16}/><span>עם הסיפור · <bdi>{provider}</bdi></span></span><span className={`dock-status ${!loaded ? 'dock-status-waiting' : ''}`} role="status" aria-live="polite">{status}</span></div><button className="icon-button" aria-label="סגירת נגן המוזיקה" onClick={onClose}><Icon name="close" size={18}/></button></header>
    <div className="persistent-embed" data-testid="official-embed" aria-busy={!loaded}><iframe key={frameKey} src={url} title={`${provider}: ${cue.displayTitle}`} height={apple ? 175 : 152} allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoadedKey(frameKey)} onError={() => setFailedKey(frameKey)}/></div>
    <div className="dock-caption"><button className="player-fallback" onClick={() => onService(apple ? 'spotify' : 'apple')}>לא נטען? נסו <bdi>{apple ? 'Spotify' : 'Apple Music'}</bdi></button><button className="player-retry" aria-label="טעינת נגן המוזיקה מחדש" title="טעינת הנגן מחדש" onClick={() => setRetry(n => n + 1)}><Icon name="replay" size={17}/></button><a href={external || (apple ? cue.fallback.appleMusicAlbumUrl : cue.fallback.spotifyAlbumUrl)} target="_blank" rel="noopener noreferrer" aria-label={`פתיחה ב־${provider}`}><Icon name="external" size={15}/></a></div>
    {onReturnToStory && <button className="music-return-to-story" onClick={onReturnToStory}>נחזור לסיפור<Icon name="left" size={17}/></button>}
  </aside>;
}
