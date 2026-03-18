// ── LIGHT THEME — ColorHunt F6F0D7 · C5D89D · 9CAB84 · 89986D ───────────────
// Warm parchment base · soft sage greens · muted olive
export const lightColors = {
  bg:          '#F6F0D7',   // warm parchment
  surface:     '#FDFAF0',   // soft off-white card
  surface2:    '#EDE8CE',   // deeper parchment
  accent:      '#9CAB84',   // sage green
  accentLight: '#7A8B68',   // light sage
  accentDark:  '#89986D',   // deep olive sage
  gold:        '#89986D',   // olive gold
  goldLight:   '#C5D89D',   // light sage as gold alt
  navy:        '#3D4A2E',   // deep olive navy
  crimson:     '#8B3A3A',   // muted dusty crimson
  activePill:  '#3D4A2E',   // deep olive for active
  textPrimary: '#2C3320',   // deep forest text
  textMuted:   '#7A8B68',   // muted sage text
  expense:     '#8B3A3A',   // muted red
  income:      '#4A6741',   // forest green
  border:      '#DDD9C2',   // warm parchment border
  wineRed:     '#8B3A3A',
  chartGreen:  '#9CAB84',
  chartRed:    '#EE5622',   // Donut Red
  chartBlue:   '#6B80A0',
  chartGold:   '#B8A96A',
  chartTeal:   '#5A8A7A',
  chartPurple: '#8A7A9A',
  chartOrange: '#B87A50',
  chartSlate:  '#7A8B68',
  div: '#797D81', 
};

// ── DARK THEME — Designer Modern (#222629 based) ─────────────────────────────
export const darkColors = {
  bg:          '#222222',   // deepest charcoal
  surface:     '#474B47',   // dark grey
  surface2:    '#6B6E70',   // grey
  accent:      '#AEB784',   // sage pop highlight
  accentLight: '#AEB784',   // bright green
  accentDark:  '#61892F',   // deep forest green
  gold:        '#AEB784',   // primary highlight (pop)
  goldLight:   '#AEB784',   // highlight fallback
  navy:        '#222629',   // dark grey
  crimson:     '#9E5A5A',   // semantic crimson
  activePill:  '#222629',   // contrast text for green cards
  textPrimary: '#FFFFFF',   // white for accessibility
  textMuted:   '#6B6E70',   // grey text
  expense:     '#B07070',   // semantic muted red
  income:      '#AEB784',   // green pop
  border:      'rgba(107, 110, 112, 0.3)', // subtle grey border
  wineRed:     '#B07070',
  chartGreen:  '#7A9E7E',
  chartRed:    '#B10F2E',   // Donut Red
  chartBlue:   '#5A7AAA',
  chartGold:   '#C4A882',
  chartTeal:   '#5A8A8A',
  chartPurple: '#8A7AAA',
  chartOrange: '#C4906A',
  chartSlate:  '#8A9AAA',
  div: '#797D81',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 18, xl: 24, pill: 100,
};

export const fonts = {
  regular: 'Fungis-Regular',
  bold:    'Fungis-Bold',
  heavy:   'Fungis-Heavy',
};

// Backward compat
export const colors = lightColors;
