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
        // Deep teal — BD rivers at twilight
        primary: {
          DEFAULT: "#0d9488",
          50: "#0d2926",
          100: "#0f3632",
          200: "#134e4a",
          300: "#1a6b64",
          400: "#2aa69c",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#2dd4bf",
          800: "#5eead4",
          900: "#99f6e4",
          950: "#ccfbf1",
        },
        // Warm saffron accent — BD sunset gold
        accent: {
          DEFAULT: "#e6a444",
          50: "#261a08",
          100: "#3d2a0d",
          200: "#5c3f13",
          300: "#8a5f1d",
          400: "#c4882e",
          500: "#e6a444",
          600: "#edb85c",
          700: "#f4cc7a",
          800: "#f8dda0",
          900: "#fcedc8",
          950: "#fef7ec",
        },
        // Semantic — tuned for dark backgrounds
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        // Surfaces — midnight indigo depths
        surface: {
          DEFAULT: "#0a0f1c",
          50: "#060a13",
          100: "#0a0f1c",
          200: "#0f1629",
          300: "#141e36",
          400: "#1a2744",
          500: "#223352",
          600: "#2c4066",
          700: "#3a5280",
          800: "#5272a1",
          900: "#7a99c2",
          950: "#a8bdd9",
        },
        muted: {
          DEFAULT: "#141e36",
          foreground: "#7a8ba8",
        },
        card: {
          DEFAULT: "#111827",
          foreground: "#e8edf5",
        },
        // Midnight-first — cinematic depth
        background: "#060a13",
        foreground: "#e8edf5",
        border: "#1a2744",
        // Glass tint
        glass: "rgba(10, 15, 28, 0.88)",
        // Glow effects
        glow: {
          teal: "rgba(13, 148, 136, 0.25)",
          saffron: "rgba(230, 164, 68, 0.20)",
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
    },
  },
  plugins: [],
};
