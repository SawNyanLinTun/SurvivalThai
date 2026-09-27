/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'thai-blue': '#1E6B9E',
        'thai-gold': '#D4A574',
        'thai-green': '#2D7D5C',
        'thai-red': '#C94B4B',
        'light-bg': '#F8FAFB',
        'dark-text': '#1A1A1A',
      },
      fontFamily: {
        'myanmar': ['Padauk', 'sans-serif'],
        'english': ['Inter', 'sans-serif'],
        'thai': ['Prompt', 'sans-serif'],
      },
      fontSize: {
        'sm-my': '14px',
        'base-my': '17px',
        'lg-my': '20px',
      },
      lineHeight: {
        'myanmar': '1.6',
      }
    },
  },
  plugins: [],
}
