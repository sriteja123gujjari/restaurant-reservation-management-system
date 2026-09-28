/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#111827',
          light: '#FFFFFF',
          lighter: '#F3F4F6',
        },
        gold: {
          DEFAULT: '#B45309',
          soft: '#D97706',
          dim: '#92400E',
        },
        sage: {
          DEFAULT: '#059669',
          dim: '#047857',
        },
        brick: {
          DEFAULT: '#DC2626',
          dim: '#B91C1C',
        },
        paper: '#FFFFFF',
        text: {
          DEFAULT: '#111827',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        display: ['Newsreader', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
