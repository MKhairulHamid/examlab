/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2540',
          light: '#1e3a5f',
          dark: '#051423',
        },
        accent: {
          DEFAULT: '#00D4AA',
          light: '#00E8BC',
          dark: '#00A884',
        },
        secondary: '#1A3B5C',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

