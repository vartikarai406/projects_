/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resq: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          primary: '#0284c7', // Sky Blue
          critical: '#ef4444', // Red-500
          warning: '#f59e0b',  // Amber-500
          success: '#10b981',  // Emerald-500
          info: '#6366f1'     // Indigo-500
        }
      }
    },
  },
  plugins: [],
}
