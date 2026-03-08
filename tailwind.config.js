/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Barlow Condensed'", "'Arial Narrow'", "sans-serif"],
      },
      colors: {
        court: {
          bg: "#0a0e1a",
          card: "#0f1629",
          border: "#1e293b",
          muted: "#334155",
        },
        team: {
          home: "#0ea5e9",
          away: "#f43f5e",
        },
        role: {
          OH: "#f97316",
          OPP: "#a855f7",
          MB: "#3b82f6",
          S: "#10b981",
          L: "#f59e0b",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 3s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
    },
  },
  plugins: [],
};
