import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icons';

export function Modal({title, onClose, children, className = ''}: {title: string; onClose: () => void; children: ReactNode; className?: string}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdropPress = useRef(false);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = dialog.current!;
    if (!el.open) el.showModal();
    return () => {
      if (el.open) el.close();
      if (previous?.isConnected) previous.focus({preventScroll: true});
    };
  }, []);
  function outsidePanel(element: HTMLDialogElement, x: number, y: number) {
    const box = element.getBoundingClientRect();
    return x < box.left || x > box.right || y < box.top || y > box.bottom;
  }
  return <dialog ref={dialog} className={`modal ${className}`} aria-labelledby={titleId}
    onCancel={e => { e.preventDefault(); onClose(); }}
    onPointerDown={e => { backdropPress.current = e.target === e.currentTarget && outsidePanel(e.currentTarget, e.clientX, e.clientY); }}
    onPointerCancel={() => {backdropPress.current = false;}}
    onClick={e => {
      const dismiss = backdropPress.current && e.target === e.currentTarget && outsidePanel(e.currentTarget, e.clientX, e.clientY);
      backdropPress.current = false;
      if (dismiss) onClose();
    }}>
    <header className="modal-header"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="סגירה"><Icon name="close"/></button></header>
    {children}
  </dialog>;
}
