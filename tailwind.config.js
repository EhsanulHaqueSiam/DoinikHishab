/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  important: true,
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Deep teal — primary action color
        primary: {
          DEFAULT: "#0d9488",
          50: "#0a1f1d",
          100: "#0c2b28",
          200: "#0f3d39",
          300: "#14564f",
          400: "#1a7a71",
          500: "#0d9488",
          600: "#14b8a6",
          700: "#2dd4bf",
          800: "#5eead4",
          900: "#99f6e4",
          950: "#ccfbf1",
        },
        // Warm saffron — accent for amounts and highlights
        accent: {
          DEFAULT: "#e6a444",
          50: "#1c1408",
          100: "#2e210d",
          200: "#4a3514",
          300: "#73521f",
          400: "#a87a2d",
          500: "#e6a444",
          600: "#edb85c",
          700: "#f4cc7a",
          800: "#f8dda0",
          900: "#fcedc8",
          950: "#fef7ec",
        },
        // Semantic
        success: { DEFAULT: "#34d399", dark: "#065f46" },
        warning: { DEFAULT: "#fbbf24", dark: "#78350f" },
        danger: { DEFAULT: "#f87171", dark: "#7f1d1d" },
        // Layered surfaces — each step is a distinct depth
        surface: {
          DEFAULT: "#0c1021",
          50: "#070b16",    // deepest void
          100: "#0c1021",   // base surface
          200: "#111827",   // card
          300: "#1a2332",   // elevated card / section header
          400: "#222e3f",   // hover / pressed
          500: "#2d3b4e",   // active elements
          600: "#3b4d63",   // subtle dividers
          700: "#4e6381",   // muted icons
          800: "#6b83a3",   // secondary text
          900: "#8ea3c0",   // muted text
          950: "#b4c5da",   // label text
        },
        // Simplified semantic aliases
        muted: {
          DEFAULT: "#1a2332",
          foreground: "#8ea3c0",
        },
        card: {
          DEFAULT: "#111827",
          foreground: "#eaf0f9",
        },
        background: "#070b16",
        foreground: "#eaf0f9",
        border: "#1e2a3a",
        // Glass overlay
        glass: "rgba(12, 16, 33, 0.85)",
        // Subtle glow tokens
        glow: {
          teal: "rgba(13, 148, 136, 0.20)",
          saffron: "rgba(230, 164, 68, 0.15)",
          danger: "rgba(248, 113, 113, 0.15)",
          success: "rgba(52, 211, 153, 0.15)",
        },
      },
      fontFamily: {
        sans: ["SpaceMono"],
        mono: ["SpaceMono"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      fontSize: {
        "2xs": "10px",
        "hero": "36px",
      },
    },
  },
  plugins: [],
};
