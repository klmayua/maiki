/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Elite Dark Mode Theme - Navy/Charcoal Base
        navy: {
          950: '#0a0c12',
          900: '#101218',
          800: '#161922',
          700: '#1e2129',
          600: '#252a33',
          500: '#2f3541',
          400: '#3d4451',
          300: '#5a6270',
          200: '#8a92a3',
          100: '#c4c9d4',
          50: '#f0f2f5',
        },
        // Teal Accent - CTAs, Primary Actions
        teal: {
          600: '#00b894',
          500: '#00d4aa',
          400: '#33e0bf',
          300: '#66ebd4',
          200: '#99f5e8',
          glow: 'rgba(0, 212, 170, 0.4)',
        },
        // Gold Accent - Premium, Featured
        gold: {
          600: '#d4a72c',
          500: '#f4c430',
          400: '#f7d35f',
          300: '#f9e28f',
          glow: 'rgba(244, 196, 48, 0.4)',
        },
        // Text colors
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        // Legacy compatibility
        maiki: {
          950: '#0a0c12',
          900: '#101218',
          800: '#161922',
          700: '#1e2129',
          600: '#252a33',
          500: '#2f3541',
          400: '#3d4451',
          300: '#5a6270',
          200: '#8a92a3',
          100: '#c4c9d4',
          50: '#f0f2f5',
        },
        // Slate for neutral grays
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: '1rem',
        '2xl': '1.5rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        // Shimmer animation for featured content
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Glow pulse for CTAs
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px -5px rgba(0, 212, 170, 0.4)" },
          "50%": { boxShadow: "0 0 40px -5px rgba(0, 212, 170, 0.6)" },
        },
        // Gold glow for premium
        "gold-glow": {
          "0%, 100%": { boxShadow: "0 0 20px -5px rgba(244, 196, 48, 0.4)" },
          "50%": { boxShadow: "0 0 40px -5px rgba(244, 196, 48, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Subtle border glow
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(0, 212, 170, 0.2)" },
          "50%": { borderColor: "rgba(0, 212, 170, 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "gold-glow": "gold-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        // Elite navy gradient
        'navy-gradient': 'linear-gradient(135deg, #101218 0%, #161922 50%, #0a0c12 100%)',
        // Teal glow gradient
        'teal-glow': 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, transparent 50%)',
        // Shimmer for featured cards
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
