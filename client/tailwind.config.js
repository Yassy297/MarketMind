/** @type {import('tailwindcss').Config} */
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139, 92, 246, 0.15), 0 8px 30px -8px rgba(99, 102, 241, 0.35)',
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 24px -12px rgba(0,0,0,0.5)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.18) 100%)'
      }
    }
  },
  plugins: []
};
