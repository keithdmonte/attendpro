import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: base should match your repository name
// If repo is "attendpro", use '/attendpro/'
// If repo is "yourusername.github.io", use '/'
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' 
    ? (process.env.VITE_BASE_PATH || '/attendpro/') 
    : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
