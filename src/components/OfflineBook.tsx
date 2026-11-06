import {useEffect, useId, useRef, useState} from 'react';
import {Icon} from './Icons';
import '../styles/offline-book.css';

interface BookManifest {schema: number; version: string; files: {path: string; bytes: number}[]; totalBytes: number; scenes: number; cleanPlates: number}
type Phase = 'idle' | 'preparing' | 'saving' | 'ready' | 'outdated' | 'partial' | 'cancelled' | 'error';
interface Progress {phase: Phase; version: string; completed: number; total: number; bytes: number; totalBytes: number; reason?: string}
const empty: Progress = {phase: 'idle',version:'',completed:0,total:0,bytes:0,totalBytes:0};

function request(worker: ServiceWorker, type: 'STATUS' | 'SAVE' | 'CANCEL'): Promise<Progress> {
  return new Promise((resolve,reject) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => {channel.port1.close(); reject(new Error('worker-timeout'));}, 15000);
    channel.port1.onmessage = event => {clearTimeout(timer); channel.port1.close(); resolve(event.data as Progress);};
    try {worker.postMessage({channel:'juliet-offline',type},[channel.port2]);}
    catch (error) {clearTimeout(timer); channel.port1.close(); reject(error);}
  });
}
function activated(registration: ServiceWorkerRegistration): Promise<ServiceWorker> {
  const worker = registration.installing || registration.waiting || registration.active;
  if (!worker) return Promise.reject(new Error('worker-missing'));
  if (worker.state === 'activated') return Promise.resolve(worker);
  return new Promise((resolve,reject) => {
    const done = () => {clearTimeout(timer); worker.removeEventListener('statechange', changed);};
    const changed = () => {
      if (worker.state === 'activated') {done(); resolve(worker);}
      else if (worker.state === 'redundant') {done(); reject(new Error('worker-redundant'));}
    };
    const timer = window.setTimeout(() => {done(); reject(new Error('worker-timeout'));},20000);
    worker.addEventListener('statechange',changed);
    changed();
  });
}

