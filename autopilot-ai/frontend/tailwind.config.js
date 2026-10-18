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
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          sidebar: "#070A12",
          surface: "#1A2234",
          hover: "#242F47"
        },
        brand: {
          primary: "#6366F1",   // Indigo
          secondary: "#8B5CF6", // Violet
          accent: "#38BDF8",    // Sky
          success: "#10B981",   // Emerald
          warning: "#F59E0B",   // Amber (approval-required)
          danger: "#F43F5E",    // Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
