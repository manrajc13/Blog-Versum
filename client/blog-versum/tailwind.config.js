/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#8c2bee',
        'accent-teal': '#2dd4bf',
        'accent-orange': '#f97316',
        'background-light': '#fdf8ff',
        'background-dark': '#191022',
        'bubbly-teal': '#4fd1c5',
        'whimsical-purple': '#6b46c1',
        secondary: '#06b6d4',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontWeight: {
        800: '800',
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '1.5rem',
        xl: '2.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
