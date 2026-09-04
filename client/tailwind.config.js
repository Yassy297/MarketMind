/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0b13',
          900: '#0f1119',
          850: '#131522',
          800: '#171a2b',
          700: '#1e2136',
          600: '#282c47'
        },
        background: {
          DEFAULT: token('background'),
          secondary: token('background-secondary')
        },
        surface: {
          DEFAULT: token('surface'),
          elevated: token('surface-elevated'),
          hover: token('surface-hover')
        },
        line: {
          DEFAULT: token('border'),
          subtle: token('border-subtle')
        },
        fg: {
          DEFAULT: token('text-primary'),
          secondary: token('text-secondary'),
          muted: token('text-muted')
        },
        brand: {
          DEFAULT: token('brand'),
          hover: token('brand-hover'),
          subtle: token('brand-subtle')
        },
        positive: token('positive'),
        negative: token('negative'),
        warning: token('warning'),
        info: token('info'),
        focus: token('focus')
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      fontSize: {
        'page-title': ['1.75rem', { lineHeight: '2.15rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        'section-title': ['1.125rem', { lineHeight: '1.6rem', fontWeight: '600' }],
        'card-title': ['0.9375rem', { lineHeight: '1.35rem', fontWeight: '600' }]
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139, 92, 246, 0.12), 0 8px 24px -10px rgba(99, 102, 241, 0.28)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(79,70,229,0.14) 100%)'
      }
    }
  },
  plugins: []
};
