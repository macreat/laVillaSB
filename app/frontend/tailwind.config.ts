import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (mapped to the La Villa palette, see docs/architecture/design-system.md)
        bg: '#050b18',
        surface: '#0b1630',
        'surface-elevated': '#11213f',
        text: '#e9eef8',
        'text-muted': '#93a5c9',
        accent: '#4f83f1',
        'accent-hover': '#6e99f4',
        border: '#1d3057',
        danger: '#a81c13',
        // Brand palette
        villa: {
          black: '#050b18',
          ink: '#0b1630',
          bone: '#e9eef8',
          fox: '#4f83f1',
          blood: '#a81c13',
          maroon: '#132b5e',
          slime: '#a8d24a',
          teal: '#2aa8c9',
          smoke: '#93a5c9',
        },
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-anton)', 'Impact', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
