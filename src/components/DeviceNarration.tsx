import { useEffect, useId, useRef, useState } from 'react';
import '../styles/premium-narration.css';

interface DeviceNarrationProps {
  scene: number;
  paragraphs: string[];
  onStart: () => void;
  onHighlight: (index: number | null) => void;
  stopSignal: number;
}

type VoiceAvailability = 'checking' | 'ready' | 'unavailable';

function hebrewVoice(voices: SpeechSynthesisVoice[]) {
  const hebrew = voices.filter(voice => /^he(?:-|$)/i.test(voice.lang.replaceAll('_', '-')));
  return hebrew.find(voice => voice.lang.toLowerCase().replaceAll('_', '-') === 'he-il' && voice.localService)
    || hebrew.find(voice => voice.localService)
    || hebrew.find(voice => voice.default)
    || hebrew[0];
}

export function DeviceNarration({scene, paragraphs, onStart, onHighlight, stopSignal}: DeviceNarrationProps) {
  const [availability, setAvailability] = useState<VoiceAvailability>('checking');
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState('');
  const helpId = useId();
  const run = useRef(0);
  const mounted = useRef(false);
  // Keep the active native utterance alive and detach handlers before cancellation.
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const callbacks = useRef({onStart, onHighlight});
  const paragraphKey = paragraphs.join('\u0000');
  useEffect(() => {callbacks.current = {onStart, onHighlight};}, [onStart, onHighlight]);

  function stop() {
    run.current += 1;
    const current = utterance.current;
    utterance.current = null;
    if (current) {
      current.onstart = null; current.onend = null; current.onerror = null;
      window.speechSynthesis?.cancel();
    }
    if (mounted.current) {setSpeaking(false); setMessage('');}
    callbacks.current.onHighlight(null);
  }

  useEffect(() => {
    mounted.current = true;
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      setAvailability('unavailable');
      return () => {mounted.current = false;};
    }
    const synth = window.speechSynthesis;
    let settled = false;
    function updateVoices() {
      const voices = synth.getVoices();
      if (hebrewVoice(voices)) {setAvailability('ready'); settled = true;}
      else if (voices.length || settled) setAvailability('unavailable');
    }
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);
    // Some browsers expose their list immediately, others emit voiceschanged later.
    const timer = window.setTimeout(() => {settled = true; updateVoices();}, 1200);
    const visibilityChanged = () => {if (document.hidden) stop();};
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('pagehide', stop);
    return () => {
      mounted.current = false;
      window.clearTimeout(timer);
      synth.removeEventListener('voiceschanged', updateVoices);
      document.removeEventListener('visibilitychange', visibilityChanged);
      window.removeEventListener('pagehide', stop);
      stop();
    };
  }, []);

  useEffect(() => {stop();}, [scene, paragraphKey, stopSignal]);

  function toggle() {
    if (speaking) {stop(); return;}
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      setAvailability('unavailable'); return;
    }
    const synth = window.speechSynthesis;
    const voice = hebrewVoice(synth.getVoices());
    if (!voice) {setAvailability('unavailable'); return;}
    const lines = paragraphs.map((text, index) => ({text: text.trim(), index})).filter(line => line.text);
    if (!lines.length) return;
    stop();
    callbacks.current.onStart();
    setAvailability('ready');
    setSpeaking(true);
    setMessage('מכינים את הקול…');
    const token = run.current;
    function readParagraph(position: number) {
      if (run.current !== token || !mounted.current || document.hidden) return;
      if (position >= lines.length) {
        utterance.current = null;
        setSpeaking(false); setMessage('');
        callbacks.current.onHighlight(null);
        return;
      }
      const line = lines[position];
      const next = new SpeechSynthesisUtterance(line.text);
      next.voice = voice;
      next.lang = voice.lang;
      next.rate = 0.9;
      next.pitch = 1;
      next.onstart = () => {
        if (run.current !== token) return;
        setMessage('הקראה בקול המכשיר');
        callbacks.current.onHighlight(line.index);
      };
      next.onend = () => {if (run.current === token) readParagraph(position + 1);};
      next.onerror = event => {
        if (run.current !== token) return;
        stop();
        if (event.error === 'language-unavailable' || event.error === 'voice-unavailable') {
          setAvailability('unavailable'); setMessage('');
        } else setMessage('ההקראה לא התחילה. אפשר לנסות שוב.');
      };
      utterance.current = next;
      try {synth.speak(next);}
      catch {stop(); setMessage('ההקראה לא התחילה. אפשר לנסות שוב.');}
    }
    // This starts only inside the reader's explicit tap, never from an effect.
    readParagraph(0);
  }

  const help = availability === 'unavailable' ? 'אין כרגע קול עברי במכשיר הזה' : message || (availability === 'checking' ? 'בודקים אם יש קול עברי…' : 'בקול המכשיר');
  return <div className={`device-narration ${speaking ? 'device-narration-active' : ''}`}>
    <button type="button" className="device-narration-toggle" onClick={toggle} aria-pressed={speaking} aria-describedby={helpId} disabled={availability === 'checking'}>
      {speaking ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>}
      <span>{speaking ? 'עוצרים את ההקראה' : 'מקריאים לי'}</span>
    </button>
    <span className="device-narration-help" id={helpId} role="status" aria-live="polite">{help}</span>
  </div>;
}
