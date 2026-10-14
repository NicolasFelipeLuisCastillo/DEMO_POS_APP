import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite picks this up when running `tauri dev`
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: '0.0.0.0',
    hmr: { protocol: 'ws', host: 'localhost', port: 1421 },
    watch: { ignored: ['**/src-tauri/**'] }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
