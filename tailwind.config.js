/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:         '#0A2540',
          'navy-mid':   '#1A3B5C',
          'navy-dark':  '#051423',
          teal:         '#00D4AA',
          'teal-light': '#00E8BC',
          'teal-dark':  '#00A884',
        },
        // Legacy aliases — keep so existing className="text-primary" etc. still work
        primary:   { DEFAULT: '#0A2540', light: '#1e3a5f', dark: '#051423' },
        accent:    { DEFAULT: '#00D4AA', light: '#00E8BC', dark: '#00A884' },
        secondary: '#1A3B5C',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Inter',
          'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
      },
      boxShadow: {
        card:      '0 1px 4px 0 rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 16px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 32px 0 rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        modal:     '0 25px 60px -10px rgba(0,0,0,0.24)',
        teal:      '0 4px 14px 0 rgba(0,212,170,0.28)',
        'teal-lg': '0 8px 24px 0 rgba(0,212,170,0.36)',
      },
      backgroundImage: {
        'brand-gradient':   'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
        'teal-gradient':    'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
        // Legacy
        'gradient-primary': 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
        'gradient-accent':  'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
      },
      keyframes: {
        fadeIn:          { from: { opacity: '0' },                               to: { opacity: '1' } },
        slideUp:         { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:       { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:           { '0%,100%': { transform: 'translateY(0)' },             '50%': { transform: 'translateY(-18px)' } },
        'bounce-gentle': { '0%,100%': { transform: 'translateY(0)' },             '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        fadeIn:          'fadeIn 0.2s ease',
        slideUp:         'slideUp 0.25s ease',
        slideDown:       'slideDown 0.2s ease',
        float:           'float 6s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

