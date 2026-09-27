/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Orchid & Marigold" palette
        orchid: {
          50: '#F5F3FF',
          100: '#EBE7FF',
          200: '#D6CEFF',
          300: '#B8A9FF',
          400: '#8F7BFA',
          500: '#6D5DF6',
          600: '#5B4BDB',
          700: '#4A3BB8',
          800: '#382C8C',
          900: '#261E5E',
        },
        marigold: {
          100: '#FFF1D6',
          200: '#FFE0A3',
          400: '#FBBF3C',
          500: '#F5A524',
          600: '#D98A0B',
          700: '#A86A06',
        },
        coral: {
          100: '#FFE4E0',
          400: '#FF8A7D',
          500: '#FF6B5B',
          600: '#E5503F',
          700: '#B83A2C',
        },
        mint: {
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        cream: '#FFF9F2',
        ink: {
          DEFAULT: '#1F1B2E',
          muted: '#6B6680',
          faint: '#A7A3B5',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Padauk', 'Prompt', 'sans-serif'],
        myanmar: ['Padauk', 'sans-serif'],
        thai: ['Prompt', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(31, 27, 46, 0.04), 0 8px 24px -8px rgba(31, 27, 46, 0.10)',
        lift: '0 2px 4px rgba(31, 27, 46, 0.05), 0 16px 40px -12px rgba(91, 75, 219, 0.28)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
