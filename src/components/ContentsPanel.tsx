import {useLayoutEffect, useRef, useState} from 'react';
import {chapters, thumbnail, type ChapterId} from '../content/scenes';
import {Modal} from './Modal';
import {Icon} from './Icons';
import '../styles/navigation-polish.css';

export function ContentsPanel({current, onGo, onReplay, onClose}: {current: ChapterId; onGo: (id: ChapterId) => void; onReplay: () => void; onClose: () => void}) {
  const [act, setAct] = useState<1 | 2>(chapters.find(c => c.id === current)?.act || 1);
  const list = useRef<HTMLDivElement>(null);
  const currentChapter = chapters.find(c => c.id === current) || chapters[0];
  useLayoutEffect(() => {
    // Native dialogs have no layout until showModal(). Measure on the next
    // frame, and scroll only this list so the reading position stays intact.
    const position = () => {
      const container = list.current;
      if (!container) return;
      const selected = container.querySelector<HTMLElement>('[aria-current="location"]');
      if (!selected) {container.scrollTop = 0; return;}
      const outer = container.getBoundingClientRect(), item = selected.getBoundingClientRect();
      container.scrollTop += item.top - outer.top - (container.clientHeight - item.height) / 2;
    };
    let frame = 0;
    if (list.current?.closest('dialog')?.open) position();
    else frame = requestAnimationFrame(position);
    return () => cancelAnimationFrame(frame);
  }, [act, current]);
  return <Modal title="הסיפור שלנו" onClose={onClose} className="contents-modal full-contents">
    <div className="contents-location" aria-label="המקום שלנו בסיפור"><div><span>כאן אנחנו</span><strong>{currentChapter.title}</strong></div><bdi>{chapters.indexOf(currentChapter) + 1} / {chapters.length}</bdi></div>
    <div className="segmented act-tabs" role="group" aria-label="בחירת מערכה"><button aria-pressed={act === 1} onClick={() => setAct(1)}>מערכה ראשונה</button><button aria-pressed={act === 2} onClick={() => setAct(2)}>מערכה שנייה</button></div>
    <div ref={list} className="chapter-list" role="navigation" aria-label={`פרקי המערכה ${act === 1 ? 'הראשונה' : 'השנייה'}`}>{chapters.filter(c => c.act === act).map(c => <button key={c.id} className={c.id === current ? 'current' : ''} aria-current={c.id === current ? 'location' : undefined} onClick={() => onGo(c.id)} data-chapter-link={c.id}><span className="chapter-number">{String(chapters.indexOf(c) + 1).padStart(2, '0')}</span><img loading="lazy" src={thumbnail(c.beats[0].sourceScene)} alt=""/><div><span className="eyebrow">{c.subtitle}</span><h3>{c.title}</h3>{c.id === current && <span className="contents-current-marker"><Icon name="check" size={13}/>כאן אנחנו</span>}</div><Icon name="left"/></button>)}</div>
    <button className="text-button" onClick={onReplay}><Icon name="replay" size={18}/>נראה שוב את הקסם של הרגע הזה</button>
  </Modal>;
}
