
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve('./node_modules/react'),

    },
  },
  server: {
    host: "0.0.0.0",
    port: 5176,
    // strictPort: true,
    // open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5056',
        // target: 'https://project-booking-calendar-nk-r1.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
