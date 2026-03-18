/**
 * Icons — Untitled UI line icon paths rendered via react-native-svg
 * Source: https://www.untitledui.com/free-icons
 * Style: Line (stroke-based, 24x24 viewBox)
 * Usage: <Icon name="home" size={24} color="#000" strokeWidth={1.8} />
 */
import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

const PATHS = {
  // Navigation
  home: (c, sw) => (
    <>
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1V9.5z"
        stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  activity: (c, sw) => (
    <>
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  barChart: (c, sw) => (
    <>
      <Line x1="18" y1="20" x2="18" y2="10" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="12" y1="20" x2="12" y2="4"  stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="6"  y1="20" x2="6"  y2="14" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  pieChart: (c, sw) => (
    <>
      <Path d="M21.21 15.89A10 10 0 118 2.83" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Path d="M22 12A10 10 0 0012 2v10z"      stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  settings: (c, sw) => (
    <>
      <Path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"
        stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={sw} fill="none" />
    </>
  ),
  plus: (c, sw) => (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="5"  y1="12" x2="19" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  plusCircle: (c, sw) => (
    <>
      <Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={sw} fill="none" />
      <Line x1="12" y1="8" x2="12" y2="16" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="8"  y1="12" x2="16" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  // Transactions
  arrowUp: (c, sw) => (
    <>
      <Line x1="12" y1="19" x2="12" y2="5" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Polyline points="5 12 12 5 19 12" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  arrowDown: (c, sw) => (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Polyline points="19 12 12 19 5 12" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  trendingUp: (c, sw) => (
    <>
      <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="17 6 23 6 23 12" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // User / Profile
  user: (c, sw) => (
    <>
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={c} strokeWidth={sw} fill="none" />
    </>
  ),
  // Wallet / Finance
  wallet: (c, sw) => (
    <>
      <Path d="M20 12V8H6a2 2 0 010-4h14v4" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 6v12a2 2 0 002 2h14v-4" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="18" y1="12" x2="18" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  creditCard: (c, sw) => (
    <>
      <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke={c} strokeWidth={sw} fill="none" />
      <Line x1="1" y1="10" x2="23" y2="10" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  // Calendar
  calendar: (c, sw) => (
    <>
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={c} strokeWidth={sw} fill="none" />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="8"  y1="2" x2="8"  y2="6" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="3"  y1="10" x2="21" y2="10" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  // Misc
  eye: (c, sw) => (
    <>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={sw} fill="none" />
    </>
  ),
  trash: (c, sw) => (
    <>
      <Polyline points="3 6 5 6 21 6" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11v6M14 11v6" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" />
    </>
  ),
  bell: (c, sw) => (
    <>
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" />
    </>
  ),
  close: (c, sw) => (
    <>
      <Line x1="18" y1="6"  x2="6"  y2="18" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="6"  y1="6"  x2="18" y2="18" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  check: (c, sw) => (
    <>
      <Polyline points="20 6 9 17 4 12" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  edit: (c, sw) => (
    <>
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  moon: (c, sw) => (
    <>
      <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  sun: (c, sw) => (
    <>
      <Circle cx="12" cy="12" r="5" stroke={c} strokeWidth={sw} fill="none" />
      <Line x1="12" y1="1"  x2="12" y2="3"  stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="12" y1="21" x2="12" y2="23" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="1" y1="12" x2="3"  y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="21" y1="12" x2="23" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  coins: (c, sw) => (
    <>
      <Circle cx="8" cy="8" r="6" stroke={c} strokeWidth={sw} fill="none" />
      <Path d="M18.09 10.37A6 6 0 1110.34 18" stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" />
      <Path d="M7 6h1v4" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="16.71" y1="13.88" x2="17" y2="14" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
  menu: (c, sw) => (
    <>
      <Line x1="3" y1="12" x2="21" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="3" y1="6"  x2="21" y2="6"  stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="3" y1="18" x2="21" y2="18" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),
};

export default function Icon({ name, size = 24, color = '#000', strokeWidth = 1.8 }) {
  const renderPaths = PATHS[name];
  if (!renderPaths) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderPaths(color, strokeWidth)}
    </Svg>
  );
}
