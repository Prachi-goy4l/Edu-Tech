/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          surface: '#1e1e1e',
          card: '#282828',
          border: '#383838',
          hover: '#333333',
        },
        leetcode: {
          yellow: '#ffa116',
          green: '#2cbb5d',
          red: '#ef4743',
          blue: '#007aff',
        }
      }
    },
  },
  plugins: [],
}
