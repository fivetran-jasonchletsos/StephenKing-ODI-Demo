import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Horror palette — coal blacks + paper-yellowed cream + dried-blood red
        ink:     "#0b0807",   // near-black, slightly warm
        coal:    "#161210",
        smoke:   "#2a2422",
        paper:   "#e9e1cf",   // pulp paperback cream
        bone:    "#c9bfa6",
        muted:   "#7d7568",
        blood:   "#7f1a14",   // dried blood
        ember:   "#a92d24",   // a touch brighter for highlights
        rust:    "#5a1410",
        sickly:  "#7a8a4a",   // sickly green for accents (Reanimator-coded)
      },
      fontFamily: {
        display: ["var(--font-rozha)", "Georgia", "Times New Roman", "serif"],
        sans:    ["var(--font-crimson)", "Georgia", "Times New Roman", "serif"],
        mono:    ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        type:    ["var(--font-special-elite)", "var(--font-jetbrains)", "monospace"],
        body:    ["var(--font-crimson)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
