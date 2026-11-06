import { chapters, type ChapterId } from '../content/scenes';
import type { MusicService } from '../content/music-cues';

export type Mode = 'read' | 'explore' | 'quiet';
export interface Preferences {
  version: 1; chapter: ChapterId; beat: number; hasProgress: boolean;
  service: MusicService; motion: boolean; mode: Mode; favorites: string[];
}
export const STORAGE_KEY = 'ron-juliet-stage-v1';
export function loadPreferences(): Preferences {
  const defaults: Preferences = { version: 1, chapter: 'opening', beat: 0, hasProgress: false,
    service: 'apple', motion: true,
    mode: 'read', favorites: [] };
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const chapter = chapters.find(c => c.id === p?.chapter);
    if (!chapter || p.version !== 1) return defaults;
    return { ...defaults, chapter: chapter.id, beat: Math.max(0, Math.min(chapter.beats.length - 1, Number.isInteger(p.beat) ? p.beat : 0)),
      hasProgress: p.hasProgress === true, service: p.service === 'spotify' ? 'spotify' : 'apple',
      motion: p.motion !== false,
      mode: ['read', 'explore', 'quiet'].includes(p.mode) ? p.mode : 'read',
      favorites: Array.isArray(p.favorites) ? p.favorites.filter((x: unknown) => typeof x === 'string') : [] };
  } catch { return defaults; }
}
export function savePreferences(p: Preferences) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* Private browsing and quota restrictions do not block reading. */ }
}
export function parseSceneHash(hash: string) {
  const parts = hash.replace(/^#\/?/, '').split('/');
  const chapter = chapters.find(c => c.id === parts[0]);
  if (!chapter) return null;
  const requested = Number(parts[1] || 1) - 1;
  return { chapter: chapter.id, beat: Math.max(0, Math.min(chapter.beats.length - 1, Number.isFinite(requested) ? Math.floor(requested) : 0)) };
}
export function swipeDirection(dx: number, dy: number, duration: number): 'next' | 'back' | null {
  if (duration > 800 || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return null;
  // A Hebrew page moves to the right as the reader advances to the left page.
  return dx > 0 ? 'next' : 'back';
}
