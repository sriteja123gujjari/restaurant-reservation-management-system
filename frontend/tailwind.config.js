/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#17262B',
          light: '#22383F',
          lighter: '#2C444C',
        },
        gold: {
          DEFAULT: '#C9A227',
          soft: '#E4C766',
          dim: '#8A701C',
        },
        sage: {
          DEFAULT: '#7FA089',
          dim: '#5C7A66',
        },
        brick: {
          DEFAULT: '#C1443D',
          dim: '#8E322C',
        },
        paper: '#F3EEDF',
        text: {
          DEFAULT: '#EDE7D9',
          muted: '#9FB0AF',
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
