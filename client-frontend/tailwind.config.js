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
        'gray-600': '#697B98',
        'black-900': '#0B1526',
      },
      fontWeight: {
        'book': '350',
      },
    },
  },
  plugins: [],
}

