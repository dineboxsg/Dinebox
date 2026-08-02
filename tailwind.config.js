/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FFA726',
          50: '#FFF8E8',
          100: '#FFEDC4',
          200: '#FFE0A8',
          300: '#FFD07F',
          400: '#FFB852',
          500: '#FFA726',
          600: '#F08A0E',
          700: '#C76E08',
          800: '#9A540A',
          900: '#7D440C',
        },
        charcoal: {
          DEFAULT: '#1C1C1C',
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#C2C2C2',
          300: '#9A9A9A',
          400: '#6B6B6B',
          500: '#4A4A4A',
          600: '#3A3A3A',
          700: '#2E2E2E',
          800: '#232323',
          900: '#1C1C1C',
        },
        cream: '#F8F1E7',
        beige: '#EFE6D8',
        'warm-white': '#FFFDF9',
        'muted-text': '#6F6A63',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-up-sm': 'slideUpSmall 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpSmall: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
