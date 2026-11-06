import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = async path => JSON.parse(await readFile(resolve(project, path), 'utf8'));
const story = await json('src/content/full-story.json');
const chapters = await json('src/content/chapters-data.json');
const geometry = await json('src/content/stage-geometry.json');
const verified = await json('docs/verified-music-inventory.json');
const musicSource = await readFile(resolve(project, 'src/content/music-cues.ts'), 'utf8');
const cueMatch = musicSource.match(/export const musicCues: MusicCue\[\] = (\[[\s\S]*?\n\]);/);
assert.ok(cueMatch, 'Music must remain an inspectable data-driven array.');
const cues = JSON.parse(cueMatch[1]);
const numbers = Array.from({length: 48}, (_, i) => i + 1);
const characterIds = new Set(['juliet', 'shakespeare', 'anne', 'may', 'francois', 'angelique', 'lance', 'romeo']);

test('17 chapters cover the exact48 canonical beats once in original order', () => {
  assert.equal(chapters.length, 17);
  assert.equal(new Set(chapters.map(chapter => chapter.id)).size, 17);
  assert.deepEqual(chapters.flatMap(chapter => chapter.beats), story);
  assert.deepEqual(chapters.flatMap(chapter => chapter.beats.map(beat => beat.sourceScene)), numbers);
  for (const chapter of chapters) {
    assert.match(chapter.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(chapter.title && chapter.subtitle && chapter.action);
    assert.ok(['dialogue', 'musical', 'quiet'].includes(chapter.family));
    assert.ok(chapter.beats.length >= 1 && chapter.beats.length <= 4);
    assert.ok(chapter.beats.every(beat => beat.act === chapter.act), 'Do not bury an act boundary inside a chapter.');
    assert.ok(chapter.characters.length > 0 && chapter.characters.every(id => characterIds.has(id)));
  }
});

test('the real intermission and delivered deep-link chapter names keep their meaning', () => {
  assert.deepEqual(chapters.filter(chapter => chapter.act === 1).flatMap(chapter => chapter.beats.map(beat => beat.sourceScene)), numbers.slice(0, 24));
  assert.deepEqual(chapters.filter(chapter => chapter.act === 2).flatMap(chapter => chapter.beats.map(beat => beat.sourceScene)), numbers.slice(24));
  assert.deepEqual(chapters.find(chapter => chapter.id === 'opening').beats.map(beat => beat.sourceScene), [1, 2, 3, 4]);
  assert.deepEqual(chapters.find(chapter => chapter.id === 'chandelier').beats.map(beat => beat.sourceScene), [14]);
  assert.deepEqual(chapters.find(chapter => chapter.id === 'emotional').beats.map(beat => beat.sourceScene), [15, 16]);
  assert.equal(chapters.at(-1).beats.at(-1).sourceScene, 48);
});

test('all29 runtime songs use verified cast-track links and their correct containing chapter', () => {
  assert.deepEqual(cues.map(cue => cue.trackNumber), Array.from({length: 29}, (_, i) => i + 1));
  assert.equal(new Set(cues.map(cue => cue.id)).size, 29);
  assert.deepEqual(chapters.flatMap(chapter => chapter.music), cues.map(cue => cue.id));
  for (const cue of cues) {
    const catalog = verified.find(item => item.trackNumber === cue.trackNumber);
    const canonical = story.find(beat => beat.musicTrackNumber === cue.trackNumber);
    const chapter = chapters.find(item => item.beats.some(beat => beat.sourceScene === cue.sourceScene));
    assert.equal(cue.sourceScene, canonical.sourceScene);
    assert.equal(cue.sceneId, chapter.id);
    assert.equal(cue.trackTitle, catalog.trackTitle);
    assert.equal(cue.verification, 'verified');
    assert.equal(cue.appleMusicTrackUrl, catalog.appleMusicTrackUrl);
    assert.equal(cue.spotifyTrackUrl, catalog.spotifyTrackUrl);
    const apple = new URL(cue.appleMusicTrackUrl);
    assert.equal(apple.hostname, 'music.apple.com');
    assert.match(apple.pathname, /\/1643207110$/);
    assert.match(apple.searchParams.get('i') || '', /^\d+$/);
    assert.equal(cue.appleEmbedUrl, cue.appleMusicTrackUrl.replace('music.apple.com', 'embed.music.apple.com'));
    assert.match(cue.spotifyTrackUrl, /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/);
    assert.equal(cue.spotifyEmbedUrl, cue.spotifyTrackUrl.replace('/track/', '/embed/track/'));
    assert.equal(cue.fallback.appleMusicAlbumUrl, 'https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110');
    assert.equal(cue.fallback.spotifyAlbumUrl, 'https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD');
  }
  for (const chapter of chapters) assert.deepEqual(chapter.music, chapter.beats.filter(beat => beat.musicTrackNumber !== null).map(beat => cues.find(cue => cue.trackNumber === beat.musicTrackNumber).id));
});

test('track26 keeps the discreet family label and its real catalog destination', () => {
  const cue = cues.find(cue => cue.trackNumber === 26);
  assert.equal(cue.displayTitle, 'רצועה 26');
  assert.equal(cue.sourceScene, 44);
  assert.ok(cue.trackTitle.includes('Perfect'));
  assert.ok(cue.appleMusicTrackUrl.includes('1643208388'));
  for (const song of cues.filter(cue => cue.trackNumber !== 26)) assert.equal(song.displayTitle, song.trackTitle);
});

function webpDimensions(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  const format = bytes.toString('ascii', 12, 16);
  if (format === 'VP8 ') return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
  if (format === 'VP8X') return [bytes.readUIntLE(24, 3) + 1, bytes.readUIntLE(27, 3) + 1];
  if (format === 'VP8L') return [1 + (bytes[21] | ((bytes[22] & 0x3f) << 8)), 1 + ((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 0x0f) << 10))];
  throw new Error(`Unsupported WebP header${format}`);
}

