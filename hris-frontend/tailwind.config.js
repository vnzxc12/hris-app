/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // this line is crucial
  ],
  darkMode: 'class', // enable dark mode support
  theme: {
    extend: {
      colors: {
        fern: '#5DBB63', // Custom fern green color
      },
    },
  },
  plugins: [],
}
