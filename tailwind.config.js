/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#e1e9f0',
          200: '#c3d3e0',
          300: '#a5bdd0',
          400: '#2c5282',
          500: '#1e40af',
          600: '#003366',
          700: '#1a2544',
          800: '#0f1929',
          900: '#050a0f',
        },
      },
    },
  },
  plugins: [],
}
