/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        vt323: ['VT323', 'monospace'],
      },
      colors: {
        // ...existing color extensions
      },
      spacing: {
        // ...existing spacing extensions
      },
      // ...existing theme extensions
    },
  },
  plugins: [
    // ...existing plugins
  ],
}