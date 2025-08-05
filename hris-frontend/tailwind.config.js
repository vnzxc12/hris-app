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
      fontFamily: {
  spartan: ['"League Spartan"', 'sans-serif'],
  segoe: ['"Segoe UI"', 'system-ui', 'sans-serif'],
  'segoe-semibold': ['"Segoe UI Semibold"', '"Segoe UI"', 'system-ui', 'sans-serif'],
  'segoe-regular': ['"Segoe UI"', 'system-ui', 'sans-serif'],
},

    },
  },
  plugins: [],
};
