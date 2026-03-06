import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        body: ["Crimson Pro", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        night: "#0a0812",
        deep: "#12101a",
        card: "#1a1625",
        "card-hover": "#221e2e",
        purple: "#2D1B6B",
        gold: "#F5A623",
        "gold-dim": "#c4851c",
        amber: "#FF8C00",
        red: "#E94560",
        teal: "#0FB8AD",
        violet: "#8B5CF6",
        mint: "#10B981",
        muted: "#8892B0",
        offwhite: "#e8e4ef",
        parchment: "#f4e4c1",
        ink: "#1a1625",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(245,166,35,0.3)" },
          "50%": { opacity: "0.9", boxShadow: "0 0 30px rgba(245,166,35,0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "card": "0 4px 24px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4)",
        "gold": "0 0 20px rgba(245,166,35,0.3)",
        "gold-strong": "0 0 30px rgba(245,166,35,0.5)",
      },
    },
  },
  plugins: [],
} satisfies Config;
