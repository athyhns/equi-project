/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], 
      },
      colors: {
        equi: {
          light: '#FFF5F7', 
          main: '#FF5E89',  
          dark: '#2D3748',   
          accent: '#7F5AD5', 
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(255, 94, 137, 0.2)', 
      }
    },
  },
  plugins: [],
}