import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,       // <--- INI WAJIB ADA biar bisa dibuka di Windows
    strictPort: true,
    port: 5173,       // Kita kunci di port 5173
  }
})