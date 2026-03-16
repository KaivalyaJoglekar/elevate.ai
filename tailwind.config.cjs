/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './App.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#8b5cf6',
        'brand-blue': '#06b6d4',
        'brand-sun': '#fb923c',
        'light-text': '#f4f4f5',
        'subtle-text': '#a1a1aa',
        'dark-card': '#030305',
        'bg-primary': '#030305',
        'accent-primary': '#8b5cf6',
        'accent-secondary': '#06b6d4',
      },
      animation: {
        'float-slow': 'floatSlow 9s ease-in-out infinite',
        'float-delayed': 'floatSlow 11s ease-in-out infinite 1.4s',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s infinite',
        'border-dance': 'borderDance 3s ease-in-out infinite',
        'line-reveal': 'lineReveal 0.8s ease-out forwards',
        'mask-reveal': 'maskReveal 1s cubic-bezier(0.25, 0.1, 0, 1) forwards',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderDance: {
          '0%, 100%': { borderColor: '#8b5cf6' },
          '50%': { borderColor: '#06b6d4' },
        },
        lineReveal: {
          'from': { transform: 'scaleX(0)' },
          'to': { transform: 'scaleX(1)' },
        },
        maskReveal: {
          'from': { clipPath: 'inset(0 100% 0 0)' },
          'to': { clipPath: 'inset(0 0 0 0)' },
        },
      },
      fontFamily: {
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
        signature: ['var(--font-signature)', 'Caveat', 'cursive'],
        serif: ['var(--font-cormorant)', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
