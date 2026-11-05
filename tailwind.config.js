/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          700: "#1c2233",
          800: "#131826",
          900: "#0a0d16",
        },
        accent: {
          indigo: { DEFAULT: "#6366f1", light: "#a5b4fc" },
          emerald: { DEFAULT: "#10b981", light: "#6ee7b7" },
        },
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
