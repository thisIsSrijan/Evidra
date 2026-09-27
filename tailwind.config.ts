import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1210",
          soft: "#171B18",
        },
        "ink-soft": "#171B18",
        bone: "#F5F1E8",
        moss: {
          DEFAULT: "#3F5A44",
          bright: "#6B8F6E",
        },
        "moss-bright": "#6B8F6E",
        clay: "#D98E4A",
        mist: "#9AA79D",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Fraunces", "serif"],
        sans: [
          "'General Sans'",
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
