import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // CSS variable bridge — use these in Tailwind classes
        bg:      "var(--bg)",
        surface: "var(--surface)",
        border:  "var(--border)",
        muted:   "var(--muted)",
        accent:  "var(--accent)",
        arc: {
          accent: "#00D395",
          purple: "#7C3AED",
        },
      },
    },
  },
  plugins: [],
};

export default config;
