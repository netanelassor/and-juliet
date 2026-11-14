import {albums, type MusicCue, type MusicService} from '../content/music-cues';
import {Icon} from './Icons';
import '../styles/music-handoff.css';

function DownloadedMusicInstructions({cue}: {cue: MusicCue}) {
  return <>
    <p>באייפון או באייפד, פתחו את ״מוזיקה״. בחרו <strong>ספרייה</strong> ואז <strong>הורדות</strong>.</p>
    <p>פתחו את <bdi>{albums.title}</bdi>, הפעילו רצועה <bdi>{cue.trackNumber}</bdi> וחזרו לספר.</p>
  </>;
}

export function MusicHandoff({cue, service, online}: {cue: MusicCue; service: MusicService; online: boolean}) {
  const apple = service === 'apple';
  const provider = apple ? 'Apple Music' : 'Spotify';
  const href = apple ? cue.appleMusicTrackUrl || cue.fallback.appleMusicAlbumUrl
    : cue.spotifyTrackUrl || cue.fallback.spotifyAlbumUrl;
  return <div className={`music-handoff${online ? '' : ' offline-music-handoff'}`}>
    {!online && <p className="music-handoff-heading" role="status">האזנה בלי רשת</p>}
    <a className="music-handoff-link" href={href} target="_blank" rel="noopener noreferrer" data-testid="external-track">
      <Icon name="external" size={16}/><span>פתיחה ב־<bdi>{provider}</bdi></span>
    </a>
    {apple && (online ? <details className="downloaded-music-instructions">
      <summary>השיר כבר הורד למכשיר?</summary>
      <div><DownloadedMusicInstructions cue={cue}/></div>
    </details> : <div className="downloaded-music-instructions">
      <p>אם השיר הורד והקישור לא נפתח, אפשר להפעיל אותו ישירות באפליקציה.</p>
      <DownloadedMusicInstructions cue={cue}/>
    </div>)}
    {!online && !apple && <p className="downloaded-music-instructions">אם השיר הורד, אפשר להפעיל אותו באפליקציית <bdi>Spotify</bdi> ולחזור לספר.</p>}
  </div>;
}
