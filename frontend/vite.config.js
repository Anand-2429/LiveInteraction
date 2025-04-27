import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},        // Fake process.env
    global: 'window',
  },
  server:{
    host:true,
    allowedHosts: [
      '0a72-2409-4089-aacd-4c82-203d-30c9-6317-3217.ngrok-free.app'
    ]

    
  }
})
