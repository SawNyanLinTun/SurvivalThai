/** @type {import('tailwindcss').Config} */

// Colors come from CSS variables ("R G B" channels) set at runtime by
// src/theme/themes.js, so learners can switch themes without a rebuild.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
const shades = (name) =>
  Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => [s, v(`${name}-${s}`)]));

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: shades('primary'),
        accent: shades('accent'),
        highlight: shades('highlight'),
        success: shades('success'),
        'on-primary': v('on-primary'),
        'on-accent': v('on-accent'),
        'on-highlight': v('on-highlight'),
        page: v('page'),
        surface: v('surface'),
        ink: {
          DEFAULT: v('ink'),
          muted: v('ink-muted'),
          faint: v('ink-faint'),
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Padauk', 'Prompt', 'sans-serif'],
        myanmar: ['Padauk', 'sans-serif'],
        thai: ['Prompt', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.10)',
        lift: '0 2px 4px rgb(0 0 0 / 0.05), 0 16px 40px -12px rgb(var(--c-primary-600) / 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
