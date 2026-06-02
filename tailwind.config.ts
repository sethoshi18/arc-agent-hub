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
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        arc: {
          bg:       "#0A0A0A",
          card:     "#111111",
          border:   "#1F1F1F",
          muted:    "#888888",
          accent:   "#00D395",   // USDC green
          purple:   "#7C3AED",
        },
      },
    },
  },
  plugins: [],
};

export default config;
