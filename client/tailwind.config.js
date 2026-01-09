/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Set Poppins jadi default
      },
      colors: {
        equi: {
          light: '#FFF5F7',  // Background pink tipis banget
          main: '#FF5E89',   // Pink cerah modern
          dark: '#2D3748',   // Teks gelap (bukan hitam pekat)
          accent: '#7F5AD5', // Ungu buat gradasi
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(255, 94, 137, 0.2)', // Bayangan pink halus
      }
    },
  },
  plugins: [],
}