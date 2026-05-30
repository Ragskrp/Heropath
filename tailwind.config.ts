import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ["var(--font-lexend)", "Lexend", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        ks3: {
          DEFAULT: "#06b6d4", // Vibrant teal/cyan
          dark: "#0891b2",
          light: "#ecfeff",
        },
        ks4: {
          DEFAULT: "#1e3a8a", // Deep navy/indigo
          dark: "#172554",
          light: "#dbeafe",
        },
        hero: {
          marvel: {
            red: "#e23636",
            gold: "#f39c12",
            blue: "#2980b9",
            dark: "#1a1a1a",
          },
          princess: {
            pink: "#ff7675",
            gold: "#ffeaa7",
            lavender: "#a29bfe",
            dark: "#2d3436",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
