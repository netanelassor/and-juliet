/* BOOK is injected by the build plugin. No imports, APIs, accounts, or audio. */
const scope = self.registration.scope;
const prefix = `juliet-reading-v1:${encodeURIComponent(new URL(scope).pathname)}:`;
const cacheName = prefix + BOOK.version;
const absolute = path => new URL(path, scope).href;
const markerURL = absolute('__offline_book_complete__');
const manifestURL = absolute('offline-book-manifest.json');
const indexURL = absolute('index.html');
const allowed = new Set(BOOK.files.map(file => new URL(file.path, scope).pathname));
let job = null;

// Installing the lightweight worker itself never downloads the illustrations.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

const state = (phase, extra = {}) => ({channel: 'juliet-offline', scope, version: BOOK.version, phase, total: BOOK.files.length, totalBytes: BOOK.totalBytes, completed: 0, bytes: 0, ...extra});
async function publish(value) {
  const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
  for (const client of clients) if (client.url.startsWith(scope)) client.postMessage(value);
}
async function bookCaches() {return (await caches.keys()).filter(name => name.startsWith(prefix));}
async function status() {
  if (job) return job.progress;
  const cache = await caches.open(cacheName);
  const keys = new Set((await cache.keys()).map(request => request.url));
  const saved = BOOK.files.filter(file => keys.has(absolute(file.path)));
  const complete = saved.length === BOOK.files.length && Boolean(await cache.match(markerURL));
  let previousSaved = false;
  if (!complete) for (const name of await bookCaches()) {
    if (name !== cacheName && await (await caches.open(name)).match(markerURL)) {previousSaved = true; break;}
  }
  return state(complete ? 'ready' : saved.length ? 'partial' : previousSaved ? 'outdated' : 'idle', {completed: saved.length, bytes: saved.reduce((sum,file) => sum + file.bytes,0)});
}
async function download(file, signal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, {once: true});
  if (signal.aborted) controller.abort();
  const timer = setTimeout(abort, 35000);
  try {
    const response = await fetch(absolute(file.path), {credentials: 'omit', cache: 'reload', signal: controller.signal});
    if (!response.ok || response.type === 'opaque' || (!file.path.endsWith('.html') && (response.headers.get('content-type') || '').includes('text/html'))) throw new Error('incomplete-response');
    // Keep cancellation/timeout attached until the complete response body arrives.
    await response.clone().arrayBuffer();
    return response;
  } finally {clearTimeout(timer); signal.removeEventListener('abort', abort);}
}
async function keepPreviousEdition() {
  const completed = [];
  for (const name of await bookCaches()) {
    if (name === cacheName) continue;
    const cache = await caches.open(name);
    const marker = await cache.match(markerURL);
    let savedAt = 0;
    if (marker) {try {savedAt = (await marker.json()).savedAt || 0;} catch {}}
    completed.push({name,savedAt});
  }
  completed.sort((a,b) => b.savedAt - a.savedAt);
  const previous = completed.find(item => item.savedAt > 0)?.name;
  // Only this exact book/scope prefix is touched. Other apps' caches are excluded.
  await Promise.all(completed.filter(item => item.name !== previous).map(item => caches.delete(item.name)));
}
async function saveBook(current) {
  try {
    const cache = await caches.open(cacheName);
    await cache.delete(markerURL);
    for (const file of BOOK.files) {
      if (current.controller.signal.aborted) throw new Error('cancelled');
      const url = absolute(file.path);
      if (!await cache.match(url)) {
        const response = await download(file, current.controller.signal);
        if (current.controller.signal.aborted) throw new Error('cancelled');
        // URL-string keys contain no request cookies or authorization headers.
        await cache.put(url, response);
      }
      current.progress = state('saving', {completed: current.progress.completed + 1, bytes: current.progress.bytes + file.bytes});
      await publish(current.progress);
    }
    if (current.controller.signal.aborted) throw new Error('cancelled');
    await cache.put(manifestURL, new Response(JSON.stringify(BOOK), {headers: {'Content-Type':'application/json'}}));
    await cache.put(markerURL, new Response(JSON.stringify({version: BOOK.version, savedAt: Date.now()}), {headers: {'Content-Type':'application/json'}}));
    current.progress = state('ready', {completed: BOOK.files.length, bytes: BOOK.totalBytes});
    await publish(current.progress);
    await keepPreviousEdition().catch(() => {});
  } catch (error) {
    const cancelled = current.controller.signal.aborted;
    const quota = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    current.progress = {...current.progress, phase: cancelled ? 'cancelled' : 'error', reason: quota ? 'space' : error?.name === 'SecurityError' ? 'storage' : 'network'};
    await publish(current.progress);
  } finally {if (job === current) job = null;}
}

self.addEventListener('message', event => {
  if (!event.data || event.data.channel !== 'juliet-offline') return;
  const reply = value => event.ports[0]?.postMessage(value);
  if (event.data.type === 'STATUS') event.waitUntil(status().then(reply).catch(() => reply(state('error', {reason: 'storage'}))));
  if (event.data.type === 'SAVE') {
    if (job) {reply(job.progress); return;}
    const current = {controller: new AbortController(), progress: state('saving')};
    job = current;
    reply(current.progress);
    event.waitUntil(saveBook(current));
  }
  if (event.data.type === 'CANCEL') {
    job?.controller.abort();
    reply(job?.progress || state('cancelled'));
  }
});

async function cachedAsset(url) {
  const names = await bookCaches();
  names.sort((a,b) => Number(b === cacheName) - Number(a === cacheName));
  for (const name of names) {
    const hit = await (await caches.open(name)).match(url, {ignoreSearch: true});
    if (hit) return hit;
  }
}
async function savedIndex() {
  const names = await bookCaches();
  names.sort((a,b) => Number(b === cacheName) - Number(a === cacheName));
  for (const name of names) {
    const cache = await caches.open(name);
    if (await cache.match(markerURL)) {
      const hit = await cache.match(indexURL);
      if (hit) return hit;
    }
  }
}
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(scope)) return;
  // Navigating online always asks the server first: no stale site shell lock-in.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => await savedIndex() || new Response('הספר עדיין לא נשמר במכשיר הזה. פתחו אותו עם חיבור לאינטרנט ובחרו שמירה לדרך.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
    return;
  }
  if (url.href.split('?')[0] === manifestURL) {
    event.respondWith(fetch(request).catch(async () => await cachedAsset(manifestURL) || Response.error()));
    return;
  }
  // Strictly local, generated-book assets. Remote music/auth requests pass untouched.
  const oldCore = url.pathname.startsWith(new URL('assets/',scope).pathname) && /\.(?:js|mjs|css)$/.test(url.pathname);
  if (!allowed.has(url.pathname) && !oldCore) return;
  url.search = '';
  // A newly published illustration/CSS must also win online, not just the HTML.
  event.respondWith(fetch(request).then(async response => response.ok ? response : await cachedAsset(url.href) || response).catch(async () => await cachedAsset(url.href) || Response.error()));
});