test('all48 scenes have full-size WebPs, smaller thumbnails and bounded art-space geometry', async () => {
  const expected = numbers.map(n => `scene-${String(n).padStart(2, '0')}.webp`);
  for (const folder of ['story', 'thumbs']) assert.deepEqual((await readdir(resolve(project, 'public/assets', folder))).filter(name => name.endsWith('.webp')).sort(), expected);
  assert.deepEqual(Object.keys(geometry.scenes).map(Number).sort((a, b) => a - b), numbers);
  for (const n of numbers) {
    const key = String(n).padStart(2, '0'), art = geometry.scenes[key];
    assert.equal(art.canonicalPdfPage, n + 6);
    assert.equal(art.image, `assets/story/scene-${key}.webp`);
    const full = await readFile(resolve(project, 'public', art.image));
    const thumb = await readFile(resolve(project, 'public/assets/thumbs', `scene-${key}.webp`));
    assert.deepEqual(webpDimensions(full), [1536, 1024], 'Keep full original image dimensions and aspect ratio.');
    const [w, h] = webpDimensions(thumb);
    assert.ok(w >= 180 && w <= 480 && Math.abs(w / h - 1.5) < .01);
    assert.ok(thumb.length < full.length && full.length < 1_500_000);
    assert.equal(art.focalPoint.length, 2);
    assert.ok(art.focalPoint.every(v => Number.isFinite(v) && v >= 0 && v <= 1));
    for (const p of art.hotspots) {
      assert.ok(characterIds.has(p.characterId), `Unknown character in scene${n}.`);
      assert.ok([p.x, p.y].every(v => Number.isFinite(v) && v >= 0 && v <= 1));
      assert.ok(p.radius >= .03 && p.radius <= .3);
    }
  }
});

test('48 scene-specific motion directions protect the quiet emotional moments', async () => {
  const {sceneMotions} = await import(pathToFileURL(resolve(project, 'src/motion/scene-motion.ts')).href);
  assert.deepEqual(Object.keys(sceneMotions).map(Number).sort((a, b) => a - b), numbers);
  assert.ok(new Set(Object.values(sceneMotions).map(cue => cue.kind)).size >= 12, 'Use purposeful variation rather than one effect repeated48times.');
  for (const cue of Object.values(sceneMotions)) {
    assert.ok(cue.action.trim() && cue.announcement.trim());
    assert.equal(cue.focal.length, 2);
    assert.ok(cue.focal.every(v => Number.isFinite(v) && v >= 0 && v <= 1));
    assert.ok(['sway', 'ride', 'reveal', 'lift', 'still'].includes(cue.camera));
    assert.ok(['gentle', 'regular', 'grand'].includes(cue.intensity));
    assert.ok(['dust', 'petals', 'stars', 'city', 'none'].includes(cue.ambient));
  }
  for (const [n, kind] of [[10, 'carriage'], [11, 'carriage'], [14, 'chandelier'], [24, 'reveal'], [28, 'quill-snap'], [46, 'finale'], [48, 'finale']]) assert.equal(sceneMotions[n].kind, kind);
  for (const n of [5, 16, 29, 30, 35, 36, 43, 45, 47]) {
    assert.equal(sceneMotions[n].intensity, 'gentle', `Leave room for emotional scene${n}.`);
    assert.equal(sceneMotions[n].camera, 'still');
  }
});

test('commercial song recordings are not bundled in the static app', async () => {
  async function files(folder) {
    const entries = await readdir(folder, {withFileTypes: true});
    return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(resolve(folder, entry.name)) : resolve(folder, entry.name)))).flat();
  }
  assert.deepEqual((await files(resolve(project, 'public'))).filter(file => /\.(?:mp3|m4a|aac|wav|flac|ogg)$/i.test(file)), []);
  assert.doesNotMatch(musicSource, /https?:[^\s"']+\.(?:mp3|m4a|aac)(?:[?"']|$)/i);
});
