/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Full Color Scales ──
      colors: {
        // Backgrounds
        'bg-dark':    '#0a0e14',
        'bg-panel':   '#0d1117',
        'bg-deeper':  '#050708',
        'bg-card':    'rgba(255,255,255,0.02)',

        // Olive / Army Green (full scale)
        'olive':      '#6b8e23',
        'olive-50':   '#f9fce8',
        'olive-100':  '#f2f7d0',
        'olive-200':  '#e5efa1',
        'olive-300':  '#d4e76b',
        'olive-400':  '#bcd93d',
        'olive-500':  '#a2d033',
        'olive-600':  '#8aad2a',
        'olive-700':  '#6b8e23',
        'olive-800':  '#556b2f',
        'olive-900':  '#3d501f',
        'olive-950':  '#263014',

        // Gold / Sand (full scale)
        'gold':       '#c19749',
        'gold-bright':'#d4a853',
        'gold-dim':   '#8a6a2e',
        'sand':       '#f5f0e8',
        'sand-50':    '#fdfcf8',
        'sand-100':   '#faf7ef',
        'sand-200':   '#f5f0e8',
        'sand-300':   '#e8dfd3',
        'sand-400':   '#d6cbb8',
        'sand-500':   '#c4b89e',
        'sand-600':   '#a99a7e',
        'sand-700':   '#8a7e6b',
        'sand-800':   '#6b6153',
        'sand-900':   '#4d453b',
        'sand-950':   '#2d2822',

        // Accents
        'tac-warning':'#ffb100',
        'tac-danger': '#ff3b30',
        'tac-success':'#28a745',
        'tac-info':   '#4cc9f0',
        'tac-red':    '#f05252',

        // Health status
        'health-red':    '#ff3b30',
        'health-green':  '#28a745',
        'health-amber':  '#ffb100',

        // Surface
        'surface-muted': 'rgba(255,255,255,0.04)',
        'surface-sunken':'rgba(255,255,255,0.02)',
        'surface-white': '#ffffff',

        // Line / border
        'line': 'rgba(107,142,35,0.2)',

        // Text
        'text-main':  '#f0f2f5',
        'text-dim':   '#94a3b8',
        'text-muted': '#4d584d',

        // ── HUD (dark blue-grey) scale ──
        'hud-50':   '#f8fafc',
        'hud-100':  '#e2e8f0',
        'hud-200':  '#cbd5e1',
        'hud-300':  '#94a3b8',
        'hud-400':  '#64748b',
        'hud-500':  '#475569',
        'hud-600':  '#334155',
        'hud-700':  '#1e293b',
        'hud-800':  '#151b26',
        'hud-900':  '#0a0e14',
        'hud-950':  '#020617',
        'hud-line': 'rgba(148,163,184,0.2)',
        'hud-card': 'rgba(10,14,20,0.6)',

        // ── Accent (cyan) scale ──
        'accent-50':  '#ecfeff',
        'accent-100': '#cffafe',
        'accent-200': '#a5f3fc',
        'accent-300': '#67e8f9',
        'accent-400': '#4cc9f0',
        'accent-500': '#22d3ee',
        'accent-600': '#06b6d4',
        'accent-700': '#0891b2',
        'accent-800': '#0e7490',
        'accent-900': '#155e75',
        'accent-950': '#083344',

        // ── Brand (teal) scale ──
        'brand-50':  '#f0fdfa',
        'brand-100': '#ccfbf1',
        'brand-200': '#99f6e4',
        'brand-300': '#5eead4',
        'brand-400': '#2dd4bf',
        'brand-500': '#14b8a6',
        'brand-600': '#0d9488',
        'brand-700': '#0f766e',
        'brand-800': '#115e59',
        'brand-900': '#134e4a',
        'brand-950': '#042f2e',

        // ── Slate (default text backgrounds) ──
        'slate-50':  '#f8fafc',
        'slate-100': '#f1f5f9',
        'slate-200': '#e2e8f0',
        'slate-300': '#cbd5e1',
        'slate-400': '#94a3b8',
        'slate-500': '#64748b',
        'slate-600': '#475569',
        'slate-700': '#334155',
        'slate-800': '#1e293b',
        'slate-900': '#0f172a',
        'slate-950': '#020617',
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
