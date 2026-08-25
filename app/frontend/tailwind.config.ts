import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (mapped to the La Villa palette, see docs/architecture/design-system.md)
        bg: '#0a0a0a',
        surface: '#161311',
        'surface-elevated': '#211d19',
        text: '#ede6d6',
        'text-muted': '#8c8577',
        accent: '#d96830',
        'accent-hover': '#e97e42',
        border: '#2a2622',
        danger: '#a81c13',
        // Brand palette
        villa: {
          black: '#0a0a0a',
          ink: '#161311',
          bone: '#ede6d6',
          fox: '#d96830',
          blood: '#a81c13',
          maroon: '#5e2434',
          slime: '#a8a432',
          teal: '#1f7a8c',
          smoke: '#8c8577',
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
