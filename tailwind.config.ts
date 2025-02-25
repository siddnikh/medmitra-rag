import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        bounce: "bounce 1s infinite",
        blink: "blink 1.4s infinite",
        slideUp: "slideUp 0.3s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            "h1, h2, h3, h4": {
              fontFamily: `${theme("fontFamily.heading")}`,
            },
            "code, pre": {
              fontFamily: `${theme("fontFamily.mono")}`,
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;