/** Parent Settings integration: <OfflineBook/>. No automatic book download. */
export function OfflineBook() {
  const [manifest,setManifest] = useState<BookManifest | null>(null);
  const [progress,setProgress] = useState<Progress>(empty);
  const [cancelRequested,setCancelRequested] = useState(false);
  const [unavailable,setUnavailable] = useState('');
  const metadata = useRef<BookManifest | null>(null);
  const worker = useRef<ServiceWorker | null>(null);
  const mounted = useRef(false);
  const statusId = useId();
  const base = new URL(import.meta.env.BASE_URL, window.location.href);
  const scriptURL = new URL('offline-book-sw.js',base).href;
  const manifestURL = new URL('offline-book-manifest.json',base).href;

  function apply(value: Progress) {
    if (!mounted.current) return;
    const outdated = value.phase === 'ready' && metadata.current && value.version !== metadata.current.version;
    setProgress(outdated ? {...value,phase:'outdated'} : value);
    if (value.phase !== 'saving') setCancelRequested(false);
  }
  async function fetchManifest() {
    const response = await fetch(manifestURL,{cache:'no-store',credentials:'omit'});
    if (!response.ok || !(response.headers.get('content-type') || '').includes('json')) throw new Error('manifest-unavailable');
    const value = await response.json() as BookManifest;
    if (value.schema !== 1 || value.scenes !== 48 || !value.files?.length) throw new Error('manifest-invalid');
    metadata.current = value;
    if (mounted.current) setManifest(value);
    return value;
  }

  useEffect(() => {
    mounted.current = true;
    if (import.meta.env.DEV) {setUnavailable('שמירה לדרך זמינה באתר המאובטח של הספר.'); return () => {mounted.current = false;};}
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !('caches' in window)) {
      setUnavailable('שמירה לדרך זמינה בדפדפן תומך ובכתובת המאובטחת של הספר.');
      return () => {mounted.current = false;};
    }
    const changed = (event: MessageEvent) => {
      const value = event.data;
      if (value?.channel === 'juliet-offline' && value.scope === base.href) apply(value as Progress);
    };
    navigator.serviceWorker.addEventListener('message',changed);
    // A small inventory request is allowed; images are fetched only after Save.
    void (async () => {
      try {await fetchManifest();} catch { /* Existing saved status is still useful offline. */ }
      try {
        const registration = await navigator.serviceWorker.getRegistration(base.href);
        if (registration?.scope === base.href && registration.active?.scriptURL === scriptURL) {
          worker.current = registration.active;
          apply(await request(registration.active,'STATUS'));
        }
      } catch {if (mounted.current) setProgress({...empty,phase:'error',reason:'storage'});}
    })();
    return () => {mounted.current = false; navigator.serviceWorker.removeEventListener('message',changed);};
  }, []);

  async function save() {
    if (progress.phase === 'preparing' || progress.phase === 'saving' || unavailable) return;
    setProgress(value => ({...value,phase:'preparing',reason:undefined}));
    setCancelRequested(false);
    try {
      await fetchManifest();
      const registration = await navigator.serviceWorker.register(scriptURL,{scope:base.pathname,updateViaCache:'none'});
      const active = await activated(registration);
      worker.current = active;
      // Persistence is a browser decision, not a requirement or a promise.
      void navigator.storage?.persist?.().catch(() => false);
      apply(await request(active,'SAVE'));
    } catch (error) {
      const quota = error instanceof DOMException && error.name === 'QuotaExceededError';
      if (mounted.current) setProgress(value => ({...value,phase:'error',reason:quota ? 'space' : 'network'}));
    }
  }
  async function cancel() {
    if (!worker.current) return;
    setCancelRequested(true);
    try {apply(await request(worker.current,'CANCEL'));}
    catch {if (mounted.current) {setCancelRequested(false); setProgress(value => ({...value,phase:'error',reason:'storage'}));}}
  }

  const busy = progress.phase === 'preparing' || progress.phase === 'saving';
  const totalBytes = manifest?.totalBytes || progress.totalBytes;
  const percent = progress.total ? Math.min(100,Math.round(progress.completed / progress.total * 100)) : 0;
  const labels: Record<Phase,string> = {
    idle:'אפשר לשמור את הסיפור והאיורים לקריאה בלי אינטרנט.',
    preparing:'מכינים את השמירה…',
    saving:cancelRequested ? 'עוצרים את ההורדה…' : `שומרים את הספר. ${progress.completed} מתוך ${progress.total} פריטים.`,
    ready:'הספר שמור במכשיר הזה ומוכן לדרך.',
    outdated:'יש ספר שמור. גרסה חדשה מחכה לעדכון.',
    partial:'חלק מהספר כבר שמור. נמשיך מאותה נקודה.',
    cancelled:'עצרנו. מה שכבר נשמר יחכה לפעם הבאה.',
    error:progress.reason === 'space' ? 'אין מספיק מקום לשמירת כל הספר. אפשר לפנות מקום במכשיר ולנסות שוב.' : progress.reason === 'storage' ? 'הדפדפן לא מאפשר כרגע שמירה במכשיר הזה.' : 'לא כל הספר נשמר. נבדוק את החיבור וננסה שוב.',
  };
  const action = progress.phase === 'ready' ? 'נרענן את השמירה' : progress.phase === 'outdated' ? 'נעדכן את הספר לדרך' : ['partial','cancelled','error'].includes(progress.phase) ? 'נמשיך לשמור את הספר' : 'נשמור את הספר לדרך';
  return <section className="offline-book" aria-labelledby={`${statusId}-title`}>
    <div className="offline-book-heading"><span className="offline-book-mark" aria-hidden="true"><Icon name="contents" size={19}/></span><div><h3 id={`${statusId}-title`}>הספר בא איתנו</h3><p>כל הסיפור, בכל מקום.</p></div></div>
    <p className="offline-book-status" id={statusId} role="status" aria-live="polite">{unavailable || labels[progress.phase]}</p>
    {progress.phase === 'saving' && <div className="offline-book-progress" role="progressbar" aria-label="שמירת הספר במכשיר" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{width:`${percent}%`}}/></div>}
    <div className="offline-book-controls"><button type="button" className="offline-book-save" onClick={save} disabled={busy || Boolean(unavailable)} aria-describedby={statusId}><Icon name={progress.phase === 'ready' ? 'check' : 'contents'} size={17}/>{busy ? 'שומרים…' : action}</button>{progress.phase === 'saving' && <button type="button" className="offline-book-cancel" onClick={cancel} disabled={cancelRequested}>עצירה</button>}{!busy && totalBytes > 0 && <span className="offline-book-size">כ־<bdi>{Math.ceil(totalBytes / 1048576)} MB</bdi></span>}</div>
    <p className="offline-book-note">המוזיקה ב־<bdi>Apple Music</bdi> וב־<bdi>Spotify</bdi> דורשת חיבור לאינטרנט.{busy ? ' נשאיר את הספר פתוח עד לסיום השמירה.' : ''}</p>
  </section>;
}
