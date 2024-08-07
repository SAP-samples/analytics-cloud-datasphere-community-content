import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env.NODE_ENV": `'${process.env.NODE_ENV}'`
  },
  plugins: [react()],
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/index.jsx',
      name: 'SACFileUploadWidget',
      formats: ['iife'] // iife stands for Immediately Invoked Function Expression
    },
    minify: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js',
  }
})
