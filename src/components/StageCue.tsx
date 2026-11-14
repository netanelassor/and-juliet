import type {CSSProperties} from 'react';
import {Icon, type IconName} from './Icons';
import '../styles/stage-cue.css';

export function StageCue({x, y, label, icon = 'spark', onActivate}: {
  x: number; y: number; label: string; icon?: IconName; onActivate: () => void;
}) {
  return <button type="button" className="stage-cue" style={{left: `${x}%`, top: `${y}%`} as CSSProperties}
    aria-label={label} title={label} data-premium-gesture="true" onClick={onActivate}>
    <Icon name={icon} size={20}/>
  </button>;
}
