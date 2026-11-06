import { useEffect, useRef, useState } from 'react';
import { musicById, musicCues, type MusicService } from '../content/music-cues';
import { asset } from '../content/scenes';
import { Modal } from './Modal';
import { Icon } from './Icons';
import '../styles/music-polish.css';
import '../styles/premium-music.css';

export function MusicPanel({cueId, service, onService, favorites, onFavorite, onClose, onPlayHere}: {
  cueId: string; service: MusicService; onService: (s: MusicService) => void;
  favorites: string[]; onFavorite: (id: string) => void; onClose: () => void;
  onPlayHere: (id: string, service: MusicService) => void;
}) {
  const [id, setId] = useState(cueId);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const cue = musicById[id] || musicCues[0];
  const isApple = service === 'apple';
  const trackUrl = isApple ? cue.appleMusicTrackUrl : cue.spotifyTrackUrl;
  const albumUrl = isApple ? cue.fallback.appleMusicAlbumUrl : cue.fallback.spotifyAlbumUrl;
  const embedUrl = isApple ? cue.appleEmbedUrl : cue.spotifyEmbedUrl;
  const provider = isApple ? 'Apple Music' : 'Spotify';
  const songs = musicCues.filter(song => !onlyFavorites || favorites.includes(song.id));
  function selectSong(nextId: string) {
    setId(nextId);
    if (matchMedia('(max-width: 670px)').matches) {
      document.querySelector('dialog.music-modal')?.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  }
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = list.current;
      const row = container?.querySelector<HTMLElement>('[aria-current="true"]');
      if (!container || !row) return;
      const box = container.getBoundingClientRect(), selected = row.getBoundingClientRect();
      const top = box.top + 57;
      if (selected.top < top || selected.bottom > box.bottom) {
        container.scrollTop += selected.top - top - Math.max(0, (container.clientHeight - 57 - selected.height) / 2);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [id, onlyFavorites]);
  return <Modal title="המוזיקה של הסיפור" onClose={onClose} className="music-modal premium-music-modal">
    <p className="small muted music-edition">הקלטת צוות ברודוויי המקורי <span aria-hidden="true">·</span> שיר אחר שיר, עם הסיפור שלנו</p>
    <div className="segmented provider-choice" role="group" aria-label="שירות מוזיקה">
      <button dir="ltr" aria-pressed={isApple} onClick={() => onService('apple')}>Apple Music</button>
      <button dir="ltr" aria-pressed={!isApple} onClick={() => onService('spotify')}>Spotify</button>
    </div>
    <div className="music-browser">
    <section className="music-selection" aria-label="השיר הנבחר">
    <div className="selected-song">
      <div className="record-art" aria-hidden="true"><img src={asset('cover/logo.webp')} alt=""/></div>
      <div><span className="eyebrow">רצועה {cue.trackNumber}</span><h3 dir="auto" aria-live="polite">{cue.displayTitle}</h3><span dir="ltr" className="small muted">Original Broadway Cast Recording</span></div>
      <button className={`icon-button favorite ${favorites.includes(id) ? 'selected' : ''}`} aria-label="שמירת השיר באהובים" aria-pressed={favorites.includes(id)} onClick={() => onFavorite(id)}><Icon name="heart"/></button>
    </div>
    <button className="button primary provider-link" onClick={() => onPlayHere(id, service)} disabled={!embedUrl} data-testid="play-in-story"><Icon name="play" size={19}/>נקשיב עם הסיפור</button>
    <a className="text-button external-option" href={trackUrl || albumUrl} target="_blank" rel="noopener noreferrer" data-testid="external-track"><Icon name="external" size={16}/><span>פתיחה ב־<bdi>{provider}</bdi></span></a>
    {!trackUrl && <p className="small">קישור הרצועה עדיין לא אומת. ייפתח האלבום המקורי.</p>}
    <p className="provider-note">השיר ייפתח בנגן שמתחת לסיפור. נוגעים ב־Play בנגן, ואז אפשר להמשיך לקרוא. להאזנה מלאה נדרשים מינוי והתחברות לשירות.</p>
    <a className="album-link" href={albumUrl} target="_blank" rel="noopener noreferrer">לכל האלבום ב־<bdi>{provider}</bdi><Icon name="external" size={14}/></a>
    </section>
    <div className="songbook" ref={list} aria-label="בחירת שיר"><div className="songbook-heading"><div><h3>כל שירי הסיפור</h3><span className="music-count">{songs.length} שירים</span></div><button className="favorite-filter" aria-pressed={onlyFavorites} onClick={() => setOnlyFavorites(n => !n)}><Icon name="heart" size={15}/>האהובים שלנו</button></div>{songs.map(song => <button key={song.id} className={song.id === id ? 'active-song' : ''} aria-current={song.id === id ? 'true' : undefined} onClick={() => selectSong(song.id)}><span className="track-no">{String(song.trackNumber).padStart(2, '0')}</span><span dir="auto" data-song-title>{song.displayTitle}</span>{favorites.includes(song.id) ? <Icon name="heart" size={16}/> : song.id === id ? <Icon name="music" size={16}/> : null}</button>)}{onlyFavorites && !favorites.length && <div className="songbook-empty"><Icon name="heart" size={28}/><p>השירים שאתם אוהבים יחכו כאן.</p><span>נוגעים בלב ליד שיר כדי לשמור אותו.</span></div>}</div>
    </div>
  </Modal>;
}
