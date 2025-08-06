/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // this line is crucial
  ],
    safelist: ['text-olivegreen', 'bg-olivegreen'], // ⬅️ Add this line
  darkMode: 'class', // enable dark mode support
  theme: {
    extend: {
      colors: {
        fern: '#5DBB63',       // Custom green
        olivegreen: '#6a8932', // Used in Personal Details tab
        charcoal: '#36454F',   // Deep gray
        skyblue: '#87CEEB',    // Light blue for accents
        softgray: '#f5f5f5',   // Light background
        midnight: '#121063',   // Deep blue, useful for dark mode headers
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
