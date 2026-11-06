import type { CSSProperties } from 'react';
export type IconName = 'left' | 'right' | 'music' | 'settings' | 'contents' | 'close' | 'play' | 'replay' | 'spark' | 'heart' | 'external' | 'check';
const paths: Record<IconName, React.ReactNode> = {
  left: <path d="m14 5-7 7 7 7M7 12h14"/>, right: <path d="m10 5 7 7-7 7M17 12H3"/>,
  music: <><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="18" cy="16" rx="3" ry="2.5"/></>,
  settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>,
  contents: <><path d="M4 5h11M4 12h11M4 19h11"/><circle cx="20" cy="5" r=".7"/><circle cx="20" cy="12" r=".7"/><circle cx="20" cy="19" r=".7"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>, play: <path d="m9 5 11 7-11 7Z"/>,
  replay: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,
  spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
  external: <><path d="M14 3h7v7M21 3l-11 11M11 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/></>,
  check: <path d="m4 12 5 5L20 6"/>,
};
export function Icon({name, size = 22, style}: {name: IconName; size?: number; style?: CSSProperties}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
