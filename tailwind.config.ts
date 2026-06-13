import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F5F0EB",
          light: "#FAF7F2",
          dark: "#EDE8E2",
        },
        surface: {
          DEFAULT: "#FAF7F2",
          raised: "#FFFDF9",
          inset: "#E8E0D8",
          pressed: "#D8D0C8",
        },
        copper: {
          DEFAULT: "#C07850",
          dark: "#A06440",
          light: "#D8A080",
          muted: "#B89070",
        },
        ink: {
          DEFAULT: "#2D1F1E",
          light: "#6B5B4F",
          muted: "#9A8B7E",
        },
        sage: {
          DEFAULT: "#6B8F6B",
          dark: "#557055",
          light: "#8AAF8A",
        },
        clay: {
          DEFAULT: "#C07850",
          dark: "#A06440",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px #2D1F1E",
        "pixel-sm": "2px 2px 0px 0px #2D1F1E",
        "pixel-lg": "6px 6px 0px 0px #2D1F1E",
        "pixel-copper": "4px 4px 0px 0px #C07850",
        "pixel-copper-lg": "6px 6px 0px 0px #C07850",
        inset: "inset 2px 2px 0px 0px #D8D0C8",
      },
      borderRadius: {
        card: "12px",
        badge: "8px",
        btn: "8px",
      },
      borderWidth: {
        pixel: "2px",
        thick: "3px",
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
