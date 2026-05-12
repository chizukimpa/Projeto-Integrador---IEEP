/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: { blue: '#00427A', green: '#2E7D32', brown: '#795548', light: '#F3F4F6' }
      }
    },
  },
  plugins: [],
}