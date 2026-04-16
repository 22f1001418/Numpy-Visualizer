/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: { 0: "var(--s0)", 1: "var(--s1)", 2: "var(--s2)", 3: "var(--s3)", 4: "var(--s4)" },
        txt: { primary: "var(--t1)", secondary: "var(--t2)", muted: "var(--t3)", inv: "var(--t-inv)" },
        edge: { DEFAULT: "var(--border)", strong: "var(--border-strong)" },
        d: { teal: "#14B8A6", coral: "#F97316", amber: "#fbbf24", emerald: "#34d399", violet: "#8B5CF6" },
        l: { teal: "#0D9488", coral: "#EA580C", amber: "#d97706", emerald: "#059669", violet: "#6D28D9" },
      },
      boxShadow: {
        glow: "0 0 20px 4px var(--glow)",
        "glow-sm": "0 0 10px 2px var(--glow)",
        panel: "0 4px 32px -4px rgba(0,0,0,0.3), 0 0 1px 0 rgba(0,0,0,0.1)",
        "panel-light": "0 4px 24px -4px rgba(0,0,0,0.08), 0 0 1px 0 rgba(0,0,0,0.06)",
      },
      backgroundSize: { grid: "32px 32px" },
      animation: {
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "slide-up": "slide-up 0.35s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 0px var(--glow)" },
          "50%": { boxShadow: "0 0 24px 6px var(--glow)" },
        },
        "slide-up": { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" }},
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 }},
      },
    },
  },
  plugins: [],
}
