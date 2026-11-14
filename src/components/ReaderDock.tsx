import {allBeats, type Beat} from '../content/scenes';
import {Icon} from './Icons';

export function ReaderDock({beat, nextLabel, locked, onBack, onNext, onContents}: {
  beat: Beat; nextLabel: string; locked: boolean;
  onBack: () => void; onNext: () => void; onContents: () => void;
}) {
  const total = allBeats.length;
  return <footer className="reader-footer" inert={locked}>
    <button className="back-button" onClick={onBack} aria-label="אחורה"><Icon name="right" size={21}/><span>אחורה</span></button>
    <button className="reader-position" onClick={onContents} aria-label={`בחירת סצנה. סצנה ${beat.sourceScene} מתוך ${total}`}>
      <Icon name="contents" size={18}/>
      <span><b>מערכה {beat.act === 1 ? 'ראשונה' : 'שנייה'}</b><span className="reader-position-title">{beat.title}</span></span>
      <bdi className="reader-counter">{String(beat.sourceScene).padStart(2, '0')}<span> / </span>{total}</bdi>
    </button>
    <button className="next-button" onClick={onNext} aria-label={nextLabel} data-testid="next"><span>{nextLabel}</span><Icon name="left" size={22}/></button>
    <div className="reader-progress" role="progressbar" aria-label="ההתקדמות בסיפור" aria-valuenow={beat.sourceScene} aria-valuemin={1} aria-valuemax={total}>
      <i style={{width: `${beat.sourceScene / total * 100}%`}}/>
    </div>
  </footer>;
}
