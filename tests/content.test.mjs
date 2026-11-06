import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspace = resolve(project, '../..');
const json = async path => JSON.parse(await readFile(resolve(project, path), 'utf8'));
const inventory = await json('src/content/source-inventory.json');
const story = await json('src/content/full-story.json');
const verifiedMusic = await json('docs/verified-music-inventory.json');
const preservation = await json('tests/fixtures/preservation-snapshot.json');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = async path => {try {await access(path); return true;} catch {return false;}};
const numbers = Array.from({length: 48}, (_, i) => i + 1);
const displayName = text => text.replaceAll('יוליה', "ג'ולייט");

test('the48-page canonical source retains its independently captured narrative digest and act boundary', () => {
  assert.equal(inventory.canonicalSource.pdfPages, 60);
  assert.equal(inventory.canonicalSource.storyPages, 48);
  assert.deepEqual(inventory.scenes.map(scene => scene.sourceScene), numbers);
  assert.equal(inventory.canonicalSource.actBreakAfterSourceScene, 24);
  const digest = sha256(JSON.stringify(inventory.scenes.map(scene => ({scene: scene.sourceScene, paragraphs: scene.canonicalParagraphs}))));
  assert.equal(digest, preservation.canonicalNarrativeSha256, 'Canonical wording changed. Check the original PDF rather than refreshing this baseline.');
  for (const scene of inventory.scenes) {
    assert.equal(scene.sourcePdfPage, scene.sourceScene + 6);
    assert.equal(scene.printedStoryPage, scene.sourceScene + 4);
    assert.equal(scene.act, scene.sourceScene <= 24 ? 1 : 2);
    assert.ok(scene.rawPdfExtract.trim());
    assert.deepEqual(scene.sourceArtPixels, [1536, 1024]);
  }
});

test('the entire runtime story preserves every source paragraph with only the requested name change', () => {
  assert.deepEqual(story.map(beat => beat.sourceScene), numbers);
  let nameChanges = 0;
  for (const [index, beat] of story.entries()) {
    const original = inventory.scenes[index];
    assert.equal(beat.sourcePdfPage, original.sourcePdfPage);
    assert.equal(beat.act, original.act);
    assert.equal(beat.title, displayName(original.canonicalTitle));
    assert.deepEqual(beat.paragraphs, original.canonicalParagraphs.map(displayName), `Source scene${beat.sourceScene} lost or rewrote a paragraph.`);
    assert.deepEqual(beat.paragraphs, original.paragraphs);
    assert.equal(beat.musicTrackNumber, original.musicTrackNumber);
    assert.equal(beat.canonicalTrackTitle, original.canonicalTrackTitle);
    assert.doesNotMatch(beat.paragraphs.join('\n'), /יוליה|--|__|[_*–—]/);
    nameChanges += original.canonicalParagraphs.join('\n').split('יוליה').length - 1;
  }
  assert.equal(nameChanges, 70);
  assert.equal(inventory.nameReplacementsInStory, 70);
  assert.equal(story.flatMap(beat => beat.paragraphs).join(' ').trim().split(/\s+/).length, 1784, 'Do not replace the original with the shorter editorial rewrite.');
});

test('all29 independently verified Broadway cues retain their canonical source locations', () => {
  const originalCues = inventory.scenes.filter(scene => scene.musicTrackNumber !== null);
  assert.deepEqual(originalCues.map(scene => scene.musicTrackNumber), Array.from({length: 29}, (_, i) => i + 1));
  assert.equal(verifiedMusic.length, 29);
  for (const original of originalCues) {
    const verified = verifiedMusic.find(cue => cue.trackNumber === original.musicTrackNumber);
    assert.ok(verified);
    assert.equal(verified.sourceScene, original.sourceScene);
    assert.equal(verified.sourcePdfPage, original.sourcePdfPage);
    assert.equal(verified.castRecording, 'Original Broadway Cast Recording');
  }
});

test('the canonical PDF is unchanged when its original local file is available', async t => {
  const path = inventory.canonicalSource.path;
  if (!await exists(path)) return t.skip('The canonical PDF is intentionally outside the portable app.');
  assert.equal(sha256(await readFile(path)), inventory.canonicalSource.sha256);
});

test('all48 lossless master illustrations are unchanged when the book workspace is present', async t => {
  if (!await exists(resolve(workspace, inventory.scenes[0].sourceArt))) return t.skip('Lossless masters remain in the original book workspace.');
  for (const scene of inventory.scenes) assert.equal(sha256(await readFile(resolve(workspace, scene.sourceArt))), scene.sourceArtSha256, `Original artwork${scene.sourceScene} changed.`);
});

test('the approved v9 printed book still matches its Phase0 preservation snapshot', async t => {
  const base = resolve(project, preservation.bookDirectory);
  if (!await exists(base)) return t.skip('The approved printed book is a sibling deliverable.');
  for (const file of preservation.files) assert.equal(sha256(await readFile(resolve(base, file.path))), file.sha256, `Approved output changed: ${file.path}`);
});

test('the earlier interactive prototype is unchanged against its delivered source ZIP', async t => {
  const archive = resolve(project, '../and-juliet-interactive-ipad-prototype-project.zip');
  const prototype = resolve(project, '../and-juliet-interactive-ipad-prototype');
  if (!await exists(archive) || !await exists(prototype)) return t.skip('The preserved prototype/archive are separate sibling deliverables.');
  const script = `import sys,zipfile,hashlib,json\nfrom pathlib import Path\na=Path(sys.argv[1]);p=Path(sys.argv[2]);checked=0;changed=[]\nwith zipfile.ZipFile(a) as z:\n for item in z.infolist():\n  if item.is_dir():continue\n  rel=Path(item.filename).relative_to(p.name);local=p/rel\n  if not local.is_file() or hashlib.sha256(local.read_bytes()).digest()!=hashlib.sha256(z.read(item)).digest():changed.append(str(rel))\n  checked+=1\nprint(json.dumps({'checked':checked,'changed':changed}))`;
  const report = JSON.parse(execFileSync('python3', ['-c', script, archive, prototype], {encoding: 'utf8'}));
  assert.ok(report.checked >= 50, 'The archive must contain a meaningful prototype baseline.');
  assert.deepEqual(report.changed, [], 'The preserved Phase1 prototype was altered.');
});
