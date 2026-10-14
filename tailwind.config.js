/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          50:  '#FFFBEB', 100:'#FEF3C7', 200:'#FDE68A', 300:'#FACC15',
          400: '#EAB308', 500:'#CA8A04', 600:'#A16207', 700:'#854D0E',
          800: '#713F12', 900: '#422006'
        },
        ink: {
          50:  '#F8FAFC', 100:'#F1F5F9', 200:'#E2E8F0', 300:'#CBD5E1',
          400: '#94A3B8', 500:'#64748B', 600:'#475569', 700:'#334155',
          800: '#1E293B', 900: '#0F172A'
        }
      }
    }
  },
  plugins: []
}
