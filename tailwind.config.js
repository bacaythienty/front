/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medBlue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffd',
          300: '#7cc3fc',
          400: '#32a2fa',
          500: '#0884eb',
          600: '#0267c7',
          700: '#0352a1',
          800: '#074685',
          900: '#0c3b6e',
        }
      }
    },
  },
  plugins: [],
}
