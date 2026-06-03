import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["IBM Plex Mono", "monospace"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        bg:      "var(--bg)",
        surface: "var(--surface)",
        border:  "var(--border)",
        muted:   "var(--muted)",
        accent:  "var(--accent)",
        gold:    "var(--gold)",
      },
    },
  },
  plugins: [],
};

export default config;
