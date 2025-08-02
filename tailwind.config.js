/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High contrast colors for accessibility
        'high-contrast': {
          'text': '#000000',
          'bg': '#FFFFFF',
          'primary': '#000080',
          'secondary': '#800000',
          'accent': '#008000',
          'warning': '#FF8C00',
          'error': '#DC143C',
        },
        // Dark high contrast theme
        'high-contrast-dark': {
          'text': '#FFFFFF',
          'bg': '#000000',
          'primary': '#87CEEB',
          'secondary': '#FFB6C1',
          'accent': '#90EE90',
          'warning': '#FFD700',
          'error': '#FF6347',
        }
      },
      fontFamily: {
        'accessible': ['Arial', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        'accessible': ['1.125rem', { lineHeight: '1.5' }],
        'accessible-lg': ['1.25rem', { lineHeight: '1.4' }],
      },
      spacing: {
        'focus': '3px',
      },
      boxShadow: {
        'focus-visible': '0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.8)',
        'focus-visible-high-contrast': '0 0 0 4px #000000, 0 0 0 2px #FFFFFF',
      }
    },
  },
  plugins: [],
};
