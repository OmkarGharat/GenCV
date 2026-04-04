/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(500px)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
