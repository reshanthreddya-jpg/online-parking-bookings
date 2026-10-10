/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parking: {
          available: '#10b981', // Emerald
          occupied: '#ef4444',  // Rose / Red
          reserved: '#f59e0b',  // Amber
          maintenance: '#64748b'// Slate
        }
      }
    },
  },
  plugins: [],
}
