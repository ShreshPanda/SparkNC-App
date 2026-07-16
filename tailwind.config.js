/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        mint: '#22c55e',
        gold: '#fbbf24',
        mist: '#f8fafc',
      },
    },
  },
  plugins: [],
};
