/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          bg: '#F1F0FA',
          card: '#FFFFFF',
          navy: '#1B1B3A',
          muted: '#8A8AA8',
          pink: '#FF5FA2',
          violet: '#8B5CF6',
          blue: '#3B82F6',
          mintBg: '#DDF8EA',
          mintText: '#16A34A',
          peachBg: '#FFE9D6',
          peachText: '#EA580C',
          coral: '#FF4D4F',
          sidebarActive: '#ECEAF8',
          trackGrey: '#EAE9F2',
        }
      },
      borderRadius: {
        'card': '26px',
        'card-lg': '28px',
      },
      boxShadow: {
        'soft': '0 20px 40px rgba(99, 102, 241, 0.08)',
        'soft-hover': '0 24px 48px rgba(99, 102, 241, 0.14)',
        'coral-glow': '0 10px 24px rgba(255, 77, 79, 0.35)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
