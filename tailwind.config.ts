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
        display: ["Roboto", "system-ui", "sans-serif"],
        body: ["Roboto", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg:      "var(--bg)",
        surface: "var(--surface)",
        border:  "var(--border)",
        muted:   "var(--muted)",
        accent:  "var(--accent)",
      },
    },
  },
  plugins: [],
};

export default config;
