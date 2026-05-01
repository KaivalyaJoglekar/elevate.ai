import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base blacks
        "ev-black": "#000000",
        "ev-black-2": "#030303",
        "ev-surface": "#070707",
        "ev-elevated": "#0B0B0B",
        "ev-card": "#0E0E0E",
        "ev-card-hover": "#121212",

        // Text
        "ev-text": "#F5F5F0",
        "ev-text-secondary": "#A8A8A0",
        "ev-text-muted": "#6F6F68",

        // Accent cyan
        "ev-gold": "#00D4FF",
        "ev-gold-soft": "#7EE8FA",
        "ev-gold-dim": "#0098B8",

        // Semantic
        "ev-success": "#4ADE80",
        "ev-warning": "#FBBF24",
        "ev-danger": "#F87171",
        "ev-info": "#60A5FA",

        // Borders
        "ev-border": "rgba(255,255,255,0.08)",
        "ev-border-strong": "rgba(255,255,255,0.14)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(0, 212, 255, 0.08)",
        "glow-gold-lg": "0 0 40px rgba(0, 212, 255, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "grid-move": "gridMove 20s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gridMove: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
