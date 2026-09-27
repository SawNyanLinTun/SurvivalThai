// Runtime theming: every color in tailwind.config.js reads a CSS variable
// holding "R G B" channels, which applyTheme() fills from the chosen theme.

export const THEME_FIELDS = ['primary', 'accent', 'highlight', 'success', 'background', 'text'];

export const FONTS = ['Plus Jakarta Sans', 'Nunito', 'Poppins', 'Lexend'];

export const PRESETS = [
  { id: 'orchid', name: 'Orchid & Marigold', primary: '#5B4BDB', accent: '#FBBF3C', highlight: '#FF6B5B', success: '#16A34A', background: '#FFF9F2', text: '#1F1B2E' },
  { id: 'classic', name: 'Classic Thai Blue', primary: '#1E6B9E', accent: '#D4A574', highlight: '#C94B4B', success: '#2D7D5C', background: '#F8FAFB', text: '#1A1A1A' },
  { id: 'jade', name: 'Jade Temple', primary: '#0F766E', accent: '#EAB308', highlight: '#EA580C', success: '#15803D', background: '#F4FAF8', text: '#132522' },
  { id: 'lotus', name: 'Lotus Pink', primary: '#C2255C', accent: '#F59F00', highlight: '#7048E8', success: '#2B8A3E', background: '#FFF6F9', text: '#2B1520' },
  { id: 'andaman', name: 'Andaman Sea', primary: '#0369A1', accent: '#22D3EE', highlight: '#F97316', success: '#059669', background: '#F3F9FD', text: '#0B2233' },
  { id: 'saffron', name: 'Saffron Robe', primary: '#C2410C', accent: '#FACC15', highlight: '#9F1239', success: '#4D7C0F', background: '#FFFAF3', text: '#2A1608' },
  { id: 'rice', name: 'Rice Field', primary: '#3F7D20', accent: '#E0A526', highlight: '#B5563B', success: '#2F855A', background: '#F8F8EF', text: '#1D2415' },
  { id: 'night', name: 'Night Market', primary: '#8B7BFF', accent: '#FDE047', highlight: '#FB7185', success: '#4ADE80', background: '#15131F', text: '#F1EEFF' },
];

export const DEFAULT_THEME = { preset: 'orchid', font: 'Plus Jakarta Sans', ...pickColors(PRESETS[0]) };

const STORAGE_KEY = 'theme';
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
// Which shade the chosen color itself becomes, matching how components use each scale
const BASE_STEP = { primary: 600, accent: 400, highlight: 500, success: 600 };

export function pickColors(p) {
  return Object.fromEntries(THEME_FIELDS.map((k) => [k, p[k]]));
}

export function isValidHex(h) {
  return /^#[0-9a-f]{6}$/i.test(h);
}

const toRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const channels = (rgb) => rgb.join(' ');
const luminance = (rgb) =>
  rgb
    .map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    })
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const INK = [22, 20, 31];

function scale(base, baseStep, surface, dark) {
  const bi = STEPS.indexOf(baseStep);
  return STEPS.map((step, i) => {
    if (i === bi) return base;
    if (i < bi) return mix(base, surface, 0.95 * Math.sqrt((bi - i) / bi));
    // On dark themes the "700" shade is used as text on tints, so lighten it instead
    if (dark && step === 700) return mix(base, WHITE, 0.35);
    return mix(base, BLACK, (0.7 * (i - bi)) / (STEPS.length - 1 - bi));
  });
}

export function themeVariables(theme) {
  const bg = toRgb(theme.background);
  const text = toRgb(theme.text);
  const dark = luminance(bg) < 0.18;
  const surface = dark ? mix(bg, WHITE, 0.06) : WHITE;
  const vars = {
    '--c-page': channels(bg),
    '--c-surface': channels(surface),
    '--c-ink': channels(text),
    '--c-ink-muted': channels(mix(text, bg, 0.4)),
    '--c-ink-faint': channels(mix(text, bg, 0.62)),
    '--font-sans': `'${theme.font}'`,
  };
  for (const [name, step] of Object.entries(BASE_STEP)) {
    const base = toRgb(theme[name]);
    scale(base, step, surface, dark).forEach((rgb, i) => {
      vars[`--c-${name}-${STEPS[i]}`] = channels(rgb);
    });
    vars[`--c-on-${name}`] = channels(contrast(base, WHITE) >= contrast(base, INK) ? WHITE : INK);
  }
  return { vars, dark };
}

export function applyTheme(theme) {
  const { vars, dark } = themeVariables(theme);
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.primary);
}

export function loadTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && THEME_FIELDS.every((k) => isValidHex(saved[k]))) {
      return { ...DEFAULT_THEME, ...saved };
    }
  } catch {
    // ignore unreadable storage
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // storage may be unavailable (private mode); the theme still applies for this visit
  }
}
