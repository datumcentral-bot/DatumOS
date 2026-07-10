/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Military Color Palette ──
      colors: {
        // Backgrounds
        'bg-dark':    '#0a0e14',
        'bg-panel':   '#0d1117',
        'bg-deeper':  '#050708',
        'bg-card':    'rgba(255,255,255,0.02)',

        // Olive / Army Green
        'olive':      '#6b8e23',
        'olive-dim':  '#556b2f',
        'olive-bright':'#a2d033',
        'olive-muted':'#3d5a3e',

        // Gold / Sand
        'gold':       '#c19749',
        'gold-bright':'#d4a853',
        'gold-dim':   '#8a6a2e',

        // Accents
        'tac-warning':'#ffb100',
        'tac-danger': '#ff3b30',
        'tac-success':'#28a745',
        'tac-info':   '#4cc9f0',
        'tac-red':    '#f05252',

        // Text
        'text-main':  '#f0f2f5',
        'text-dim':   '#94a3b8',
        'text-muted': '#4d584d',
      },

      // ── Military Fonts ──
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter:    ['Inter', 'sans-serif'],
        mono:     ['Orbitron', 'monospace'],
      },

      // ── Border Radius (sharp military style) ──
      borderRadius: {
        'none': '0',
        'sm':   '2px',
        DEFAULT:'4px',
        'md':   '4px',
        'lg':   '6px',
        'xl':   '8px',
        '2xl':  '8px',
        'full': '9999px',
      },

      // ── Box Shadows (glow effects) ──
      boxShadow: {
        'olive':   '0 0 15px rgba(107,142,35,0.3)',
        'olive-lg':'0 0 30px rgba(107,142,35,0.4)',
        'gold':    '0 0 15px rgba(193,151,73,0.3)',
        'danger':  '0 0 15px rgba(255,59,48,0.3)',
        'info':    '0 0 15px rgba(76,201,240,0.3)',
        'panel':   '0 8px 32px rgba(0,0,0,0.4)',
        'hud':     'inset 0 0 30px rgba(107,142,35,0.05)',
      },

      // ── Animations ──
      animation: {
        'shimmer':     'shimmer 2s infinite',
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'blink':       'blink-dot 1.5s ease-in-out infinite',
        'orbital-glow':'orbital-glow 3s ease-in-out infinite',
        'scan':        'scan 4s linear infinite',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'blink-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.2' },
        },
        'orbital-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(107,142,35,0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(107,142,35,0.6)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },

      // ── Spacing ──
      spacing: {
        'sidebar': '270px',
        'header':  '70px',
      },

      // ── Background Images ──
      backgroundImage: {
        'grid-overlay': `
          linear-gradient(rgba(107,142,35,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(107,142,35,0.03) 1px, transparent 1px)
        `,
        'radial-dark': 'radial-gradient(circle at center, #0d110d 0%, #050708 100%)',
        'gradient-olive': 'linear-gradient(135deg, rgba(107,142,35,0.2), rgba(85,107,47,0.2))',
        'gradient-gold':  'linear-gradient(135deg, rgba(193,151,73,0.2), rgba(138,106,46,0.2))',
      },

      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
