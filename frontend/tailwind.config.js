/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        card: "rgba(255,255,255,0.72)",
        "card-dark": "rgba(15,23,42,0.84)",
        popover: "#ffffff",
        "popover-foreground": "#0F172A",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          foreground: "#ffffff",
        },
        muted: "#E2E8F0",
        "muted-foreground": "#64748B",
        accent: "#0EA5E9",
        "accent-foreground": "#ffffff",
        destructive: "#EF4444",
        "destructive-foreground": "#ffffff",
        border: "#CBD5E1",
        input: "#E2E8F0",
        ring: "#2563EB",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      boxShadow: {
        glass: "0 20px 50px rgba(15, 23, 42, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
}
