/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Avenir', 'sans-serif'],
      },
      colors: {
        'blue-100': '#B0C9EE',
      },
    },
  },
  plugins: [],
}

